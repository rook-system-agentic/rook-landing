export const FINANCIAL_REFERENCE_BASES = Object.freeze(['last_month', 'monthly_average_12m']);
const labels = { last_month: 'Último mês informado', monthly_average_12m: 'Média mensal dos últimos 12 meses' };

/** No clock inference: a relative declaration must never become a fabricated date. */
export function validateFinancialReference(candidate, { required = true } = {}) {
  const hasBasis = candidate?.referenceBasis !== undefined;
  const hasPeriod = candidate?.period !== undefined;
  if (hasBasis && hasPeriod) return { ok: false, errors: { referenceBasis: 'Use uma única referência: último mês, média mensal ou mês informado.' } };
  if (hasBasis) return FINANCIAL_REFERENCE_BASES.includes(candidate.referenceBasis)
    ? { ok: true, value: { referenceBasis: candidate.referenceBasis } }
    : { ok: false, errors: { referenceBasis: 'Escolha o último mês ou a média mensal dos últimos 12 meses.' } };
  if (hasPeriod) return typeof candidate.period === 'string' && candidate.period.length === 7 && /^\d{4}-(0[1-9]|1[0-2])$/.test(candidate.period)
    ? { ok: true, value: { period: candidate.period } }
    : { ok: false, errors: { period: 'Informe um mês válido no formato YYYY-MM.' } };
  return required ? { ok: false, errors: { referenceBasis: 'Escolha o último mês ou a média mensal dos últimos 12 meses.' } } : { ok: true, value: {} };
}

export function financialReferenceLabel(candidate) {
  const reference = validateFinancialReference(candidate);
  if (!reference.ok) return '';
  if (reference.value.referenceBasis) return labels[reference.value.referenceBasis];
  const [year, month] = reference.value.period.split('-');
  return `${month}/${year}`;
}

export function financialReferenceAssumptions(candidate) {
  if (candidate?.referenceBasis === 'monthly_average_12m') return [
    'Receita e custos em reais são médias mensais dos mesmos 12 meses; os valores não são divididos por 12 novamente.',
    'Percentuais representam custo total dividido pela receita total da mesma janela, não a média simples dos percentuais mensais.',
    'O resultado é um cenário mensal representativo; o imposto estimado sobre o faturamento médio não é a média dos impostos efetivamente pagos.',
  ];
  if (candidate?.referenceBasis === 'last_month') return ['Receita e custos se referem ao mesmo último mês informado pelo visitante; não foi atribuída uma data calendário.'];
  return [];
}
