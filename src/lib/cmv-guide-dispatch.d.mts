export class CmvGuideDispatchError extends Error {
  code: string;
  constructor(code: string);
}

export interface CmvGuideDispatchCounters {
  claimed: number;
  accepted: number;
  retried: number;
  failed: number;
  delivered: number;
  bounced: number;
  reconciled: number;
  needsReconciliation: number;
}

export function runCmvGuideDispatch(options: {
  recordKind: "test" | "live";
  testEmail?: string | null;
  claim(limit: number, recordKind: "test" | "live"): Promise<any[]>;
  prepare(requestId: string, leaseToken: string, envelopeHash: string): Promise<boolean>;
  finish(requestId: string, leaseToken: string, outcome: string, providerId?: string | null, errorCode?: string | null): Promise<boolean>;
  loadMaterials(claim: any): Promise<Array<{ filename: string; content: string }>>;
  buildEnvelope(claim: any, attachments: Array<{ filename: string; content: string }>): Promise<any> | any;
  sendEmail(envelope: any): Promise<{ id: string }>;
  listReceipts?(limit: number, recordKind: "test" | "live"): Promise<any[]>;
  readReceipt?(providerId: string): Promise<string | null>;
  recordReceipt?(requestId: string, providerId: string, state: "delivered" | "bounced" | "failed"): Promise<boolean>;
  limit?: number;
}): Promise<CmvGuideDispatchCounters>;
