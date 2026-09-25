import { validateFinancialInput } from './financial-input.mjs';
import { validateFinancialReference } from './financial-reference.mjs';

export const DIAGNOSTIC_CONTEXT_EVENT = 'rook:diagnostic-context';

const fields = {
  cmv: ['period', 'referenceBasis', 'segment', 'revenue', 'cmvPercent', 'cmvAmount', 'revenueBasis', 'cmvInputMode', 'taxState', 'taxModelVersion'],
  breakeven: ['period', 'referenceBasis', 'revenue', 'cmvPercent', 'fixedCosts', 'taxPercent', 'feesPercent', 'otherVariablePercent'],
};

// Só números e metadados do cenário transitam entre calculadora e formulário.
// Valores marcados como desconhecidos nunca reutilizam uma resposta anterior.
export function readDiagnosticContext(detail) {
  if (!detail || typeof detail.sourceId !== 'string' || !detail.sourceId
    || !Object.hasOwn(fields, detail.intent)) return null;
  // Reject invalid or competing reference fields before string filtering can
  // hide them. A numeric/null period must not silently disappear beside a basis.
  if (!validateFinancialReference(detail.answers).ok) return null;
  const answers = {};
  for (const key of fields[detail.intent]) {
    if (!detail.unknown?.[key] && typeof detail.answers?.[key] === 'string') {
      answers[key] = detail.answers[key].slice(0, 40);
    }
  }
  const reference = validateFinancialReference(answers);
  if (!reference.ok) return null;
  const validated = detail.simulation ? validateFinancialInput(detail.simulation) : null;
  if (detail.simulation && (!validated?.ok || validated.inputs.tool !== detail.intent
    || fields[detail.intent].some(key => detail.unknown?.[key]))) return null;
  if (validated?.ok && (validated.inputs.referenceBasis !== reference.value.referenceBasis
    || (validated.inputs.period !== undefined && validated.inputs.period !== reference.value.period))) return null;
  // O formulário transporta entradas, nunca recompõe o cálculo no navegador.
  // A aquisição recalcula e registra premissas e resultados no servidor.
  const result = validated?.ok ? {
    tool: validated.inputs.tool, inputs: validated.inputs,
    summary: 'Os números deste cenário serão incluídos para a equipe continuar a análise com você.',
  } : null;
  return { sourceId: detail.sourceId, intent: detail.intent, answers, result };
}
