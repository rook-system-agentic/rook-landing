/**
 * A /sobre não pode voltar a ser eco da home.
 *
 * POR QUE ESTE TESTE EXISTE (25/08/2026)
 *
 * A página abria a seção de história com a MESMA manchete do bloco AUTHORITY
 * da home — "O Rook começou em planilhas." — e a mesma narrativa, reescrita.
 * E o botão que traz o visitante para cá, na home, é "Conheça o Rook por
 * dentro": o clique prometia aprofundar e entregava releitura.
 *
 * As duas cópias já tinham divergido sozinhas — "vinte anos" na home, "20
 * anos" na /sobre. Duas fontes do mesmo fato andando separadas é como isso
 * começa; a próxima divergência não avisa.
 *
 * A regra que este teste trava: a home dá o RESUMO, a /sobre dá o que não
 * cabe lá. Nenhum trecho longo pode aparecer nos dois lugares.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { segmentsData } from "../src/lib/cmv-benchmarks.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTEUDO = path.join(RAIZ, "src/lib/lp-content.ts");
const PAGINA = path.join(RAIZ, "src/app/sobre/page.tsx");

/** Marcador que separa a copy da /sobre do resto do arquivo. */
const MARCADOR_SOBRE = "/* ─── A página /sobre ─── */";

async function regioes() {
  const fonte = await readFile(CONTEUDO, "utf8");
  const corte = fonte.indexOf(MARCADOR_SOBRE);
  assert.ok(corte > 0, `marcador "${MARCADOR_SOBRE}" sumiu de lp-content.ts`);

  const inicioAuthority = fonte.indexOf("export const AUTHORITY = {");
  assert.ok(inicioAuthority > 0, "bloco AUTHORITY não encontrado");
  const fimAuthority = fonte.indexOf("} as const;", inicioAuthority);

  // Comentários fora: eles CITAM a home e os percentuais de propósito, para
  // explicar a decisão. Medir o comentário reprovaria justamente a explicação.
  const semComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  return {
    authority: semComentarios(fonte.slice(inicioAuthority, fimAuthority)),
    sobre: semComentarios(fonte.slice(corte)),
  };
}

/** Palavras de uma prosa, sem pontuação nem marcação, em minúsculas. */
const palavrasDe = (texto) =>
  texto
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

test("nenhum trecho longo da home se repete na /sobre", async () => {
  const { authority, sobre } = await regioes();
  const JANELA = 8;

  const daHome = palavrasDe(authority);
  const daSobre = palavrasDe(sobre).join(" ");

  const repetidos = [];
  for (let i = 0; i + JANELA <= daHome.length; i += 1) {
    const trecho = daHome.slice(i, i + JANELA).join(" ");
    if (daSobre.includes(trecho)) repetidos.push(trecho);
  }

  assert.deepEqual(
    repetidos,
    [],
    "Trecho do bloco AUTHORITY (home) reaparece na copy da /sobre: " +
      `"${repetidos[0] ?? ""}". A home dá o resumo e a /sobre aprofunda — ` +
      "o botão 'Conheça o Rook por dentro' promete mais, não o mesmo texto.",
  );
});

test("a manchete da home não é reaproveitada na /sobre", async () => {
  const { sobre } = await regioes();
  assert.ok(
    !sobre.includes("O Rook começou em"),
    "A /sobre voltou a usar a manchete do bloco AUTHORITY da home.",
  );
});

test("a copy da /sobre não cita percentual solto", async () => {
  const { sobre } = await regioes();
  const percentuais = [...sobre.matchAll(/(\d{1,3}(?:,\d+)?)\s*%/g)].map((m) => m[1]);
  assert.deepEqual(
    percentuais,
    [],
    `A copy da /sobre cita ${percentuais.join(", ")}%. A página trazia "30% de CMV ideal" ` +
      "e a tabela canônica não tem nenhum segmento em 30% — a página que existe para " +
      "provar rigor contradizia a calculadora. Qualquer percentual aqui tem de vir de " +
      "`cmv-benchmarks.mjs`, nunca digitado.",
  );
});

test("a tabela de CMV segue sem nenhum segmento em 30%", () => {
  // Guarda o motivo do teste acima: se algum dia 30% virar um valor real da
  // tabela, a mensagem de erro dele passa a mentir e precisa ser revista.
  const alvos = segmentsData.map((s) => s.defaultCmvTarget);
  assert.ok(
    !alvos.includes(30),
    "Agora existe segmento em 30% — revise a justificativa do teste de percentual.",
  );
});

test("a identidade da empresa vem de company.ts, não digitada na página", async () => {
  const pagina = await readFile(PAGINA, "utf8");
  assert.ok(
    pagina.includes("COMPANY_INFO"),
    "A /sobre deixou de ler `lib/company.ts` — razão social e CNPJ têm uma fonte só.",
  );
  assert.ok(
    !/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(pagina),
    "CNPJ digitado à mão na /sobre. Ele vive em `lib/company.ts`, junto do rodapé " +
      "e das páginas jurídicas — duas cópias divergem no primeiro cadastro alterado.",
  );
});

test("a página assina com uma pessoa e não expõe quem não quis", async () => {
  const { sobre } = await regioes();
  const assinaturas = [...sobre.matchAll(/assinatura:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(
    assinaturas.length,
    1,
    "A /sobre deve ter exatamente uma assinatura: página sem nenhuma pessoa vira " +
      "institucional; com mais de uma, expõe sócio que pediu para não aparecer " +
      "(decisão do PO, 25/08/2026).",
  );
});
