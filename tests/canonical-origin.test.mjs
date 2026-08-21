/**
 * ROO-1125 — contrato da origem canônica do site público.
 *
 * O DEFEITO: o Cloudflare redireciona `rook.com.br` → `www.rook.com.br` com
 * 308. Uma canonical apontando para a origem SEM www aponta para uma URL que
 * redireciona, e o Google trata como conflito e não indexa. O Search Console
 * reportou 28 páginas, 13 delas por este motivo.
 *
 * Estado encontrado em 17/08/2026, contado no código:
 *
 *   15 × `https://rook.com.br`        — sem www, redireciona
 *    8 × `https://rooksystem.com.br`  — domínio antigo
 *    4 × `https://www.rook.com.br`    — correto, só em /planos
 *
 * Cada página declarava a própria origem à mão. Foi assim que `/planos` acabou
 * sendo a única certa e `/blog` acabou no domínio antigo — e é assim que
 * voltaria a divergir na próxima página criada, se o conserto fosse só trocar
 * as 23 strings.
 *
 * Esta trava não confere strings: confere que NENHUM arquivo fora do módulo
 * canônico escreve uma origem. É o que impede a reincidência.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const RAIZ = new URL("../src/", import.meta.url).pathname;

/** Único arquivo autorizado a declarar origem. */
const MODULO_CANONICO = "lib/site-origin.ts";

const ORIGEM_EM_TEXTO = /https:\/\/(?:www\.)?(?:rook|rooksystem)\.com\.br/g;

async function arquivosDeCodigo(dir = RAIZ, acc = []) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) await arquivosDeCodigo(completo, acc);
    else if (/\.(ts|tsx|mjs)$/.test(entrada.name)) acc.push(completo);
  }
  return acc;
}

test("nenhum arquivo além do módulo canônico declara a origem do site", async () => {
  const arquivos = await arquivosDeCodigo();
  const infratores = [];

  for (const arquivo of arquivos) {
    const relativo = path.relative(RAIZ, arquivo);
    if (relativo === MODULO_CANONICO) continue;

    const conteudo = await readFile(arquivo, "utf8");
    // Comentários explicam o defeito e citam os domínios de propósito.
    const semComentarios = conteudo
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    const achados = semComentarios.match(ORIGEM_EM_TEXTO);
    if (achados) infratores.push(`${relativo} → ${[...new Set(achados)].join(", ")}`);
  }

  assert.deepEqual(
    infratores,
    [],
    "Origem do site escrita fora de src/lib/site-origin.ts. " +
      "Use siteUrl(path) — canonical sem www redireciona (308) e o Google não indexa.",
  );
});

test("a origem canônica tem www e é o domínio atual", async () => {
  const fonte = await readFile(path.join(RAIZ, MODULO_CANONICO), "utf8");

  assert.match(
    fonte,
    /CANONICAL_ORIGIN\s*=\s*"https:\/\/www\.rook\.com\.br"/,
    "A origem canônica precisa ter www — é para onde o 308 do Cloudflare aponta.",
  );
  assert.doesNotMatch(
    fonte,
    /CANONICAL_ORIGIN\s*=\s*"https:\/\/rooksystem/,
    "rooksystem.com.br é o domínio antigo.",
  );
});

test("a origem sem www é promovida para a forma canônica", async () => {
  // Protege o caso de NEXT_PUBLIC_SITE_URL ser configurado sem www em
  // produção: o defeito voltaria por variável de ambiente, sem passar por
  // revisão de código.
  const fonte = await readFile(path.join(RAIZ, MODULO_CANONICO), "utf8");
  assert.match(fonte, /https:\/\/rook\.com\.br"\)\s*return CANONICAL_ORIGIN/);
});

test("o sitemap não concatena caminho sobre a raiz (barra dupla)", async () => {
  const sitemap = await readFile(path.join(RAIZ, "app/sitemap.ts"), "utf8");
  assert.doesNotMatch(
    sitemap,
    /\$\{base\}\//,
    "Concatenar sobre siteUrl() gera '//', que é outra URL para o Google.",
  );
});

/*
 * TODA ROTA DECLARA A PRÓPRIA CANONICAL — E O LAYOUT RAIZ NÃO DECLARA NENHUMA.
 *
 * Medido em produção em 21/08/2026: `/termos/`, `/privacidade/` e `/sobre/`
 * serviam `<link rel="canonical" href="https://www.rook.com.br/">` — a HOME.
 * Nenhuma das três tinha canonical própria, e o `alternates.canonical` do
 * `app/layout.tsx` é HERDADO por quem não declara a sua. As três diziam ao
 * Google "a URL oficial desta página é a home", e o Google obedeceu: fora do
 * índice.
 *
 * É o mesmo defeito da ROO-1125 (canonical apontando para URL que não é a da
 * página), com origem interna em vez de vir do www. E o defeito não era das
 * três páginas: era do valor global no layout, que transforma esquecimento em
 * canonical errada. A próxima rota criada herdaria igual.
 *
 * Por isso a trava tem duas metades, e as duas importam:
 *  - o layout raiz NÃO pode declarar canonical (senão a armadilha volta);
 *  - toda page.tsx precisa de canonical própria ou de um layout irmão que a
 *    declare (senão a página fica sem canonical — tolerável, mas não é o que
 *    se quer para uma rota indexável).
 */
test("nenhuma rota herda a canonical da home", async () => {
  const appDir = path.join(RAIZ, "app");

  const layoutRaiz = await readFile(path.join(appDir, "layout.tsx"), "utf8");
  const semComentarios = layoutRaiz
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(
    semComentarios,
    /alternates/,
    "app/layout.tsx voltou a declarar `alternates`. Metadata de layout é herdada: " +
      "toda página sem canonical própria passaria a apontar para a home e sairia do índice. " +
      "A canonical da home mora em app/page.tsx.",
  );

  async function paginas(dir, acc = []) {
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
      const completo = path.join(dir, entrada.name);
      if (entrada.isDirectory()) await paginas(completo, acc);
      else if (entrada.name === "page.tsx") acc.push(completo);
    }
    return acc;
  }

  const semCanonical = [];
  for (const pagina of await paginas(appDir)) {
    const conteudo = await readFile(pagina, "utf8");
    if (/alternates/.test(conteudo)) continue;
    // Um layout irmão pode declarar a canonical no lugar da página.
    const irmao = path.join(path.dirname(pagina), "layout.tsx");
    const temLayout = await readFile(irmao, "utf8").then(
      (c) => /alternates/.test(c),
      () => false,
    );
    if (!temLayout) semCanonical.push(path.relative(RAIZ, pagina));
  }

  assert.deepEqual(
    semCanonical,
    [],
    "Rota sem canonical própria nem em layout irmão. Adicione " +
      '`alternates: { canonical: siteUrl("/rota/") }` ao metadata da página.',
  );
});
