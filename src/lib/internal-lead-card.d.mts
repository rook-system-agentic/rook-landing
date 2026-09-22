import type {AcquisitionLead} from './acquisition.mjs';
export const INTERNAL_LEAD_CARD_VERSION: 'rook-internal-lead-card-1';
export interface PersistedLeadReceipt {
  contactId: string;
  dealId: string;
  /** ISO UTC normalizado, obtido pelo servidor após a resposta válida do CRM. */
  persistedAt: string;
}
export interface InternalLeadCard {
  version: typeof INTERNAL_LEAD_CARD_VERSION;
  deliveryState: 'prepared';
  source: 'site_form';
  notificationKey: string;
  sourceReference: {submissionId: string; contactId: string; dealId: string};
  diagnostic: {
    status: 'not_run' | 'incomplete' | 'recalculated';
    provenance: 'none' | 'visitor_partial_inputs' | 'rook_deterministic_engine';
    formulaVersion: string | null;
  };
  body: string;
}
export function buildInternalLeadCard(input: {lead: AcquisitionLead; receipt: PersistedLeadReceipt}): InternalLeadCard;
