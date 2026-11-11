import "server-only";

import {
  createCommercialLeadAbuseProtection,
  type CommercialLeadChallengeAnswer,
  type HeaderReader,
} from "@/lib/commercial-lead-abuse-protection.mjs";
import { readBf1AccessConfig } from "@/lib/bf1-access-config.mjs";
import { Bf1AccessPersistenceError, createBf1AccessPersistence } from "@/lib/bf1-access-persistence.mjs";
import type { Bf1AccessRequest } from "@/lib/bf1-access-validation.mjs";

/*
 * Cadastro da /bl1 antes do grupo Black Rook 2026 (ROO-1848). Mesmo desenho
 * do Guia CMV (cmv-guide.ts): chave service_role só no servidor, timeout curto,
 * desafio de prova de trabalho e limite distribuído antes de gravar. Nada aqui
 * envia e-mail, mensagem ou integra com CRM.
 */

export class Bf1AccessBackendError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.name = "Bf1AccessBackendError";
    this.code = code;
  }
}

function config() {
  return readBf1AccessConfig(process.env);
}

function requireConfig() {
  const current = config();
  if (!current.ready || !current.databaseUrl || !current.serviceRoleKey || !current.abuseSecret) {
    throw new Bf1AccessBackendError("not_configured");
  }
  return current;
}

async function bf1AccessAdminRequest(path: string, options: RequestInit = {}) {
  const current = requireConfig();
  const endpoint = `${current.databaseUrl!.replace(/\/$/, "")}/rest/v1/${path.replace(/^\//, "")}`;
  const headers = new Headers(options.headers);
  headers.set("apikey", current.serviceRoleKey!);
  headers.set("Authorization", `Bearer ${current.serviceRoleKey}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(endpoint, { ...options, headers, cache: "no-store", signal: controller.signal });
    // 404 = RPC ainda não existe no ambiente (migration não aplicada).
    if (!response.ok) throw new Bf1AccessBackendError(response.status === 404 ? "rpc_not_found" : "database_unavailable");
    try {
      return await response.json();
    } catch {
      throw new Bf1AccessBackendError("database_unavailable");
    }
  } catch (error) {
    if (error instanceof Bf1AccessBackendError) throw error;
    throw new Bf1AccessBackendError("database_unavailable");
  } finally {
    clearTimeout(timer);
  }
}

export function isBf1AccessConfigured() {
  return config().ready;
}

export function bf1AccessEnvironment() {
  return config().environment;
}

export function issueBf1AccessChallenge(headers: HeaderReader) {
  const current = requireConfig();
  return createCommercialLeadAbuseProtection({
    adminRequest: bf1AccessAdminRequest,
    secret: current.abuseSecret!,
  }).issueChallenge(headers);
}

export async function consumeBf1AccessAbuseGate(
  headers: HeaderReader,
  request: Bf1AccessRequest,
  challenge: CommercialLeadChallengeAnswer | null,
) {
  const current = requireConfig();
  // Mesmo adapter do Guia CMV: a RPC distribuída tem entrada histórica de
  // lead comercial; CNPJ/CRM não fazem parte deste cadastro nem são gravados.
  return createCommercialLeadAbuseProtection({
    adminRequest: bf1AccessAdminRequest,
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

export async function registerBf1Access(request: Bf1AccessRequest) {
  const current = requireConfig();
  return createBf1AccessPersistence({ adminRequest: bf1AccessAdminRequest }).register(request, current.recordKind);
}

export { Bf1AccessPersistenceError };
