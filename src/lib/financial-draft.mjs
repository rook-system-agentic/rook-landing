import { parseBrazilianNumber } from './financial-number.mjs';
import { validateFinancialReference } from './financial-reference.mjs';

const MONEY_LIMIT = 1_000_000_000;
export const FINANCIAL_NUMBER_FIELDS = Object.freeze(['revenue', 'cmvAmount', 'cmvPercent', 'purchasesAmount', 'fixedCosts', 'taxAmount', 'taxPercent', 'feesPercent', 'otherVariableAmount', 'otherVariablePercent']);

/** Dados parciais são declarações, nunca um resultado calculado. */
export function readFinancialDraft(candidate, tool) {
  if (!candidate || !['cmv', 'breakeven'].includes(tool)) return { inputs: null, missingFields: [] };
  const gross = tool === 'cmv' && candidate.revenueBasis === 'gross';
  const purchases = tool === 'breakeven' && candidate.costInputMode === 'purchases_amount';
  const fields = tool === 'cmv'
    ? ['revenue', gross && candidate.cmvInputMode === 'amount' ? 'cmvAmount' : 'cmvPercent']
    : ['revenue', purchases ? 'purchasesAmount' : 'cmvPercent', 'fixedCosts', purchases || candidate.taxInputMode === 'amount' ? 'taxAmount' : 'taxPercent', 'feesPercent', purchases ? 'otherVariableAmount' : 'otherVariablePercent'];
  const inputs = { tool };
  const missingFields = [];
  for (const field of fields) {
    const value = parseBrazilianNumber(candidate[field]);
    if (value !== null && value >= 0 && value <= (field.endsWith('Percent') ? 100 : MONEY_LIMIT) && (field !== 'revenue' || value > 0)) inputs[field] = value;
    else missingFields.push(field);
  }
  const reference = validateFinancialReference(candidate);
  if (reference.ok) Object.assign(inputs, reference.value);
  else missingFields.push('referenceBasis');
  for (const field of ['revenueBasis', 'costInputMode', 'taxInputMode', 'cmvInputMode', 'taxState', 'taxModelVersion', 'segment']) {
    if (typeof candidate[field] === 'string' && candidate[field].length <= 80) inputs[field] = candidate[field];
  }
  // Mesmo com todos os números preenchidos, ainda falta confirmar e registrar
  // a análise. Não promover um rascunho a resultado pelo simples preenchimento.
  if (!missingFields.length) missingFields.push('resultConfirmation');
  return { inputs, missingFields };
}
