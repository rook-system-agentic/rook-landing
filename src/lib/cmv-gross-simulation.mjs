import { validateFinancialInput } from './financial-input.mjs';
import { segmentoPorSlug, BENCHMARK_FONTE } from './cmv-benchmarks.mjs';
import { estimateCmvRevenue } from './cmv-tax-estimate.mjs';
import { financialReferenceAssumptions } from './financial-reference.mjs';

export const CMV_GROSS_FORMULA_VERSION = 'rook-cmv-gross-1';
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value, maximumFractionDigits = 2) => `${value.toLocaleString('pt-BR', { maximumFractionDigits })}%`;

/** Inputs stay in the visitor's original basis, so revalidation never deducts tax twice. */
export function calculateGrossCmv(candidate) {
  const validated = validateFinancialInput(candidate);
  if (!validated.ok) return validated;
  const { inputs } = validated;
  const segment = segmentoPorSlug(inputs.segment);
  // Tax, net revenue and all result fields are derived here, never trusted from the client.
  const estimate = estimateCmvRevenue(inputs.revenue, inputs.taxState);
  if (estimate.netRevenue <= 0) return { ok: false, errors: { revenue: 'Não foi possível estimar uma receita após impostos positiva.' } };
  const cmvAmount = inputs.cmvInputMode === 'amount' ? inputs.cmvAmount
    : money((inputs.cmvInputMode === 'gross_percent' ? inputs.revenue : estimate.netRevenue) * inputs.cmvPercent / 100);
  const comparisonCmvPercent = cmvAmount / estimate.netRevenue * 100;
  const assumptions = [
    'Cenário mensal estimado. Não comprova lucro contábil, economia realizada ou imposto efetivamente devido.',
    ...estimate.assumptions,
    ...financialReferenceAssumptions(inputs),
    `Conta: ${currency(inputs.revenue)} de faturamento bruto − ${currency(estimate.taxAmount)} de impostos estimados (${percent(estimate.taxPercent, 3)}) = ${currency(estimate.netRevenue)} de receita líquida estimada.`,
    inputs.cmvInputMode === 'amount'
      ? `CMV informado: ${currency(cmvAmount)} de ingredientes consumidos. Compras isoladas não medem consumo de estoque.`
      : `CMV informado: ${percent(inputs.cmvPercent)} sobre ${inputs.cmvInputMode === 'gross_percent' ? 'o faturamento bruto' : 'a receita líquida estimada'}; custo correspondente: ${currency(cmvAmount)}.`,
    `CMV comparado: ${percent(comparisonCmvPercent)} da receita líquida estimada. Taxas de cartão/delivery não são deduzidas novamente dessa receita.`,
  ];
  const result = {
    status: segment ? 'valid' : 'no_reference',
    estimatedTaxAmount: estimate.taxAmount, estimatedTaxPercent: estimate.taxPercent,
    estimatedNetRevenue: estimate.netRevenue, taxRegime: estimate.regime,
    taxModelVersion: estimate.taxModelVersion, cmvAmount, comparisonCmvPercent,
    referencePercent: segment?.defaultCmvTarget ?? null,
    differencePoints: segment ? money(comparisonCmvPercent - segment.defaultCmvTarget) : null,
    // Do not multiply the rounded display percentage: it changes the monetary result.
    monthlyDifference: segment ? money(cmvAmount - estimate.netRevenue * segment.defaultCmvTarget / 100) : null,
  };
  if (segment) assumptions.push(`${BENCHMARK_FONTE}: referência indicativa de ${percent(segment.defaultCmvTarget)} sobre receita líquida, sujeita à avaliação da operação.`);
  return {
    ok: true, tool: 'cmv', formulaVersion: CMV_GROSS_FORMULA_VERSION, inputs, result, assumptions,
    summary: !segment
      ? 'Calculamos o CMV sobre a receita líquida estimada. Ainda não há referência Rook para comparar esse segmento.'
      : result.monthlyDifference > 0
        ? `O CMV representa ${percent(comparisonCmvPercent)} da receita líquida estimada. A diferença para a referência representa ${currency(result.monthlyDifference)} por mês: uma oportunidade estimada para investigar.`
        : `O CMV está ${result.monthlyDifference === 0 ? 'na referência' : 'abaixo da referência'} do segmento, considerando a receita líquida estimada. Esse indicador sozinho não determina o resultado do restaurante.`,
  };
}
