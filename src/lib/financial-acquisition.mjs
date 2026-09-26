import { normalizePhone, deriveRevenueBand } from './acquisition-input.mjs';
import { calculateFinancialSimulation } from './financial-simulation.mjs';
import { validateFinancialReference } from './financial-reference.mjs';
import { normalizeLeadAttribution } from './lead-attribution.mjs';

/** O resultado só pode sair após cadastrar uma solicitação completa de análise. */
export function validateFinancialAcquisition(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { ok: false, errors: { form: 'Informe seus dados e os números da análise.' } };
  }
  const errors = {};
  const text = field => typeof candidate[field] === 'string' ? candidate[field].trim() : '';
  const submissionId = text('submissionId');
  const name = text('name');
  const email = text('email').toLowerCase();
  const phone = typeof candidate.phone === 'string' && candidate.phone.length <= 32 ? normalizePhone(candidate.phone) : null;
  if (name.length < 2 || name.length > 120 || /[\r\n\u0085\u2028\u2029]/.test(name)) errors.name = 'Informe seu nome.';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Informe um e-mail válido.';
  if (!phone) errors.phone = 'Informe um WhatsApp válido com DDD.';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) errors.form = 'Atualize a página e tente novamente.';
  if (candidate.commercialContactRequested !== undefined && typeof candidate.commercialContactRequested !== 'boolean') {
    errors.commercialContactRequested = 'Confirme se deseja contato comercial.';
  }

  let simulation;
  if (!candidate.simulation || typeof candidate.simulation !== 'object' || Array.isArray(candidate.simulation)) {
    errors.simulation = 'Informe todos os números antes de ver o resultado.';
  } else {
    const reference = validateFinancialReference(candidate.simulation);
    const calculated = calculateFinancialSimulation(candidate.simulation);
    for (const validation of [reference, calculated]) {
      if (!validation.ok) for (const [field, message] of Object.entries(validation.errors)) {
        errors[`simulation.${field === 'taxModelVersion' ? 'form' : field}`] = message;
      }
    }
    if (reference.ok && calculated.ok) simulation = calculated;
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const inputs = simulation.inputs;
  return { ok: true, value: {
    submissionId, name, email, phone,
    // Nunca aceitar do navegador a classificação comercial ou um resultado pronto.
    captureKind: 'financial_tool', intent: simulation.tool,
    commercialContactRequested: candidate.commercialContactRequested === true,
    demonstrationRequested: false, simulation,
    ...(inputs.segment ? { segment: inputs.segment } : {}),
    ...(inputs.taxState ? { taxState: inputs.taxState } : {}),
    ...(inputs.revenueBasis === 'gross' ? { revenueBand: deriveRevenueBand(inputs.revenue) } : {}),
    ...(inputs.referenceBasis ? { referenceBasis: inputs.referenceBasis } : {}),
    ...(inputs.period ? { period: inputs.period } : {}),
    attribution: normalizeLeadAttribution(candidate.attribution),
  } };
}
