/**
 * Os números das telas do produto exibidas no site.
 *
 * POR QUE ISTO EXISTE COMO MÓDULO PRÓPRIO (25/08/2026)
 *
 * As três telas — mapa de calor, histórico de preço de insumo e extrato
 * classificado — são recriações do produto, não prints. A regra vem do
 * mockup do Rook.AI (PR #114): *"os prints do produto real trazem dados de
 * operação e não entram aqui"*.
 *
 * O risco de recriar é outro: inventar uma casa nova. O site já fala de UMA
 * casa exemplo, e ela aparece em quatro lugares que precisam concordar —
 * `EXEMPLO_DRE` (receita e CMV), `BOARD_VENDAS` (melhor e pior dia, turnos),
 * `BOARD_CMV` (inflação de insumo) e `DATA_SOURCES.statement` (o extrato).
 * Três telas com números soltos fariam o visitante ler quatro restaurantes
 * diferentes na mesma visita.
 *
 * Então os números daqui DERIVAM daqueles, e o teste
 * `tests/telas-do-produto-coerentes.test.mjs` falha quando param de bater.
 *
 * Aqui ficam só os NÚMEROS. Rótulo e frase ficam em `lp-content.ts`, como
 * manda a regra da copy.
 */

/* ─── As amarras. Espelham lp-content.ts; o teste confere que ainda batem. ─── */

/** `EXEMPLO_DRE.receita` — receita mensal da casa exemplo. */
export const RECEITA_MENSAL = 412_800;

/** Dias do mês usados para converter semana ↔ mês. */
export const DIAS_DO_MES = 30;

/** `BOARD_VENDAS.melhorDia` e `.piorDia`, em reais por dia. */
export const MELHOR_DIA = 18_800;
export const PIOR_DIA = 9_000;

/** `BOARD_CMV.insumos[0].delta` — a alta do filé mignon em 30 dias. */
export const ALTA_INSUMO_30D_PCT = 8.4;

/* ─── Tela 1: Vendas → Mapa de Calor (dia da semana × turno) ─── */

/**
 * Turnos na ordem da tela. São os mesmos de `BOARD_VENDAS.turnos` — o produto
 * lê a configuração de turnos do estabelecimento, então esta é uma
 * configuração legítima, e é a que o resto do site já usa.
 */
export const TURNOS = ["Almoço", "Jantar", "Delivery"];

/**
 * Média por dia da semana e turno, em reais.
 *
 * `desvio` é a variação contra a média das últimas 8 semanas do MESMO dia e
 * turno — a régua real do produto (`lib/vendas/heatmap-cell.ts`): verde acima
 * de +10%, vermelho abaixo de −10%, laranja dentro da faixa.
 *
 * A soma da semana é `RECEITA_MENSAL * 7 / DIAS_DO_MES`; sábado fecha em
 * `MELHOR_DIA` e segunda em `PIOR_DIA`. A sexta é o dia de `BOARD_VENDAS`
 * ("por turno · ontem"), célula por célula.
 */
export const MAPA_DE_CALOR = [
  { dia: "Seg", celulas: [ { valor: 3_400, desvio: -0.04 }, { valor: 4_400, desvio: -0.06 }, { valor: 1_200, desvio: -0.22 } ] },
  { dia: "Ter", celulas: [ { valor: 4_200, desvio: 0.03 }, { valor: 5_800, desvio: 0.02 }, { valor: 1_400, desvio: -0.14 } ] },
  { dia: "Qua", celulas: [ { valor: 4_600, desvio: 0.06 }, { valor: 6_400, desvio: 0.09 }, { valor: 1_600, desvio: -0.09 } ] },
  { dia: "Qui", celulas: [ { valor: 5_000, desvio: 0.07 }, { valor: 7_100, desvio: 0.12 }, { valor: 1_800, desvio: -0.03 } ] },
  { dia: "Sex", celulas: [ { valor: 6_210, desvio: 0.11 }, { valor: 8_940, desvio: -0.17 }, { valor: 2_250, desvio: 0.08 } ] },
  { dia: "Sáb", celulas: [ { valor: 6_100, desvio: 0.09 }, { valor: 10_300, desvio: 0.24 }, { valor: 2_400, desvio: 0.13 } ] },
  { dia: "Dom", celulas: [ { valor: 6_800, desvio: 0.16 }, { valor: 4_620, desvio: -0.11 }, { valor: 1_800, desvio: 0.04 } ] },
];

/* ─── Tela 2: Compras/CMV → histórico de preço do insumo ─── */

/**
 * Preço médio mensal do filé mignon, em reais por quilo.
 *
 * É o MESMO insumo que a aba Compras/CMV da home destaca. O último passo da
 * série é `ALTA_INSUMO_30D_PCT` — o "+8,4% em 30 dias" que o tabuleiro
 * mostra é o degrau final desta linha, não outro número.
 *
 * O argumento da tela: nenhum degrau assusta sozinho. Somados, doze meses de
 * passos pequenos são a alta que ninguém decidiu.
 */
