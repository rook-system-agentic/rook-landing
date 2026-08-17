// ROO-1116 — a queda do blog para os posts locais era silenciosa.
//
// O blog lê os artigos do Supabase e, quando a consulta falha, cai para a
// semente editorial local (`src/content/blog-posts.ts`). A página continua de
// pé — o que é bom —, mas até aqui o único vestígio era um `console.warn`.
// Em homologação a tabela `blog_posts` nem existe: a LP servia três artigos
// locais como se estivesse tudo certo, e ninguém tinha como saber.
//
// Este módulo isola a decisão em código puro, sem `fetch` e sem Next, para
// que os três casos que precisam ser distinguidos fiquem travados em teste:
//
//   1. a consulta FALHOU            -> `fallback`     (degradado)
//   2. a consulta funcionou e VEIO VAZIA -> `empty`    (saudável, sem artigo)
//   3. a consulta funcionou e VEIO COM POSTS -> `live` (saudável)
//
// Existe um quarto estado, `unconfigured`: sem `SUPABASE_URL`/chave não houve
// consulta nenhuma. Na máquina de quem desenvolve isso é o normal; em produção
// é erro de configuração. Ele não pode ser confundido com `fallback` (onde a
// consulta foi tentada e quebrou) nem com `live`.
//
// Espelha o padrão que o catálogo comercial já usa em
// `src/lib/public-billing-catalog.mjs` + `billing-catalog-server.ts`: lógica
// pura no `.mjs`, efeito e log no `.ts`, campo `source` viajando na resposta.

/** Estado da origem dos artigos, do mais saudável ao mais degradado. */
export const BLOG_SOURCE_STATES = ["live", "empty", "fallback", "unconfigured"];

/**
 * Degradado = o que está na tela pode não ser o que está publicado.
 * `empty` NÃO é degradado: a consulta respondeu, a resposta foi "não há nada".
 */
export function isDegradedBlogSource(source) {
  return source === "fallback" || source === "unconfigured";
}

export function classifyBlogSource(outcome, remoteCount) {
  if (outcome === "unconfigured") return "unconfigured";
  if (outcome === "failed") return "fallback";
  if (outcome !== "ok") {
    throw new TypeError(`Resultado de consulta desconhecido: ${outcome}`);
  }
  return remoteCount > 0 ? "live" : "empty";
}

function publishedFirst(a, b) {
  const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  return dateB - dateA;
}

/**
 * Junta semente local e artigos remotos, com o remoto ganhando por slug.
 *
 * A semente local continua sendo piso mesmo quando a consulta funciona. É
 * deliberado: os três artigos locais já estão indexados, e passar a servir só
 * o remoto os transformaria em 404 no dia em que não estivessem no CMS.
 * O preço é que a lista nunca fica vazia na tela — por isso o estado real da
 * origem viaja separado, no `status`, em vez de ser inferido do tamanho da
 * lista. Quando os três forem migrados para o CMS, esvaziar a semente é
 * seguro e o piso deixa de existir sozinho.
 */
export function mergeBlogPosts(localPosts, remotePosts) {
  const bySlug = new Map(localPosts.map((post) => [post.slug, post]));
  for (const post of remotePosts) {
    bySlug.set(post.slug, post);
  }

  return Array.from(bySlug.values())
    .filter((post) => post.status === "published")
    .sort(publishedFirst);
}

/**
 * Resolve a coleção servida e o diagnóstico da origem numa tacada só.
 *
 * `reason` é o motivo curto e sem segredo da falha ("HTTP 404", "network"),
 * feito para poder sair numa resposta pública. O erro cru fica no log.
 */
export function resolveBlogCollection({
  outcome,
  remotePosts = [],
  localPosts = [],
  reason = null,
  checkedAt = new Date().toISOString(),
}) {
  const source = classifyBlogSource(outcome, remotePosts.length);
  const posts = mergeBlogPosts(localPosts, remotePosts);

  return {
    posts,
    status: {
      source,
      degraded: isDegradedBlogSource(source),
      remotePostCount: remotePosts.length,
      localPostCount: localPosts.length,
      servedPostCount: posts.length,
      reason: isDegradedBlogSource(source) ? reason : null,
      checkedAt,
    },
  };
}

/**
 * O que fazer com um slug que não foi encontrado.
 *
 * DECISÃO (ROO-1116): 404 só quando a origem respondeu.
 *
 * Um 404 é uma afirmação forte — diz ao leitor e ao Google que aquele artigo
 * não existe, e o Google retira a URL do índice depois de alguns 404 seguidos.
 * Quando a consulta ao Supabase falhou, nós simplesmente NÃO SABEMOS se o
 * slug existe: o artigo pode estar publicado e vivo do outro lado. Afirmar
 * "não existe" nesse estado é mentir com consequência de SEO, e é justamente
 * o que acontecia antes — a queda virava 404 indistinguível de slug inventado.
 *
 * Então:
 *  - origem saudável (`live`/`empty`) + slug ausente -> `not-found` (404 real,
 *    honesto: o artigo de fato não está publicado);
 *  - origem degradada (`fallback`/`unconfigured`) + slug ausente ->
 *    `temporarily-unavailable`: página que explica, com `noindex`, sem 404.
 *
 * A alternativa avaliada era manter 404 puro sempre, por ser mais simples.
 * Foi descartada porque o custo dos dois erros é assimétrico: exibir uma
 * página "indisponível" para um slug que nunca existiu custa uma visita
 * confusa durante a janela de queda; devolver 404 para um artigo real custa
 * a posição orgânica dele, que leva semanas para voltar.
 */
export function resolveMissingSlugBehavior(status) {
  return status.degraded ? "temporarily-unavailable" : "not-found";
}

/**
 * Qual estado vazio a listagem deve mostrar.
 *
 * Antes existia uma mensagem só — "Nenhum artigo publicado nesta categoria" —
 * e ela aparecia inclusive sem filtro de categoria e inclusive quando a origem
 * tinha caído. Nos dois casos o texto era falso.
 */
export function resolveBlogListState({ postCount, hasCategoryFilter, status }) {
  if (postCount > 0) return "has-posts";
  if (status.degraded) return "source-unavailable";
  if (hasCategoryFilter) return "category-empty";
  return "catalog-empty";
}
