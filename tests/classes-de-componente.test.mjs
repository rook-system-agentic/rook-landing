/**
 * Classe de componente usada precisa estar definida. (24/08/2026)
 *
 * O QUE ACONTECEU: a modal de solicitação de integração usou `input-base` —
 * classe que existe no repositório do PRODUTO (rook-system), não neste. O
 * Tailwind não reclama de classe desconhecida, o `tsc` não vê e o build passa;
 * o campo simplesmente renderiza com o padrão do navegador. Fundo branco
 * herdando o `text-cream` do diálogo escuro: o visitante não conseguia ler o
 * que estava digitando.
 *
 * NENHUM TESTE PEGOU, e vale entender por quê: os 106 testes cobriam estrutura
 * (o campo existe, tem rótulo, a rota valida) e nenhum cobria aparência. Este
 * fecha a fresta específica que causou o defeito — classe do tipo componente
 * (`@layer components`) citada no código sem existir no CSS.
 *
 * ESCOPO: só as classes que o repositório define em `@layer components`, mais a
 * lista de conhecidas-de-fora. Utilitário do Tailwind (`flex`, `mb-4`,
 * `text-sm`) não entra aqui — são gerados sob demanda e conferi-los exigiria
 * rodar o Tailwind, o que este teste não faz de propósito: ele lê código-fonte,
 * como as outras travas.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GLOBALS = path.join(RAIZ, "src/app/globals.css");

/**
 * Classes que parecem "de componente" mas vêm de fora do `@layer components`:
 * utilitários compostos que o próprio Tailwind resolve, ou classes definidas
 * fora do bloco. Acrescentar aqui exige saber de onde a classe vem.
 */
const CONHECIDAS_DE_FORA = new Set([
  "lp-in", // adicionada em runtime pelo LpReveal
  "text-base", // utilitário do Tailwind, não componente — casa com a regra `-base`
]);

async function arquivosDe(dir) {
  const encontrados = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await arquivosDe(completo)));
    else if (/\.tsx$/.test(entrada.name)) encontrados.push(completo);
  }
  return encontrados;
}

/**
 * Todos os nomes de classe que aparecem no CSS, em qualquer posição.
 *
 * A primeira versão só casava seletor no INÍCIO da linha e por isso não
 * enxergava `.lp-spark-line` e companhia, que vivem em listas de seletores e
 * dentro de blocos `@media`. Varrer o arquivo inteiro é mais permissivo — e
 * permissivo é o lado certo de errar aqui: o alvo é a classe que NÃO existe.
 */
async function classesDefinidas() {
  const css = await readFile(GLOBALS, "utf8");
  const nomes = new Set();
  for (const m of css.matchAll(/\.([a-z][\w-]*)/g)) nomes.add(m[1]);
  return nomes;
}

test("nenhum componente usa classe de componente que não existe no CSS", async () => {
  const definidas = await classesDefinidas();
  const infratores = [];

  for (const arquivo of await arquivosDe(path.join(RAIZ, "src"))) {
    const fonte = await readFile(arquivo, "utf8");

    for (const m of fonte.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
      const lista = (m[1] ?? m[2] ?? "").split(/\s+/).filter(Boolean);

      for (const classe of lista) {
        /*
         * O escopo precisa ser ESTREITO. A primeira versão desta trava usava
         * prefixos largos (`text-`, `card-`, `section-`) e reprovou 100+
         * utilitários legítimos do Tailwind — `text-sm`, `text-xs`. Aqui só
         * entram as formas que este repositório usa para classe de componente:
         * `lp-*`, `btn-*`, qualquer coisa terminada em `-base` (a forma que
         * causou o defeito) e os nomes soltos definidos no globals.
         */
        const pareceDeComponente =
          /^(lp|btn)-/.test(classe) ||
          /-base$/.test(classe) ||
          ["card", "section-spacing", "section-label", "heading-hero", "heading-section", "heading-sub", "text-body"].includes(classe);
        if (!pareceDeComponente) continue;
        if (classe.includes("${")) continue; // interpolação: não dá para conferir
        if (CONHECIDAS_DE_FORA.has(classe)) continue;
        if (definidas.has(classe)) continue;

        infratores.push(`${path.relative(RAIZ, arquivo)} → .${classe}`);
      }
    }
  }

  assert.deepEqual(
    [...new Set(infratores)],
    [],
    "Classe de componente usada e não definida em globals.css. Numa classe que não " +
      "existe o Tailwind não reclama e o elemento cai no padrão do navegador — foi " +
      "assim que o campo da modal ficou com texto branco sobre fundo branco.",
  );
});

test("o estilo dos campos é um só, e não literal repetido", async () => {
  // Duas cópias divergem no primeiro ajuste — e a que ficar para trás é a que
  // ninguém olha.
  const estilos = await readFile(path.join(RAIZ, "src/lib/form-styles.ts"), "utf8");
  assert.match(estilos, /INPUT_CLASSNAME/);

  const modal = await readFile(path.join(RAIZ, "src/components/lp/LpIntegrationRequest.tsx"), "utf8");
  assert.match(modal, /INPUT_CLASSNAME/, "a modal precisa usar o estilo compartilhado");
  assert.ok(!/input-base/.test(modal), "`input-base` não existe neste repositório");
});
