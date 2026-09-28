import { toPublicFinancialSimulation } from './public-financial-simulation.mjs';
import { normalizeLeadAttribution } from './lead-attribution.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROFILE_FIELDS = ['company', 'city', 'segment', 'segmentOther', 'revenueBand', 'usesErp', 'erp', 'erpOther', 'taxState'];
const pick = (value, fields) => Object.fromEntries(fields.filter(field => value[field] !== undefined).map(field => [field, value[field]]));

export class AcquisitionPersistenceError extends Error {
  constructor(code, retryAfterSeconds = 30) { super(code); this.code = code; this.retryAfterSeconds = retryAfterSeconds; }
}

/** O request identifica a solicitação; fórmulas e textos calculados ficam só no snapshot. */
export function buildAcquisitionSnapshot(lead, { capturePath = null, recordKind = 'live' } = {}) {
  const financial = lead.captureKind === 'financial_tool';
  const fullSimulation = lead.simulation || null;
  const tool = fullSimulation?.tool || (['cmv', 'breakeven'].includes(lead.intent) ? lead.intent : null);
  const analysisState = fullSimulation ? 'complete' : tool ? 'partial' : 'none';
  const inputs = fullSimulation?.inputs || (analysisState === 'partial' ? lead.inputs : null);
  const reference = inputs?.referenceBasis ? { referenceBasis: inputs.referenceBasis }
    : inputs?.period ? { period: inputs.period }
    : lead.referenceBasis ? { referenceBasis: lead.referenceBasis } : lead.period ? { period: lead.period } : null;
  const contact = pick(lead, ['name', 'email', 'phone']);
  const profile = pick(lead, PROFILE_FIELDS);
  const missingFields = analysisState === 'partial' ? lead.missingFields : [];
  const attribution = normalizeLeadAttribution(lead.attribution);
  const request = {
    contact, profile, captureKind: financial ? 'financial_tool' : 'commercial_form',
    analysisState, tool, intent: lead.intent,
    capturePath: normalizeLeadAttribution({ landing_path: capturePath })?.landing_path || null,
    commercialContactRequested: financial ? lead.commercialContactRequested === true : lead.consent === true,
    recordKind: recordKind === 'test' ? 'test' : 'live', reference, inputs, missingFields, attribution,
  };
  const snapshot = {
    schemaVersion: 1, contact, profile: { ...profile, diagnosticNotes: lead.diagnosticNotes || [] },
    reference, inputs, missingFields, fullSimulation,
    publicSimulation: fullSimulation ? toPublicFinancialSimulation(fullSimulation) : null,
    formulaVersion: fullSimulation?.formulaVersion || null,
    modelVersion: fullSimulation?.result?.taxModelVersion || fullSimulation?.inputs?.taxModelVersion || null,
    attribution,
  };
  return { request, snapshot };
}

function savedLead(submission) {
  const request = submission.request_payload;
  const snapshot = submission.snapshot;
  return {
    ...snapshot.contact, ...snapshot.profile, submissionId: submission.submission_id,
    analysisId: submission.id, analysisState: request.analysisState,
    captureKind: request.captureKind === 'financial_tool' ? 'financial_tool' : undefined,
    intent: request.intent, consent: request.captureKind === 'commercial_form' ? true : undefined,
    commercialContactRequested: request.commercialContactRequested,
    demonstrationRequested: request.captureKind === 'commercial_form',
    ...snapshot.reference, simulation: snapshot.fullSimulation, inputs: snapshot.inputs,
    missingFields: snapshot.missingFields, attribution: snapshot.attribution,
  };
}

/** Escrita local durável precede o fornecedor. Nenhum fallback libera resultado. */
export function createAcquisitionLedger({ adminRequest, crm }) {
  const rpc = (name, body) => adminRequest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
  async function persist(lead, options) {
    const { request, snapshot } = buildAcquisitionSnapshot(lead, options);
    const claim = await rpc('claim_financial_submission_v1', {
      p_submission_id: lead.submissionId, p_request: request, p_snapshot: snapshot,
    });
    if (!['claimed', 'confirmed'].includes(claim?.status)) {
      throw new AcquisitionPersistenceError(['busy', 'conflict', 'needs_reconciliation'].includes(claim?.status) ? claim.status : 'invalid_ledger_receipt', claim?.retry_after_seconds || 30);
    }
    let submission = claim.submission;
    if (!submission?.snapshot || !submission?.request_payload || submission.submission_id !== lead.submissionId) throw new AcquisitionPersistenceError('invalid_ledger_receipt');
    if (claim.status === 'confirmed') {
      if (submission.crm_status !== 'confirmed' || !UUID.test(submission.asaflow_contact_id || '') || !UUID.test(submission.asaflow_deal_id || '')) throw new AcquisitionPersistenceError('invalid_ledger_receipt');
      return { publicSimulation: submission.snapshot.publicSimulation, submissionId: lead.submissionId };
    }
    if (!UUID.test(claim.lease_token || '')) throw new AcquisitionPersistenceError('invalid_ledger_receipt');
    if (claim.verification_only && (!UUID.test(submission.asaflow_contact_id || '') || !UUID.test(submission.asaflow_deal_id || ''))) throw new AcquisitionPersistenceError('invalid_ledger_receipt');
    const transition = async (name, receipt = {}) => {
      const result = await rpc('transition_financial_submission_v1', {
        p_submission_id: lead.submissionId, p_lease_token: claim.lease_token,
        p_transition: name, p_receipt: receipt,
      });
      if (!['updated', 'confirmed'].includes(result?.status)) throw new AcquisitionPersistenceError(result?.status === 'needs_reconciliation' ? 'needs_reconciliation' : 'stale_lease');
      if (result.submission) submission = result.submission;
      return result;
    };
    try {
      const receipt = await crm.create(savedLead(submission), {
        contactId: submission.asaflow_contact_id, dealId: submission.asaflow_deal_id,
        verificationOnly: claim.verification_only === true,
        checkpoint: transition,
      });
      const confirmation = await transition('confirmed', {
        contact_id: receipt.contactId, deal_id: receipt.dealId,
        contact_ids: receipt.contactIds, proof_source: 'asaflow_api_response',
      });
      if (confirmation.status !== 'confirmed') throw new AcquisitionPersistenceError('invalid_ledger_receipt');
      return { publicSimulation: submission.snapshot.publicSimulation, submissionId: lead.submissionId };
    } catch (error) {
      // Nunca copiar erro de transporte (pode conter dados pessoais) ao ledger.
      const code = error instanceof AcquisitionPersistenceError ? error.code
        : /^asaflow_[a-z0-9_]{1,70}$/.test(error?.message || '') ? error.message : 'integration_unavailable';
      if (!['stale_lease', 'needs_reconciliation'].includes(code)) {
        try { await transition(code === 'asaflow_contact_link_mismatch' || code === 'asaflow_contact_identity_mismatch' ? 'needs_reconciliation' : 'retryable_error', { error_code: code }); }
        catch { /* Preservar o erro; lease expirada/DB indisponível nunca é sucesso. */ }
      }
      throw error;
    }
  }
  return { persist };
}
