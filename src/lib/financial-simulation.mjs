import { validateFinancialInput } from './financial-input.mjs';
import { segmentoPorSlug, BENCHMARK_FONTE } from './cmv-benchmarks.mjs';
import { calculateGrossCmv } from './cmv-gross-simulation.mjs';
import { financialReferenceAssumptions } from './financial-reference.mjs';

export const FORMULA_VERSION = 'rook-consultivo-1';
export const PURCHASES_FORMULA_VERSION = 'rook-breakeven-purchases-1';
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export { parseBrazilianNumber } from './financial-number.mjs';

/** Cálculo sem CRM, IA ou defaults financeiros. Valores monetários em reais. */
export function calculateFinancialSimulation(candidate) {
  const validated = validateFinancialInput(candidate);
  if (!validated.ok) return validated;
  const { inputs } = validated;
  if (inputs.tool === 'breakeven' && inputs.costInputMode === 'purchases_amount') return calculatePurchasesBreakeven(inputs);
  // Explicit gross scenarios use the versioned estimate. Legacy net and PE are unchanged.
  if (inputs.tool === 'cmv' && inputs.revenueBasis === 'gross') return calculateGrossCmv(inputs);
  const assumptions = ['Cenário mensal baseado nos valores informados. Não comprova lucro contábil, economia realizada ou fluxo de caixa.', ...financialReferenceAssumptions(inputs)];
  if (inputs.tool === 'cmv') {
    const segment = segmentoPorSlug(inputs.segment);
    assumptions.push('Receita e CMV usam a mesma base líquida; não há conversão automática de bases.');
    if (!segment) return {
      ok: true, tool: inputs.tool, formulaVersion: FORMULA_VERSION, inputs, assumptions,
      result: { status: 'no_reference', referencePercent: null, monthlyDifference: null },
      summary: 'Seu CMV foi registrado neste cenário. Ainda não há referência Rook para comparar esse segmento.',
    };
    const differencePoints = money(inputs.cmvPercent - segment.defaultCmvTarget);
    const monthlyDifference = money(inputs.revenue * differencePoints / 100);
    assumptions.push(`${BENCHMARK_FONTE}: referência indicativa de ${segment.defaultCmvTarget.toLocaleString('pt-BR')}%. A adequação à sua operação precisa ser avaliada.`);
    return {
      ok: true, tool: inputs.tool, formulaVersion: FORMULA_VERSION, inputs, assumptions,
      result: { status: 'valid', referencePercent: segment.defaultCmvTarget, differencePoints, monthlyDifference },
      summary: differencePoints > 0
        ? `A diferença de ${differencePoints.toLocaleString('pt-BR')} pontos percentuais para a referência representa ${currency(monthlyDifference)} por mês nessa receita. É uma oportunidade estimada para investigar.`
        : `O CMV informado está ${differencePoints === 0 ? 'na referência' : 'abaixo da referência'} do segmento. Esse indicador sozinho não determina o resultado do restaurante.`,
    };
  }
  const amountTax = inputs.taxInputMode === 'amount';
  let contributionRatio;
  let contributionPercent;
  if (amountTax) {
    // Mesma razão de (1 − outros variáveis / 100) − impostos / receita.
    // Centavos e pontos-base mantêm a margem zero exata, sem arredondar a
    // alíquota derivada da guia antes de calcular o ponto de equilíbrio.
    const revenueCents = Math.round(inputs.revenue * 100);
    const taxCents = Math.round(inputs.taxAmount * 100);
    const otherVariableBasisPoints = Math.round(inputs.cmvPercent * 100)
      + Math.round(inputs.feesPercent * 100) + Math.round(inputs.otherVariablePercent * 100);
    contributionRatio = (revenueCents * (10000 - otherVariableBasisPoints) - taxCents * 10000)
      / (revenueCents * 10000);
    contributionPercent = money(contributionRatio * 100);
    assumptions.push(`Impostos informados: ${currency(inputs.taxAmount)} de guia ou valor declarado, na mesma referência do faturamento e dos custos. A razão entre esse valor e o faturamento é uma hipótese gerencial para a projeção; não representa alíquota fiscal confirmada. A guia não é somada aos custos fixos nem cobrada duas vezes neste cenário.`);
  } else {
    const variablePercent = money(inputs.cmvPercent + inputs.taxPercent + inputs.feesPercent + inputs.otherVariablePercent);
    contributionPercent = money(100 - variablePercent);
    contributionRatio = contributionPercent / 100;
  }
  const operationalResult = amountTax
    ? money(inputs.revenue * contributionRatio - inputs.fixedCosts)
    : money(inputs.revenue * contributionPercent / 100 - inputs.fixedCosts);
  assumptions.push('Custos fixos separados dos percentuais variáveis; informe cada despesa uma única vez. Não inclui dívidas, investimentos nem calendário de recebimentos.');
  if (contributionRatio <= 0) return {
    ok: true, tool: inputs.tool, formulaVersion: FORMULA_VERSION, inputs, assumptions,
    result: { status: 'non_positive_margin', contributionPercent, breakEvenRevenue: null, revenueGap: null, operationalResult },
    summary: 'Os custos variáveis consomem toda a receita ou mais. Nessas condições, aumentar as vendas não cobre os custos fixos. Revise os percentuais com a equipe.',
  };
  const breakEvenRevenue = money(inputs.fixedCosts / contributionRatio);
  const revenueGap = money(inputs.revenue - breakEvenRevenue);
  return {
    ok: true, tool: inputs.tool, formulaVersion: FORMULA_VERSION, inputs, assumptions,
    result: { status: 'valid', contributionPercent, breakEvenRevenue, revenueGap, operationalResult },
    summary: `Neste cenário, a receita mensal estimada para cobrir os custos é ${currency(breakEvenRevenue)}. Sua receita está ${currency(Math.abs(revenueGap))} ${revenueGap >= 0 ? 'acima' : 'abaixo'} desse ponto. Essa diferença de receita não é o valor do lucro ou prejuízo.`,
  };
}

