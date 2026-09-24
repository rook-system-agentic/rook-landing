import {
  calculateTax,
  TAX_CALCULATOR_VERSION,
  PARAMETER_VERSION,
  PARAMETER_EFFECTIVE_DATE,
  SIMPLES_SUBLIMITE,
  SIMPLES_TETO,
} from './vendor/rook-tax-calculator-4b6c69ee.mjs';

export const CMV_TAX_MODEL_VERSION = 'rook-cmv-tax-2026-09-24';
export const CMV_TAX_MODEL_SOURCE = Object.freeze({
  repository: 'rook-system-agentic/rook-system',
  path: 'apps/web/src/lib/tax-calculator.ts',
  commit: '4b6c69ee6d20c16c4e21099f2315ab6f0d7abdcf',
  sourceSha256: '877ded5a2d2dc2ddd684025738970aa8bf66df4af22fb98f99a40c4c052687dc',
  calculatorVersion: TAX_CALCULATOR_VERSION,
  parameterVersion: PARAMETER_VERSION,
  parameterEffectiveDate: PARAMETER_EFFECTIVE_DATE,
  snapshotDate: '2026-09-24',
});

export const TAX_STATES = Object.freeze([
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
].map(([code, label]) => Object.freeze({ code, label })));

const toCents = value => Math.round((value + Number.EPSILON) * 100);

/**
 * Cenário público com as hipóteses do diagnóstico Rook, aprovado em 24/09/2026.
 * Não usa o resolvedor de dados fiscais reais: só existe o faturamento informado
 * de um mês. O snapshot preserva a anualização, o enquadramento hipotético e as
 * transições do motor original; não suaviza faixas nem consulta parâmetros live.
 *
 * @throws {RangeError} Se o faturamento ou a UF não forem válidos.
 */
export function estimateCmvRevenue(grossRevenue, state = 'SP') {
  if (typeof grossRevenue !== 'number' || !Number.isFinite(grossRevenue)
    || grossRevenue <= 0 || grossRevenue > 1_000_000_000 || toCents(grossRevenue) <= 0) {
    throw new RangeError('Informe um faturamento mensal maior que zero e de até R$ 1 bilhão.');
  }
  const selectedState = TAX_STATES.find(item => item.code === state);
  if (!selectedState) throw new RangeError('Selecione uma UF válida para o cenário.');

  const grossCents = toCents(grossRevenue);
  const gross = grossCents / 100;
  const annualRevenue = gross * 12;
  const tax = calculateTax(gross, undefined, state);
  // Receita líquida deduz tributos sobre VENDA. taxAmount do motor também contém
  // IRPJ/CSLL no Presumido, que pertencem ao resultado e não a esta dedução.
  const taxCents = toCents(tax.taxOnRevenue);
  const sublimitApplied = tax.regime === 'simples_nacional'
    && annualRevenue > SIMPLES_SUBLIMITE && annualRevenue <= SIMPLES_TETO;
  const assumptions = [
    'Estimativa gerencial; não é apuração fiscal nem imposto efetivamente pago.',
    'O faturamento do mês × 12 é a hipótese anual, não o histórico observado.',
    `Regime estimado: ${tax.regimeName}. UF de referência: ${selectedState.label} (${state}). Não comprova enquadramento tributário.`,
    tax.regime === 'simples_nacional'
      ? (sublimitApplied
        ? 'Sublimite estimado: DAS federal e ICMS da UF com hipótese de regime especial (REA).'
        : 'O DAS estimado é deduzido integralmente da receita neste cenário.')
      : 'Dedução de PIS, COFINS e ICMS com hipótese de REA. IRPJ e CSLL não reduzem esta receita líquida.',
    'Parâmetros internos versionados em 24/09/2026; sem consulta fiscal em tempo real. Outras deduções não informadas não foram estimadas.',
  ];

  return {
    grossRevenue: gross,
    taxAmount: taxCents / 100,
    netRevenue: (grossCents - taxCents) / 100,
    taxPercent: tax.taxOnRevenueRate,
    regime: tax.regime,
    regimeLabel: `${tax.regimeName} (estimado)`,
    state,
    annualRevenue,
    sublimitApplied,
    taxModelVersion: CMV_TAX_MODEL_VERSION,
    assumptions,
  };
}
