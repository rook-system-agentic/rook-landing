import "server-only";

import { timingSafeEqual } from "node:crypto";
import {
  CmvGuideDispatchError,
  runCmvGuideDispatch,
} from "@/lib/cmv-guide-dispatch.mjs";
import { readCmvGuideConfig } from "@/lib/cmv-guide-config.mjs";
import { buildCmvGuideEmail } from "@/lib/cmv-guide-envelope.mjs";
import { createCmvGuidePersistence } from "@/lib/cmv-guide-persistence.mjs";
import { readCmvGuideMaterials } from "@/lib/cmv-guide-storage.mjs";
import { cmvGuideAdminRequest } from "@/lib/cmv-guide";

function safeEqual(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isCmvGuideDispatchAuthorized(request: Request) {
  const expected = process.env.CMV_GUIDE_DISPATCH_SECRET || "";
  if (expected.length < 32) return false;
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice("Bearer ".length).trim(), expected);
}

function requireDeliveryConfig() {
  const current = readCmvGuideConfig(process.env);
  if (!current.deliveryReady || !current.resendApiKey || !current.from || !current.databaseUrl || !current.serviceRoleKey) {
    throw new CmvGuideDispatchError("not_configured");
  }
  return current;
}

async function requestResend(config: NonNullable<ReturnType<typeof requireDeliveryConfig>>, path: string, init: RequestInit, parseBody: boolean) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);
  try {
    const response = await fetch(`https://api.resend.com${path}`, { ...init, redirect: "error", signal: controller.signal });
    let body: any = null;
    if (parseBody && response.ok) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    }
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

async function sendResendEmail(config: NonNullable<ReturnType<typeof requireDeliveryConfig>>, envelope: any) {
  let result: { response: Response; body: any };
  try {
    result = await requestResend(config, "/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": envelope.idempotencyKey,
      },
      body: JSON.stringify(envelope.payload),
      cache: "no-store",
    }, true);
  } catch {
    throw new CmvGuideDispatchError("provider_transient");
  }
  const { response, body } = result;
  if (!response.ok) {
    if (response.status === 409) throw new CmvGuideDispatchError("provider_payload_conflict");
    if (response.status === 408 || response.status === 429 || response.status >= 500) {
      throw new CmvGuideDispatchError("provider_transient");
    }
    throw new CmvGuideDispatchError("provider_permanent");
  }
  const id = body?.id || body?.data?.id;
  if (typeof id !== "string" || !/^[A-Za-z0-9._:-]{1,256}$/.test(id)) {
    throw new CmvGuideDispatchError("provider_ambiguous");
  }
  return { id };
}

async function readResendLastEvent(config: NonNullable<ReturnType<typeof requireDeliveryConfig>>, providerId: string) {
  let result: { response: Response; body: any };
  try {
    result = await requestResend(config, `/emails/${encodeURIComponent(providerId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      cache: "no-store",
    }, true);
  } catch {
    return null;
  }
  if (!result.response.ok) return null;
  const event = typeof result.body?.last_event === "string" ? result.body.last_event.toLowerCase() : "";
  return ["delivered", "bounced", "failed"].includes(event) ? event : null;
}

function requestFromClaim(claim: any) {
  const request = claim?.request || {};
  return {
    submissionId: claim?.id,
    name: request.name,
    email: request.email,
    phone: request.phone,
    restaurant: request.restaurant,
    commercialContactRequested: request.commercialContactRequested === true
      || request.commercial_contact_requested === true,
  };
}

export async function dispatchCmvGuide() {
  const config = requireDeliveryConfig();
  const persistence = createCmvGuidePersistence({ adminRequest: cmvGuideAdminRequest });
  const recordKind = config.environment === "homolog" ? "test" : "live";
  // Dois pedidos em paralelo e os mesmos anexos uma vez por invocação.
  // DB 4s, storage 2×4s, provedor 6s: cabe em 55s e no lease de 120s.
  let materials: Promise<Array<{ filename: string; content: string }>> | undefined;
  return runCmvGuideDispatch({
    recordKind,
    testEmail: config.testEmail,
    claim: persistence.claim,
    prepare: persistence.prepare,
    finish: persistence.finish,
    loadMaterials: () => materials ??= readCmvGuideMaterials({
      supabaseUrl: config.databaseUrl!,
      serviceRoleKey: config.serviceRoleKey!,
      timeoutMs: 4_000,
    }),
    buildEnvelope: (claim, attachments) => buildCmvGuideEmail({
      request: requestFromClaim(claim),
      recordKind,
      requestId: claim.id,
      from: config.from!,
      replyTo: config.replyTo,
      attachments,
    }),
    sendEmail: (envelope) => sendResendEmail(config, envelope),
    listReceipts: persistence.listReceipts,
    readReceipt: (providerId) => readResendLastEvent(config, providerId),
    recordReceipt: persistence.recordReceipt,
    limit: 2,
  });
}

export { CmvGuideDispatchError };
