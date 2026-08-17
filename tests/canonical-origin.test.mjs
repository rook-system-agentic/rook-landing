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
