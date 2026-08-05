import type { CommercialLead } from "./commercial-lead-validation.mjs";

export interface HeaderReader {
  get(name: string): string | null;
}

export interface CommercialLeadChallenge {
  token: string;
  difficulty: number;
  expiresInSeconds: number;
}

export interface CommercialLeadChallengeAnswer {
  token: string;
  solution: string;
}

export interface CommercialLeadRateLimitDecision {
  allowed: boolean;
  reason:
    | "allowed"
    | "nonce_replayed"
    | "ip_rate_limited"
    | "identity_rate_limited";
  retryAfterSeconds: number;
}

export class CommercialLeadAbuseProtectionError extends Error {
  code: string;
  constructor(code: string);
}

export const COMMERCIAL_LEAD_RATE_LIMITS: Readonly<{
  windowSeconds: number;
  ip: number;
  identity: number;
}>;

export const COMMERCIAL_LEAD_CHALLENGE: Readonly<{
  difficulty: number;
  ttlSeconds: number;
  maxClockSkewSeconds: number;
}>;

export function resolveCommercialLeadClientIp(headers: HeaderReader): string | null;
export function hashCommercialLeadSubject(secret: string, scope: string, rawValue: string): string;
export function hasValidCommercialLeadProof(token: string, solution: string, difficulty: number): boolean;

export function createCommercialLeadAbuseProtection(options: {
  adminRequest: (path: string, options?: RequestInit) => Promise<unknown>;
  secret: string;
  now?: () => number;
  randomBytes?: (size: number) => { toString(encoding: "hex"): string };
}): {
  issueChallenge(headers: HeaderReader): CommercialLeadChallenge;
  verifyChallenge(headers: HeaderReader, challenge: unknown): boolean;
  consumeAbuseGate(
    headers: HeaderReader,
    lead: CommercialLead,
    challenge: CommercialLeadChallengeAnswer | null,
  ): Promise<CommercialLeadRateLimitDecision>;
};