export const PRECO_INSUMO = [
  { mes: "set/25", preco: 68.90, qtd: 126.4 },
  { mes: "out/25", preco: 70.40, qtd: 131.2 },
  { mes: "nov/25", preco: 71.70, qtd: 128.7 },
  { mes: "dez/25", preco: 74.20, qtd: 148.3 },
  { mes: "jan/26", preco: 74.80, qtd: 119.5 },
  { mes: "fev/26", preco: 72.60, qtd: 114.8 },
  { mes: "mar/26", preco: 75.90, qtd: 127.3 },
  { mes: "abr/26", preco: 78.40, qtd: 132.6 },
  { mes: "mai/26", preco: 81.00, qtd: 129.4 },
  { mes: "jun/26", preco: 84.20, qtd: 135.1 },
  { mes: "jul/26", preco: 87.60, qtd: 138.9 },
  { mes: "ago/26", preco: 94.95, qtd: 133.2 },
];

export const FORNECEDORES_INSUMO = [
  { nome: "FRIGORÍFICO BOI FORTE LTDA", notas: 14, ultima: "18/08/2026", preco: 94.95, tendencia: "up" },
  { nome: "DISTRIBUIDORA VALE DO SOL", notas: 6, ultima: "05/08/2026", preco: 89.40, tendencia: "up" },
  { nome: "COMERCIAL SÃO BENTO ALIMENTOS", notas: 3, ultima: "22/07/2026", preco: 86.20, tendencia: "stable" },
];

/* ─── Tela 3: Central de Dados → Extrato bancário (Open Finance) ─── */

/**
 * O extrato NÃO ganha números novos.
 *
 * A home já publica este mesmo documento em `DATA_SOURCES.statement`: Stone,
 * 01/07 a 31/07/2026, saldo R$ 69.120, "Classificação 78%". Recriar a tela com
 * outro saldo faria o site mostrar dois extratos da mesma casa no mesmo mês.
 *
 * O que a /restaurantes acrescenta não é número, é PROFUNDIDADE: a home diz
 * "78% classificado"; aqui se vê COMO — linha a linha, com o selo de quem
 * classificou e o que ainda espera revisão.
 */

/** `DATA_SOURCES.statement.badge` — percentual classificado. */
export const CLASSIFICACAO_PCT = 78;

/** `DATA_SOURCES.statement.summary` — 338 créditos + 214 débitos. */
export const TXNS_CREDITO = 338;
export const TXNS_DEBITO = 214;

/**
 * Amostra da lista de transações. `metodo` espelha os três selos do produto
 * (`renderClassificationBadge`): `auto` quando o Rook classificou sozinho,
 * `manual` quando alguém ajustou, `pendente` quando ainda falta revisar.
 */
export const EXTRATO_TXNS = [
  { data: "28/07/2026", descricao: "PIX RECEBIDO CIELO REPASSE", valor: 22_480, tipo: "credito", conta: "3.1.01", metodo: "auto" },
  { data: "27/07/2026", descricao: "TED FRIGORIFICO BOI FORTE", valor: -8_940, tipo: "debito", conta: "4.1.01", metodo: "auto" },
  { data: "25/07/2026", descricao: "DEB AUTOM ENERGIA ELETRICA", valor: -4_180, tipo: "debito", conta: "4.2.07", metodo: "manual" },
  { data: "24/07/2026", descricao: "PIX RECEBIDO IFOOD REPASSE", valor: 11_260, tipo: "credito", conta: "3.1.02", metodo: "auto" },
  { data: "23/07/2026", descricao: "TARIFA PACOTE SERVICOS", valor: -89.9, tipo: "debito", conta: null, metodo: "pendente" },
];

/* ─── Derivados. Calculados, nunca digitados. ─── */

/** Total de transações do extrato, classificadas e pendentes. */
export function resumoDaClassificacao() {
  const total = TXNS_CREDITO + TXNS_DEBITO;
  const classificadas = Math.round((total * CLASSIFICACAO_PCT) / 100);
  return { total, classificadas, pendentes: total - classificadas, pct: CLASSIFICACAO_PCT };
}


/** Soma de uma linha do mapa (o dia inteiro). */
export const totalDoDia = (linha) => linha.celulas.reduce((s, c) => s + c.valor, 0);

/** Soma da semana inteira. */
export const totalDaSemana = () => MAPA_DE_CALOR.reduce((s, l) => s + totalDoDia(l), 0);

/** Célula de maior e de menor média, com o dia e o turno. */
export function extremosDoMapa() {
  let melhor = null;
  let menor = null;
  MAPA_DE_CALOR.forEach((linha) => {
    linha.celulas.forEach((celula, i) => {
      const item = { dia: linha.dia, turno: TURNOS[i], valor: celula.valor };
      if (!melhor || item.valor > melhor.valor) melhor = item;
      if (!menor || item.valor < menor.valor) menor = item;
    });
  });
  return { melhor, menor };
}

/** Resumo do histórico de preço: média, mínimo, máximo e variação no período. */
export function resumoDoInsumo() {
  const precos = PRECO_INSUMO.map((p) => p.preco);
  const primeiro = precos[0];
  const ultimo = precos[precos.length - 1];
  return {
    medio: precos.reduce((s, p) => s + p, 0) / precos.length,
    minimo: Math.min(...precos),
    maximo: Math.max(...precos),
    variacaoPct: ((ultimo - primeiro) / primeiro) * 100,
    ultimoDegrauPct: ((ultimo - precos[precos.length - 2]) / precos[precos.length - 2]) * 100,
  };
}

/** Variação mês a mês, em %. `null` no primeiro mês (não há contra o que comparar). */
export function variacoesMensais() {
  return PRECO_INSUMO.map((p, i) =>
    i === 0 ? null : ((p.preco - PRECO_INSUMO[i - 1].preco) / PRECO_INSUMO[i - 1].preco) * 100,
  );
}
