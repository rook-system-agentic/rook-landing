import type { CmvGuideRequest } from "./cmv-guide-validation.mjs";

export type CmvGuideRecordKind = "test" | "live";
export type CmvGuideDeliveryState = "queued" | "processing" | "retry" | "provider_accepted" | "delivered" | "failed" | "needs_reconciliation" | "bounced";
export type CmvGuideFinishOutcome = "accepted" | "retry" | "failed" | "needs_reconciliation";

export class CmvGuidePersistenceError extends Error {
  code: string;
  retryAfterSeconds: number;
  constructor(code: string, retryAfterSeconds?: number);
}

export interface CmvGuideClaim {
  id: string;
  request: CmvGuideRequest;
  record_kind: CmvGuideRecordKind;
  material_version: string;
  delivery_status: CmvGuideDeliveryState;
  attempts: number;
  first_attempt_at: string | null;
  lease_token: string;
  envelope_hash: string | null;
}

export function publicDeliveryState(value: string): CmvGuideDeliveryState;
export function createCmvGuidePersistence(options: { adminRequest: (path: string, options?: RequestInit) => Promise<unknown> }): {
  enqueue(request: CmvGuideRequest, recordKind: CmvGuideRecordKind): Promise<{ result: "created" | "existing"; requestId: string; state: CmvGuideDeliveryState }>;
  claim(limit: number, recordKind: CmvGuideRecordKind): Promise<CmvGuideClaim[]>;
  prepare(requestId: string, leaseToken: string, envelopeHash: string): Promise<boolean>;
  finish(requestId: string, leaseToken: string, outcome: CmvGuideFinishOutcome, providerMessageId?: string | null, errorCode?: string | null): Promise<boolean>;
  listReceipts(limit: number, recordKind: CmvGuideRecordKind): Promise<Array<{ id: string; providerMessageId: string }>>;
  recordReceipt(requestId: string, providerMessageId: string, deliveryState: "delivered" | "bounced" | "failed"): Promise<boolean>;
};
