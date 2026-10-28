import type { CmvGuideRequest } from "./cmv-guide-validation.mjs";

export const CMV_GUIDE_MATERIAL_VERSION: "cmv-guide-v2";
export const CMV_GUIDE_SUBJECT: string;
export const CMV_GUIDE_IDEMPOTENCY_PREFIX: "cmv-guide-v2";
export const CMV_GUIDE_MANIFEST: ReadonlyArray<{ objectPath: string; filename: string; sha256: string; bytes: number }>;
export function sha256Hex(bytes: Uint8Array | ArrayBuffer): string;
export function verifyCmvGuideMaterial(material: { bytes: Uint8Array }, manifestEntry: { sha256: string; bytes: number }): boolean;
export function buildCmvGuideEmail(options: {
  request: CmvGuideRequest;
  recordKind: "test" | "live";
  requestId: string;
  from: string;
  replyTo?: string | null;
  attachments: Array<{ filename: string; content: string }>;
}): {
  payload: { from: string; to: string[]; subject: string; html: string; text: string; attachments: Array<{ filename: string; content: string }>; reply_to?: string };
  idempotencyKey: string;
  envelopeHash: string;
  materialVersion: "cmv-guide-v2";
};
