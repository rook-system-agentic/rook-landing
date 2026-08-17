import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  classifyBlogSource,
  isDegradedBlogSource,
  mergeBlogPosts,
  resolveBlogCollection,
  resolveBlogListState,
  resolveMissingSlugBehavior,
} from "../src/lib/blog-source.mjs";

// ROO-1116 — a queda do blog para os posts locais era silenciosa.
//
// O que estes testes travam são os TRÊS CASOS que precisavam ser distinguidos
// e nunca eram: consulta falhou, consulta respondeu vazia, consulta respondeu
// com artigos. Mais o quarto que existe de fato (Supabase não configurado) e
// que não pode ser confundido com os outros.
//
// A segunda metade lê os arquivos de origem. É ali que está o dente contra o
// código antigo: os testes puros acima não reprovariam a versão anterior por
// um motivo bobo — o módulo `blog-source.mjs` não existia. As asserções de
// fiação reprovam de verdade, sobre os mesmos caminhos de arquivo.

function post(slug, overrides = {}) {
  return {
    slug,
    title: slug,
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    category: "CMV",
    tags: [],
    ...overrides,
  };
}

const LOCAIS = [post("local-a"), post("local-b"), post("local-c")];

test("consulta que FALHOU é 'fallback' e carrega o motivo", () => {
  const { posts, status } = resolveBlogCollection({
    outcome: "failed",
    remotePosts: [],
    localPosts: LOCAIS,
    reason: "HTTP 404",
    checkedAt: "2026-08-15T12:00:00.000Z",
  });

  assert.equal(status.source, "fallback");
  assert.equal(status.degraded, true);
  assert.equal(status.reason, "HTTP 404");
  assert.equal(status.remotePostCount, 0);
  assert.equal(status.servedPostCount, 3);
  assert.equal(status.checkedAt, "2026-08-15T12:00:00.000Z");
  // A página continua de pé — isso nunca foi o defeito.
  assert.equal(posts.length, 3);
});

test("consulta que respondeu VAZIA é 'empty', e 'empty' não é degradado", () => {
  const { status } = resolveBlogCollection({
    outcome: "ok",
    remotePosts: [],
    localPosts: LOCAIS,
  });

  assert.equal(status.source, "empty");
  assert.equal(status.degraded, false);
  // Ausência de motivo: não houve falha para explicar.
  assert.equal(status.reason, null);
  assert.equal(status.remotePostCount, 0);
});

test("consulta que respondeu COM POSTS é 'live'", () => {
  const { posts, status } = resolveBlogCollection({
    outcome: "ok",
    remotePosts: [post("remoto-1"), post("remoto-2")],
    localPosts: LOCAIS,
  });

  assert.equal(status.source, "live");
  assert.equal(status.degraded, false);
  assert.equal(status.remotePostCount, 2);
  assert.equal(status.servedPostCount, 5);
  assert.equal(posts.length, 5);
});

test("Supabase sem configuração não se confunde com falha nem com vazio", () => {
  const { status } = resolveBlogCollection({
    outcome: "unconfigured",
    localPosts: LOCAIS,
    reason: "sem SUPABASE_URL/chave",
  });

  assert.equal(status.source, "unconfigured");
  assert.equal(status.degraded, true);
  assert.notEqual(status.source, "fallback");
  assert.notEqual(status.source, "empty");

  assert.equal(classifyBlogSource("unconfigured", 0), "unconfigured");
  assert.equal(classifyBlogSource("failed", 0), "fallback");
  assert.equal(classifyBlogSource("ok", 0), "empty");
  assert.equal(classifyBlogSource("ok", 1), "live");
  assert.throws(() => classifyBlogSource("talvez", 0), /desconhecido/);

  assert.equal(isDegradedBlogSource("live"), false);
  assert.equal(isDegradedBlogSource("empty"), false);
  assert.equal(isDegradedBlogSource("fallback"), true);
  assert.equal(isDegradedBlogSource("unconfigured"), true);
});

test("a mesclagem preserva o comportamento antigo: remoto vence, só publicados, mais novo primeiro", () => {
  const merged = mergeBlogPosts(
    [
      post("compartilhado", { title: "versão local" }),
      post("so-local", { publishedAt: "2026-01-01T00:00:00.000Z" }),
    ],
    [
      post("compartilhado", { title: "versão do CMS" }),
      post("rascunho", { status: "draft" }),
      post("recente", { publishedAt: "2026-08-01T00:00:00.000Z" }),
    ],
  );

  assert.deepEqual(
    merged.map((item) => item.slug),
    ["recente", "compartilhado", "so-local"],
  );
  assert.equal(merged[1].title, "versão do CMS");
});

