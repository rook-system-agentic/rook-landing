export type CmvGuideValidationErrors = Record<string, string>;

export interface CmvGuideRequest {
  submissionId: string;
  name: string;
  email: string;
  phone: string;
  restaurant: string;
  commercialContactRequested: boolean;
}

export type CmvGuideValidationResult =
  | { ok: false; errors: CmvGuideValidationErrors }
  | { ok: true; value: CmvGuideRequest };

export function normalizeCmvGuidePhone(value: unknown): string | null;
export function validateCmvGuideInput(candidate: unknown): CmvGuideValidationResult;
export function isCmvGuideChallenge(value: unknown): value is { token: string; solution: string };
