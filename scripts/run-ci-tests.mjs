#!/usr/bin/env node
/**
 * Executor dos testes no CI da LP.
 *
 * POR QUE ISTO EXISTE, E NÃO UMA LISTA NO package.json
 *
 * O `test:ci` era uma lista fixa de arquivos. Toda suíte nova nascia FORA do
 * gate: passava na máquina de quem escreveu e não rodava em lugar nenhum. O
 * sintoma é silêncio — não há check vermelho para desconfiar, e a proteção
 * parece existir.
 *
 * Já aconteceu pelo menos duas vezes. O commit `88d29627` desta mesma branch se
 * chama "CI passa a cobrir os 5 arquivos de teste": alguém percebeu a lista
 * desatualizada e corrigiu adicionando arquivos à mão — o que conserta o dia e
 * preserva a armadilha. Em 17/08/2026 a mesma classe reapareceu com quatro
 * suítes de uma vez (`canonical-origin`, `acessibilidade-lp`, `blog-source` e
 * `performance-lp`), todas fora do gate por construção.
 *
 * Agora a regra inverteu: **tudo em `tests/*.test.mjs` roda**, e o que fica de
 * fora precisa ser declarado aqui, com motivo. Suíte nova entra sozinha.
 *
 * A EXCLUSÃO É BARULHENTA DE PROPÓSITO. Exclusão silenciosa é como um teste
 * some do gate sem ninguém notar — exatamente o defeito que este arquivo
 * existe para eliminar.
 */
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR_TESTES = path.join(RAIZ, "tests");

/**
 * Suítes que NÃO rodam no CI. Cada entrada precisa de motivo e de saída.
 * Se você está adicionando uma linha aqui, prefira consertar o teste.
 */
const FORA_DO_GATE = [
  {
    arquivo: "billing-catalog.test.mjs",
    motivo:
      "depende de um snapshot que expira em 7 dias — fica vermelho sozinho, " +
      "sem ninguém mexer no código, e treinaria o time a ignorar o CI",
    saida:
      "rode `pnpm test:billing` à mão, ou regenere o snapshot; a validade é " +
      "verificada em `parseBillingCatalogSnapshot`",
  },
];

const excluidos = new Map(FORA_DO_GATE.map((e) => [e.arquivo, e]));

const todos = readdirSync(DIR_TESTES)
  .filter((nome) => nome.endsWith(".test.mjs"))
  .sort();

const aRodar = todos.filter((nome) => !excluidos.has(nome));
const naoRodam = todos.filter((nome) => excluidos.has(nome));

// Entrada declarada que não corresponde a arquivo nenhum: a lista apodreceu.
const orfas = FORA_DO_GATE.filter((e) => !todos.includes(e.arquivo));

console.log(`\nCI da LP — ${aRodar.length} de ${todos.length} suítes no gate\n`);
for (const nome of aRodar) console.log(`  ✓ ${nome}`);

if (naoRodam.length > 0) {
  console.log("\n  Fora do gate, por decisão explícita:");
  for (const nome of naoRodam) {
    const { motivo, saida } = excluidos.get(nome);
    console.log(`  ✗ ${nome}\n      motivo: ${motivo}\n      saída:  ${saida}`);
  }
}

if (orfas.length > 0) {
  console.error("\n  ERRO: exclusão declarada para arquivo que não existe:");
  for (const e of orfas) console.error(`    ${e.arquivo}`);
  console.error("  Remova a entrada de FORA_DO_GATE — lista podre esconde cobertura.\n");
  process.exit(1);
}

if (aRodar.length === 0) {
  console.error("\n  ERRO: nenhuma suíte para rodar. Isso nunca é o estado certo.\n");
  process.exit(1);
}

console.log("");
execFileSync(
  process.execPath,
  ["--test", ...aRodar.map((nome) => path.join("tests", nome))],
  { cwd: RAIZ, stdio: "inherit" },
);