test("slug ausente só vira 404 quando a origem respondeu", () => {
  const saudavel = resolveBlogCollection({ outcome: "ok", remotePosts: [post("x")] }).status;
  const vazia = resolveBlogCollection({ outcome: "ok", remotePosts: [] }).status;
  const caida = resolveBlogCollection({ outcome: "failed", reason: "falha de rede" }).status;
  const semConfig = resolveBlogCollection({ outcome: "unconfigured" }).status;

  assert.equal(resolveMissingSlugBehavior(saudavel), "not-found");
  assert.equal(resolveMissingSlugBehavior(vazia), "not-found");
  // O ponto da issue: com a origem caída não dá para afirmar que o artigo
  // não existe. 404 aqui desindexa artigo vivo.
  assert.equal(resolveMissingSlugBehavior(caida), "temporarily-unavailable");
  assert.equal(resolveMissingSlugBehavior(semConfig), "temporarily-unavailable");
});

test("lista vazia tem um estado por causa, e a origem caída não vira 'nenhum artigo'", () => {
  const saudavel = resolveBlogCollection({ outcome: "ok", remotePosts: [post("x")] }).status;
  const caida = resolveBlogCollection({ outcome: "failed", reason: "HTTP 500" }).status;

  assert.equal(
    resolveBlogListState({ postCount: 3, hasCategoryFilter: false, status: saudavel }),
    "has-posts",
  );
  assert.equal(
    resolveBlogListState({ postCount: 0, hasCategoryFilter: true, status: saudavel }),
    "category-empty",
  );
  assert.equal(
    resolveBlogListState({ postCount: 0, hasCategoryFilter: false, status: saudavel }),
    "catalog-empty",
  );
  // Mesmo com filtro de categoria: se a origem caiu, o motivo é a origem.
  assert.equal(
    resolveBlogListState({ postCount: 0, hasCategoryFilter: true, status: caida }),
    "source-unavailable",
  );
  assert.equal(
    resolveBlogListState({ postCount: 0, hasCategoryFilter: false, status: caida }),
    "source-unavailable",
  );
});

test("a queda deixa sinal no log e o estado sai numa rota que dá para consultar", async () => {
  const [blog, statusRoute, postsRoute] = await Promise.all([
    readFile(new URL("../src/lib/blog.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/blog/status/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/blog/posts/route.ts", import.meta.url), "utf8"),
  ]);

  // Critério 1: falha produz sinal, e sinal de incidente é `error`.
  assert.match(blog, /console\.error\("\[ROO-1116\]/);
  // O `console.warn("[blog] Falling back...")` engolia a queda no ruído.
  assert.doesNotMatch(blog, /console\.warn\("\[blog\]/);
  assert.doesNotMatch(blog, /Falling back to local posts/);
  // O corpo cru do erro do PostgREST fica no log, nunca na resposta pública.
  assert.match(blog, /detail: remote\.detail/);

  // Critério 2: dá para responder de fora, sem abrir o código.
  assert.match(statusRoute, /getBlogSourceStatus/);
  assert.match(statusRoute, /status\.degraded \? 503 : 200/);
  assert.match(statusRoute, /"x-rook-blog-source"/);
  assert.match(statusRoute, /force-dynamic/);
  assert.match(postsRoute, /source: status/);
  assert.match(postsRoute, /"x-rook-blog-source"/);

  // Nenhum caminho pode voltar a devolver o post sem o estado junto.
  assert.doesNotMatch(blog, /export async function getPostBySlug/);
  assert.match(blog, /export async function findPostBySlug/);
});

test("as telas e a API do slug decidem pelo estado da origem, não pelo silêncio", async () => {
  const [artigo, listagem, slugRoute] = await Promise.all([
    readFile(new URL("../src/app/blog/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/blog/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/blog/posts/[slug]/route.ts", import.meta.url), "utf8"),
  ]);

  // Critério 4: 404 deixou de ser incondicional.
  assert.match(artigo, /missingBehavior === "temporarily-unavailable"/);
  assert.match(artigo, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(artigo, /const post = await getPostBySlug\(params\.slug\);\s*\n\s*if \(!post\) notFound\(\);/);
  assert.match(slugRoute, /unavailable \? 503 : 404/);
  assert.match(slugRoute, /"Retry-After": "60"/);

  // Critério 3: a lista vazia parou de ter uma explicação só.
  assert.match(listagem, /resolveBlogListState/);
  assert.match(listagem, /Não conseguimos carregar os artigos agora\./);
  assert.match(listagem, /Nenhum artigo publicado nesta categoria\./);
  assert.match(listagem, /Ainda não publicamos nenhum artigo\./);
});
