import { segmentoPorSlug, BENCHMARK_FONTE } from './cmv-benchmarks.mjs';
import { calculateGrossCmv } from './cmv-gross-simulation.mjs';
import { validateFinancialReference, financialReferenceAssumptions } from './financial-reference.mjs';

export const FORMULA_VERSION = 'rook-consultivo-1';
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Aceita pt-BR e o ponto decimal dos teclados móveis, sem perder sinais.
 * Um ponto seguido de três dígitos continua sendo separador de milhar pt-BR;
 * decimais com ponto têm uma ou duas casas e não misturam agrupamento.
 */
export function parseBrazilianNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.length > 40) return null;
  const raw = value.trim().replace(/^R\$\s*/, '').replace(/\s*%$/, '');
  if (/^-?\d+\.\d{1,2}$/.test(raw)) return Number(raw);
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(raw)) return null;
  const parsed = Number(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Cálculo sem CRM, IA ou defaults financeiros. Valores monetários em reais. */
export function calculateFinancialSimulation(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { ok: false, errors: { form: 'Informe os dados do cenário.' } };
  }
  // Explicit gross scenarios use the versioned estimate. Legacy net and PE are unchanged.
  if (candidate.tool === 'cmv' && candidate.revenueBasis === 'gross') return calculateGrossCmv(candidate);
  const reference = validateFinancialReference(candidate, { required: false });
  if (!reference.ok) return reference;
  const errors = {};
  const inputs = { tool: candidate.tool, revenueBasis: candidate.revenueBasis, ...reference.value };
  if (!['cmv', 'breakeven'].includes(candidate.tool)) errors.tool = 'Escolha uma ferramenta.';
  const fields = candidate.tool === 'breakeven'
    ? ['revenue', 'cmvPercent', 'fixedCosts', 'taxPercent', 'feesPercent', 'otherVariablePercent']
    : ['revenue', 'cmvPercent'];
  for (const field of fields) {
    const value = candidate[field];
    const limit = field.endsWith('Percent') ? 100 : 1_000_000_000;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > limit || (field === 'revenue' && money(value) === 0)) {
      errors[field] = field.endsWith('Percent') ? 'Informe um percentual entre 0 e 100.' : 'Informe um valor válido em reais.';
    } else inputs[field] = money(value);
  }
  const expectedBasis = candidate.tool === 'cmv' ? 'net' : 'gross';
  if (candidate.revenueBasis !== expectedBasis) errors.revenueBasis = expectedBasis === 'net'
    ? 'Use receita líquida e CMV calculado sobre essa mesma receita.'
    : 'Use receita bruta e percentuais calculados sobre essa mesma receita.';
  if (candidate.tool === 'cmv') {
    if (typeof candidate.segment !== 'string' || (candidate.segment !== 'other' && !segmentoPorSlug(candidate.segment))) {
      errors.segment = 'Confirme o segmento de comparação.';
    } else inputs.segment = candidate.segment;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
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
  const variablePercent = money(inputs.cmvPercent + inputs.taxPercent + inputs.feesPercent + inputs.otherVariablePercent);
  const contributionPercent = money(100 - variablePercent);
  const operationalResult = money(inputs.revenue * contributionPercent / 100 - inputs.fixedCosts);
  assumptions.push('Custos fixos separados dos percentuais variáveis; informe cada despesa uma única vez. Não inclui dívidas, investimentos nem calendário de recebimentos.');
  if (contributionPercent <= 0) return {
    ok: true, tool: inputs.tool, formulaVersion: FORMULA_VERSION, inputs, assumptions,
    result: { status: 'non_positive_margin', contributionPercent, breakEvenRevenue: null, revenueGap: null, operationalResult },
    summary: 'Os custos variáveis consomem toda a receita ou mais. Nessas condições, aumentar as vendas não cobre os custos fixos. Revise os percentuais com a equipe.',
  };
  const breakEvenRevenue = money(inputs.fixedCosts / (contributionPercent / 100));
  const revenueGap = money(inputs.revenue - breakEvenRevenue);
  return {
    ok: true, tool: inputs.tool, formulaVersion: FORMULA_VERSION, inputs, assumptions,
    result: { status: 'valid', contributionPercent, breakEvenRevenue, revenueGap, operationalResult },
    summary: `Neste cenário, a receita mensal estimada para cobrir os custos é ${currency(breakEvenRevenue)}. Sua receita está ${currency(Math.abs(revenueGap))} ${revenueGap >= 0 ? 'acima' : 'abaixo'} desse ponto. Essa diferença de receita não é o valor do lucro ou prejuízo.`,
  };
}
