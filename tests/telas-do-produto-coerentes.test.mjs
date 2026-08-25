/**
 * As telas do produto falam da MESMA casa que o resto do site.
 *
 * POR QUE ESTE TESTE EXISTE (25/08/2026)
 *
 * O site descreve um restaurante-exemplo, e ele aparece em quatro lugares de
 * `lp-content.ts` que precisam concordar: `EXEMPLO_DRE` (receita e CMV),
 * `BOARD_VENDAS` (melhor e pior dia), `BOARD_CMV` (a alta do insumo) e
 * `DATA_SOURCES.statement` (o extrato). As três telas recriadas somam um
 * quinto conjunto de números.
 *
 * Números soltos não quebram build nem teste de estrutura: eles só fazem o
 * visitante ler quatro restaurantes diferentes na mesma visita — a casa fatura
 * 412 mil numa seção e 261 mil na seguinte. Este teste é o que impede isso.
 *
 * Ele confere as duas pontas: que os derivados do módulo batem com as amarras,
 * e que as amarras ainda são os valores escritos em `lp-content.ts`. A segunda
 * metade é o que pega a regressão de verdade — alguém edita a copy, o número
 * do tabuleiro muda, e as telas ficam contando a história antiga.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  MAPA_DE_CALOR,
  TURNOS,
  RECEITA_MENSAL,
  DIAS_DO_MES,
  MELHOR_DIA,
  PIOR_DIA,
  ALTA_INSUMO_30D_PCT,
  totalDoDia,
  totalDaSemana,
  extremosDoMapa,
  resumoDoInsumo,
  variacoesMensais,
  PRECO_INSUMO,
} from "../src/lib/telas-do-produto.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTEUDO = path.join(RAIZ, "src/lib/lp-content.ts");

const lerConteudo = () => readFile(CONTEUDO, "utf8");

test("o mapa de calor reconstitui a receita mensal da casa exemplo", () => {
  const mes = Math.round((totalDaSemana() * DIAS_DO_MES) / 7);
  assert.equal(
    mes,
    RECEITA_MENSAL,
    `O mapa soma ${mes}/mês e a casa exemplo fatura ${RECEITA_MENSAL}. ` +
      "Reescale as células — senão a mesma casa fatura dois valores no site.",
  );
});

test("sábado é o melhor dia e segunda o pior, nos valores do tabuleiro", () => {
  const porDia = Object.fromEntries(MAPA_DE_CALOR.map((l) => [l.dia, totalDoDia(l)]));
  assert.equal(porDia["Sáb"], MELHOR_DIA, "sábado do mapa não bate com o melhor dia do tabuleiro");
  assert.equal(porDia["Seg"], PIOR_DIA, "segunda do mapa não bate com o pior dia do tabuleiro");

  const totais = Object.values(porDia);
  assert.equal(Math.max(...totais), MELHOR_DIA, "há dia maior que o 'melhor dia' anunciado");
  assert.equal(Math.min(...totais), PIOR_DIA, "há dia menor que o 'pior dia' anunciado");
});

test("as amarras ainda são os números escritos em lp-content.ts", async () => {
  const fonte = await lerConteudo();
  assert.match(
    fonte,
    new RegExp(`receita:\\s*${String(RECEITA_MENSAL).replace(/(\d)(?=(\d{3})+$)/g, "$1_")}`),
    "EXEMPLO_DRE.receita mudou — reescale MAPA_DE_CALOR e atualize RECEITA_MENSAL.",
  );
  assert.ok(
    fonte.includes(`Sáb · R$ ${MELHOR_DIA.toLocaleString("pt-BR")}`),
    "BOARD_VENDAS.melhorDia mudou — o mapa de calor precisa acompanhar.",
  );
  assert.ok(
    fonte.includes(`Seg · R$ ${PIOR_DIA.toLocaleString("pt-BR")}`),
    "BOARD_VENDAS.piorDia mudou — o mapa de calor precisa acompanhar.",
  );
  assert.ok(
    fonte.includes(`"+${ALTA_INSUMO_30D_PCT.toString().replace(".", ",")}%"`),
    "A alta de 30 dias do tabuleiro mudou — o último degrau da série precisa acompanhar.",
  );
});

test("o último degrau da série é a alta de 30 dias que o tabuleiro anuncia", () => {
  const { ultimoDegrauPct } = resumoDoInsumo();
  assert.equal(
    Number(ultimoDegrauPct.toFixed(1)),
    ALTA_INSUMO_30D_PCT,
    "O tabuleiro diz uma alta e o gráfico mostra outra. O '+8,4% em 30 dias' " +
      "TEM de ser o último passo desta linha — é o que liga as duas peças.",
  );
});

test("a série de preço sobe no período e tem doze meses", () => {
  assert.equal(PRECO_INSUMO.length, 12, "a tela anuncia 12 meses");
  const { variacaoPct, minimo, maximo, medio } = resumoDoInsumo();
  assert.ok(variacaoPct > 0, "a série precisa subir — é o argumento da tela");
  assert.ok(minimo < medio && medio < maximo, "média fora da faixa entre mínimo e máximo");
  assert.equal(variacoesMensais()[0], null, "o primeiro mês não tem contra o que comparar");
  assert.equal(variacoesMensais().length, PRECO_INSUMO.length);
});

test("melhor e menor combinação existem e são células reais do mapa", () => {
  const { melhor, menor } = extremosDoMapa();
  const celulas = MAPA_DE_CALOR.flatMap((l) =>
    l.celulas.map((c, i) => ({ dia: l.dia, turno: TURNOS[i], valor: c.valor })),
  );
  for (const extremo of [melhor, menor]) {
    assert.ok(
      celulas.some(
        (c) => c.dia === extremo.dia && c.turno === extremo.turno && c.valor === extremo.valor,
      ),
      `${extremo.dia} · ${extremo.turno} não é uma célula do mapa`,
    );
  }
  assert.notEqual(melhor.valor, menor.valor, "mapa sem variação não prova nada");
});

test("toda linha do mapa tem uma célula por turno", () => {
  for (const linha of MAPA_DE_CALOR) {
    assert.equal(
      linha.celulas.length,
      TURNOS.length,
      `${linha.dia} tem ${linha.celulas.length} células para ${TURNOS.length} turnos`,
    );
  }
});
