import { culinarySegments } from './culinary-segments.mjs';
import { CMV_TAX_MODEL_VERSION, TAX_STATES } from './cmv-input-options.mjs';
import { validateFinancialReference } from './financial-reference.mjs';

// Normaliza a precisão da entrada. Não calcula imposto, CMV ou referência.
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;

/** Validação pública sem motor financeiro, alíquotas ou benchmarks internos. */
export function validateFinancialInput(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { ok: false, errors: { form: 'Informe os dados do cenário.' } };
  }
  if (candidate.tool === 'cmv' && candidate.revenueBasis === 'gross') return validateGrossCmvInput(candidate);
  const reference = validateFinancialReference(candidate, { required: false });
  if (!reference.ok) return reference;
  const errors = {};
  const inputs = { tool: candidate.tool, revenueBasis: candidate.revenueBasis, ...reference.value };
  if (!['cmv', 'breakeven'].includes(candidate.tool)) errors.tool = 'Escolha uma ferramenta.';
  if (candidate.tool === 'breakeven') {
    const hasAmount = candidate.taxAmount !== undefined;
    const hasPercent = candidate.taxPercent !== undefined;
    if (candidate.taxInputMode !== undefined && !['amount', 'percent'].includes(candidate.taxInputMode)) {
      errors.taxInputMode = 'Informe os impostos em reais ou em percentual.';
    } else if (hasAmount && hasPercent) {
      errors.taxInputMode = 'Informe os impostos em reais ou em percentual, sem misturar as duas formas.';
    } else if (hasAmount && candidate.taxInputMode !== 'amount') {
      errors.taxInputMode = 'Selecione a opção em reais para informar o valor dos impostos.';
    } else if (hasPercent && candidate.taxInputMode === 'amount') {
      errors.taxInputMode = 'Selecione a opção em percentual para informar a alíquota dos impostos.';
    }
    // A ausência do modo preserva o contrato antigo, baseado em taxPercent.
    if (candidate.taxInputMode !== undefined) inputs.taxInputMode = candidate.taxInputMode;
  }
  const taxField = candidate.taxInputMode === 'amount' ? 'taxAmount' : 'taxPercent';
  const fields = candidate.tool === 'breakeven'
    ? ['revenue', 'cmvPercent', 'fixedCosts', taxField, 'feesPercent', 'otherVariablePercent']
    : ['revenue', 'cmvPercent'];
  for (const field of fields) {
    const value = candidate[field];
    const limit = field.endsWith('Percent') ? 100 : 1_000_000_000;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > limit || (field === 'revenue' && money(value) === 0)) {
      errors[field] = field.endsWith('Percent') ? 'Informe um percentual entre 0 e 100.'
        : field === 'taxAmount' ? 'Informe o valor dos impostos em reais.' : 'Informe um valor válido em reais.';
    } else inputs[field] = money(value);
  }
  const expectedBasis = candidate.tool === 'cmv' ? 'net' : 'gross';
  if (candidate.revenueBasis !== expectedBasis) errors.revenueBasis = expectedBasis === 'net'
    ? 'Use receita líquida e CMV calculado sobre essa mesma receita.'
    : 'Use receita bruta e percentuais calculados sobre essa mesma receita.';
  if (candidate.tool === 'cmv') {
    if (typeof candidate.segment !== 'string' || (candidate.segment !== 'other' && !culinarySegments.some(segment => segment.slug === candidate.segment))) {
      errors.segment = 'Confirme o segmento de comparação.';
    } else inputs.segment = candidate.segment;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, inputs };
}

function validateGrossCmvInput(candidate) {
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
  const segment = typeof candidate.segment === 'string' ? culinarySegments.find(segment => segment.slug === candidate.segment) : null;
  if (!segment && candidate.segment !== 'other') errors.segment = 'Confirme o segmento de comparação.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const inputs = {
    tool: 'cmv', revenueBasis: 'gross', revenue: money(candidate.revenue),
    cmvInputMode: candidate.cmvInputMode, [field]: money(candidate[field]),
    segment: candidate.segment, taxState: candidate.taxState, taxModelVersion: CMV_TAX_MODEL_VERSION,
    ...reference.value,
  };
  return { ok: true, inputs };
}
