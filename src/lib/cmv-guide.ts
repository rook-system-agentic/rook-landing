import "server-only";

import {
  createCommercialLeadAbuseProtection,
  type CommercialLeadChallengeAnswer,
  type HeaderReader,
} from "@/lib/commercial-lead-abuse-protection.mjs";
import {
  CmvGuidePersistenceError,
  createCmvGuidePersistence,
} from "@/lib/cmv-guide-persistence.mjs";
import { readCmvGuideConfig } from "@/lib/cmv-guide-config.mjs";
import type { CmvGuideRequest } from "@/lib/cmv-guide-validation.mjs";

export class CmvGuideBackendError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.name = "CmvGuideBackendError";
    this.code = code;
  }
}

function config() {
  return readCmvGuideConfig(process.env);
}

function requirePublicConfig() {
  const current = config();
  if (!current.publicReady || !current.databaseUrl || !current.serviceRoleKey || !current.abuseSecret) {
    throw new CmvGuideBackendError("not_configured");
  }
  return current;
}

export async function cmvGuideAdminRequest(path: string, options: RequestInit = {}) {
  const current = requirePublicConfig();
  const endpoint = `${current.databaseUrl!.replace(/\/$/, "")}/rest/v1/${path.replace(/^\//, "")}`;
  const headers = new Headers(options.headers);
  headers.set("apikey", current.serviceRoleKey!);
  headers.set("Authorization", `Bearer ${current.serviceRoleKey}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(endpoint, { ...options, headers, cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new CmvGuideBackendError("database_unavailable");
    try {
      return await response.json();
    } catch {
      throw new CmvGuideBackendError("database_unavailable");
    }
  } catch {
    throw new CmvGuideBackendError("database_unavailable");
  } finally {
    clearTimeout(timer);
  }
}

export function isCmvGuidePublicConfigured() {
  return config().publicReady;
}

export function isCmvGuideDeliveryConfigured() {
  return config().deliveryReady;
}

export function cmvGuideRecordKind(): "test" | "live" {
  return config().environment === "homolog" ? "test" : "live";
}

export function cmvGuideTestRecipient() {
  const current = config();
  return current.environment === "homolog" ? current.testEmail : null;
}

export function issueCmvGuideChallenge(headers: HeaderReader) {
  const current = requirePublicConfig();
  return createCommercialLeadAbuseProtection({
    adminRequest: cmvGuideAdminRequest,
    secret: current.abuseSecret!,
  }).issueChallenge(headers);
}

export async function consumeCmvGuideAbuseGate(
  headers: HeaderReader,
  request: CmvGuideRequest,
  challenge: CommercialLeadChallengeAnswer | null,
) {
  const current = requirePublicConfig();
  // O adapter só satisfaz a entrada histórica da RPC distribuída; CNPJ/CRM não
  // é parte do request do Guia nem chega ao enqueue persistido.
  return createCommercialLeadAbuseProtection({
    adminRequest: cmvGuideAdminRequest,
    secret: current.abuseSecret!,
  }).consumeAbuseGate(headers, {
    name: request.name,
    company: null,
    email: request.email,
    phone: request.phone,
    cnpj: request.phone,
    interest: "general",
  }, challenge);
}

export async function enqueueCmvGuideRequest(request: CmvGuideRequest) {
  requirePublicConfig();
  return createCmvGuidePersistence({ adminRequest: cmvGuideAdminRequest })
    .enqueue(request, cmvGuideRecordKind());
}

export { CmvGuidePersistenceError };