function calculatePurchasesBreakeven(inputs) {
  const revenueCents = Math.round(inputs.revenue * 100);
  const variableCents = Math.round(inputs.purchasesAmount * 100)
    + Math.round(inputs.taxAmount * 100) + Math.round(inputs.otherVariableAmount * 100);
  const feesBasisPoints = Math.round(inputs.feesPercent * 100);
  // Não arredondar compras/receita, impostos/receita ou outros/receita para
  // percentuais intermediários. Os produtos inteiros cabem na precisão segura
  // do Number dentro dos limites de entrada; margem zero permanece exata.
  const contributionNumerator = revenueCents * (10000 - feesBasisPoints) - variableCents * 10000;
  const contributionRatio = contributionNumerator / (revenueCents * 10000);
  const contributionPercent = money(contributionRatio * 100);
  const operationalResult = money(contributionNumerator / 1_000_000 - inputs.fixedCosts);
  const assumptions = [
    'Cenário mensal baseado nos valores informados. Não comprova lucro contábil, economia realizada ou fluxo de caixa.',
    ...financialReferenceAssumptions(inputs),
    'As compras de ingredientes e bebidas são usadas como aproximação dos custos variáveis, não como CMV apurado. A formação ou redução de estoque pode distorcer esta estimativa.',
    'A projeção mantém compras, impostos, taxas e outros custos variáveis na mesma proporção das vendas do último mês. Os valores em reais não são tratados como custos fixos.',
    `Impostos informados: ${currency(inputs.taxAmount)} de guia ou valor declarado. A proporção sobre as vendas é uma hipótese gerencial, não uma alíquota fiscal confirmada. Não inclui guias atrasadas, multas ou tributos da folha já considerados nos custos fixos.`,
    'Informe cada despesa uma única vez. Custos fixos ficam separados das compras, dos impostos, das taxas e dos outros custos variáveis. Não inclui dívidas, investimentos nem calendário de recebimentos.',
  ];
  const common = { ok: true, tool: inputs.tool, formulaVersion: PURCHASES_FORMULA_VERSION, inputs, assumptions };
  if (contributionNumerator <= 0) return {
    ...common,
    result: { status: 'non_positive_margin', contributionPercent, breakEvenRevenue: null, revenueGap: null, operationalResult },
    summary: 'As compras e os demais custos variáveis informados consomem toda a receita ou mais. Mantida essa proporção, aumentar as vendas não cobre os custos fixos. Revise os valores e a movimentação do estoque com a equipe.',
  };
  const breakEvenRevenue = money(inputs.fixedCosts / contributionRatio);
  const revenueGap = money(inputs.revenue - breakEvenRevenue);
  return {
    ...common,
    result: { status: 'valid', contributionPercent, breakEvenRevenue, revenueGap, operationalResult },
    summary: `Neste cenário, a receita mensal estimada para cobrir os custos é ${currency(breakEvenRevenue)}. Sua receita está ${currency(Math.abs(revenueGap))} ${revenueGap >= 0 ? 'acima' : 'abaixo'} desse ponto. As compras são uma aproximação do consumo, e essa diferença de receita não é o valor do lucro ou prejuízo.`,
  };
}
