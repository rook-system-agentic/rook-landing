import type { FinancialSuccess, FinancialTool } from './financial-simulation.mjs';
import type { FinancialReferenceBasis } from './financial-reference.mjs';
import type { LeadAttribution } from './lead-attribution.mjs';

export interface FinancialAcquisitionLead {
  submissionId: string;
  name: string;
  email: string;
  phone: string;
  captureKind: 'financial_tool';
  intent: FinancialTool;
  commercialContactRequested: boolean;
  demonstrationRequested: false;
  simulation: FinancialSuccess;
  segment?: string;
  taxState?: string;
  revenueBand?: string;
  referenceBasis?: FinancialReferenceBasis;
  period?: string;
  attribution: LeadAttribution | null;
}
export function validateFinancialAcquisition(candidate: unknown):
  | { ok: true; value: FinancialAcquisitionLead }
  | { ok: false; errors: Record<string, string> };
