import { segmentoPorSlug, BENCHMARK_FONTE } from './cmv-benchmarks.mjs';
import { estimateCmvRevenue, CMV_TAX_MODEL_VERSION, TAX_STATES } from './cmv-tax-estimate.mjs';
import { validateFinancialReference, financialReferenceAssumptions } from './financial-reference.mjs';

export const CMV_GROSS_FORMULA_VERSION = 'rook-cmv-gross-1';
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value, maximumFractionDigits = 2) => `${value.toLocaleString('pt-BR', { maximumFractionDigits })}%`;

/** Inputs stay in the visitor's original basis, so revalidation never deducts tax twice. */
export function calculateGrossCmv(candidate) {
  const reference = validateFinancialReference(candidate, { required: false });
  if (!reference.ok) return reference;
  const errors = {};
  if (typeof candidate.revenue !== 'number' || !Number.isFinite(candidate.revenue)
    || money(candidate.revenue) <= 0 || candidate.revenue > 1_000_000_000) {
    errors.revenue = 'Informe um faturamento válido em reais.';
  }
  if (!['amount', 'gross_percent', 'net_percent'].includes(candidate.cmvInputMode)) {
    errors.cmvInputMode = 'Informe como você conhece o CMV: em reais ou em percentual.';
  }
  const field = candidate.cmvInputMode === 'amount' ? 'cmvAmount' : 'cmvPercent';
  const limit = field === 'cmvAmount' ? 1_000_000_000 : 100;
  if (typeof candidate[field] !== 'number' || !Number.isFinite(candidate[field])
    || candidate[field] < 0 || candidate[field] > limit) {
    errors[field] = field === 'cmvAmount' ? 'Informe o custo dos ingredientes consumidos em reais.' : 'Informe um percentual entre 0 e 100.';
  }
  if (!TAX_STATES.some(state => state.code === candidate.taxState)) errors.taxState = 'Selecione o estado usado na estimativa de impostos.';
  if (candidate.taxModelVersion !== CMV_TAX_MODEL_VERSION) errors.taxModelVersion = 'Atualize a calculadora para usar as premissas atuais de impostos.';
  const segment = typeof candidate.segment === 'string' ? segmentoPorSlug(candidate.segment) : null;
  if (!segment && candidate.segment !== 'other') errors.segment = 'Confirme o segmento de comparação.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const inputs = {
    tool: 'cmv', revenueBasis: 'gross', revenue: money(candidate.revenue),
    cmvInputMode: candidate.cmvInputMode, [field]: money(candidate[field]),
    segment: candidate.segment, taxState: candidate.taxState, taxModelVersion: CMV_TAX_MODEL_VERSION,
    ...reference.value,
  };
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
