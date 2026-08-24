/**
 * O benchmark de CMV tem UMA fonte. (24/08/2026)
 *
 * A tabela de onze segmentos existia em triplicata: dentro de
 * `CmvCalculator.tsx`, dentro de `DiagnosticoFlow.tsx`, e — depois que a página
 * de segmentos passou a citá-la — quase numa quarta cópia. As duas primeiras já
 * tinham começado a divergir sozinhas, em silêncio: nomes diferentes para o
 * mesmo segmento e slugs diferentes para o delivery. Os percentuais ainda
 * batiam por sorte, não por construção.
 *
 * O risco não é estético. A calculadora dizia ao visitante que a referência do
 * segmento dele é X; o diagnóstico usava a mesma referência para calcular o
 * ponto de equilíbrio. Divergirem significa a mesma casa receber duas contas
 * diferentes em duas páginas do mesmo site.
 *
 * Este teste falha no momento em que alguém recria uma cópia local — que é a
 * forma como as três surgiram.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { segmentsData, segmentoPorSlug, pctBr } from "../src/lib/cmv-benchmarks.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTE = path.join(RAIZ, "src/lib/cmv-benchmarks.mjs");

async function arquivosDe(dir) {
  const encontrados = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await arquivosDe(completo)));
    else if (/\.(ts|tsx|mjs)$/.test(entrada.name)) encontrados.push(completo);
  }
  return encontrados;
}

test("nenhum arquivo declara a tabela de segmentos por conta própria", async () => {
  const infratores = [];
  for (const arquivo of await arquivosDe(path.join(RAIZ, "src"))) {
    if (arquivo === FONTE) continue;
    const fonte = await readFile(arquivo, "utf8");
    // Uma cópia se denuncia por declarar a lista com o campo do benchmark.
    if (/(const|let|var)\s+\w*[sS]egments?\w*\s*(:[^=]+)?=\s*\[/.test(fonte) && /defaultCmvTarget/.test(fonte)) {
      infratores.push(path.relative(RAIZ, arquivo));
    }
  }
  assert.deepEqual(
    infratores,
    [],
    "Tabela de CMV declarada fora de `src/lib/cmv-benchmarks.mjs`. Importe de lá — " +
      "duas listas do mesmo benchmark fazem o site dar duas contas para a mesma casa.",
  );
});

test("a tabela cobre os onze segmentos, com slug único", () => {
  assert.equal(segmentsData.length, 11);
  const slugs = segmentsData.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length, "slug repetido na tabela");
});

test("toda faixa saudável contém a referência do segmento", () => {
  for (const s of segmentsData) {
    assert.ok(
      s.cmvMin <= s.defaultCmvTarget && s.defaultCmvTarget <= s.cmvMax,
      `${s.slug}: referência ${s.defaultCmvTarget} fora da faixa ${s.cmvMin}–${s.cmvMax}`,
    );
  }
});

test("segmentoPorSlug devolve undefined para desconhecido, sem cair no primeiro", () => {
  assert.equal(segmentoPorSlug("nao_existe"), undefined);
  assert.equal(segmentoPorSlug("a_la_carte").slug, "a_la_carte");
});

test("pctBr formata no padrão brasileiro", () => {
  assert.equal(pctBr(32), "32,0%");
  assert.equal(pctBr(30.85), "30,9%");
});
