import type { LeadAttribution } from "./lead-attribution.mjs";

export type CmvGuideValidationErrors = Record<string, string>;

export interface CmvGuideRequest {
  submissionId: string;
  name: string;
  email: string;
  phone: string;
  restaurant: string;
  commercialContactRequested: boolean;
  /** Atribuição autodeclarada da visita (ROO-1642); só o pedido vindo do formulário a carrega. O claim da fila não a devolve. */
  attribution?: LeadAttribution | null;
}

export type CmvGuideValidationResult =
  | { ok: false; errors: CmvGuideValidationErrors }
  | { ok: true; value: CmvGuideRequest };

export function normalizeCmvGuidePhone(value: unknown): string | null;
export function validateCmvGuideInput(candidate: unknown): CmvGuideValidationResult;
export function isCmvGuideChallenge(value: unknown): value is { token: string; solution: string };
