import { calculateFinancialSimulation } from './financial-simulation.mjs';

export const DIAGNOSTIC_CONTEXT_EVENT = 'rook:diagnostic-context';

const fields = {
  cmv: ['period', 'segment', 'revenue', 'cmvPercent'],
  breakeven: ['period', 'revenue', 'cmvPercent', 'fixedCosts', 'taxPercent', 'feesPercent', 'otherVariablePercent'],
};

// Só números e metadados do cenário transitam entre calculadora e formulário.
// Valores marcados como desconhecidos nunca reutilizam uma resposta anterior.
export function readDiagnosticContext(detail) {
  if (!detail || typeof detail.sourceId !== 'string' || !detail.sourceId
    || !Object.hasOwn(fields, detail.intent)) return null;
  const answers = {};
  for (const key of fields[detail.intent]) {
    if (!detail.unknown?.[key] && typeof detail.answers?.[key] === 'string') {
      answers[key] = detail.answers[key].slice(0, 40);
    }
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(answers.period || '')) return null;
  const calculated = detail.simulation ? calculateFinancialSimulation(detail.simulation) : null;
  if (detail.simulation && (!calculated?.ok || calculated.tool !== detail.intent
    || fields[detail.intent].some(key => detail.unknown?.[key]))) return null;
  return { sourceId: detail.sourceId, intent: detail.intent, answers, result: calculated };
}
