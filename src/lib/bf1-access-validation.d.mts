import type { LeadAttribution } from "./lead-attribution.mjs";

export declare const BF1_ACCESS_CAMPAIGN: "black_rook_2026";
export declare const BF1_ACCESS_NOTICE_VERSION: string;
export interface Bf1AccessRequest {
  submissionId: string;
  name: string;
  email: string;
  phone: string;
  restaurant: string;
  commercialContactRequested: boolean;
  attribution?: LeadAttribution | null;
}
export type Bf1AccessValidationResult =
  | { ok: false; errors: Record<string, string> }
  | { ok: true; value: Bf1AccessRequest };
export declare function validateBf1AccessInput(candidate: unknown): Bf1AccessValidationResult;
export declare function isBf1AccessChallenge(value: unknown): value is { token: string; solution: string };
