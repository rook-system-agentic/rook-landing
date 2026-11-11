import { NextRequest, NextResponse } from "next/server";
import { SITE_ORIGIN } from "@/lib/site-origin";
import {
  Bf1AccessBackendError,
  Bf1AccessPersistenceError,
  bf1AccessEnvironment,
  consumeBf1AccessAbuseGate,
  isBf1AccessConfigured,
  issueBf1AccessChallenge,
  registerBf1Access,
} from "@/lib/bf1-access";
import { cmvGuideCorsPolicy, cmvGuidePreflightPolicy } from "@/lib/cmv-guide-origin.mjs";
import { isBf1AccessChallenge, validateBf1AccessInput } from "@/lib/bf1-access-validation.mjs";

/*
 * Cadastro da /bl1 antes do grupo Black Rook 2026 (ROO-1848).
 * GET emite o desafio antiabuso; POST valida, consome o limite e grava.
 * A resposta nunca devolve dados da pessoa. O convite do grupo fica no
 * cliente (bf1-community.mjs): o cadastro é etapa de captação, não controle
 * de acesso — o grupo é fechado (só administradores publicam).
 * Logs: só o código do erro, nunca nome, e-mail, telefone ou restaurante.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const baseHeaders = { "Cache-Control": "no-store" };
const UNAVAILABLE = "O cadastro está temporariamente indisponível.";

function failure(message: string, status = 503, extra: Record<string, string> = {}) {
  return NextResponse.json({ error: message }, { status, headers: { ...baseHeaders, ...extra } });
}

function logCode(code: string) {
  console.error(`bf1_access_${code}`);
}

function environment() {
  return bf1AccessEnvironment() ?? undefined;
}

function originPolicy(request: NextRequest) {
  return cmvGuideCorsPolicy(request.headers.get("origin"), new URL(request.url).origin, SITE_ORIGIN, environment());
}

export async function OPTIONS(request: NextRequest) {
  const policy = cmvGuidePreflightPolicy(
    request.headers.get("origin"),
    new URL(request.url).origin,
    SITE_ORIGIN,
    environment(),
    request.headers.get("access-control-request-method"),
    request.headers.get("access-control-request-headers"),
  );
  return policy.allowed
    ? new NextResponse(null, { status: 204, headers: policy.headers })
    : failure("Origem ou pré-verificação não permitida.", 403, policy.headers);
}

export async function GET(request: NextRequest) {
  if (!isBf1AccessConfigured()) {
    logCode("not_configured");
    return failure(UNAVAILABLE, 503);
  }
  const policy = originPolicy(request);
  if (!policy.allowed) return failure("Origem ou pré-verificação não permitida.", 403, policy.headers);
  try {
    return NextResponse.json(issueBf1AccessChallenge(request.headers), { headers: policy.headers });
  } catch {
    logCode("challenge_unavailable");
    return failure(UNAVAILABLE, 503, policy.headers);
  }
}

export async function POST(request: NextRequest) {
  if (!isBf1AccessConfigured()) {
    logCode("not_configured");
    return failure(UNAVAILABLE, 503);
  }
  const policy = originPolicy(request);
  if (!policy.allowed) return failure("Origem ou pré-verificação não permitida.", 403, policy.headers);

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return failure("Dados excedem o limite.", 413, policy.headers);
  }
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return failure("Dados inválidos.", 400, policy.headers);
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return failure("Dados excedem o limite.", 413, policy.headers);

  let candidate: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
    candidate = parsed as Record<string, unknown>;
  } catch {
    return failure("Dados inválidos.", 400, policy.headers);
  }

  const parsed = validateBf1AccessInput(candidate);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Revise os campos.", fieldErrors: parsed.errors },
      { status: 422, headers: { ...baseHeaders, ...policy.headers } },
    );
  }

  const challenge = isBf1AccessChallenge(candidate.antiBot) ? candidate.antiBot : null;
  try {
    const gate = await consumeBf1AccessAbuseGate(request.headers, parsed.value, challenge);
    if (gate.reason === "nonce_replayed") return failure("Esta verificação já foi utilizada. Tente enviar novamente.", 400, policy.headers);
    if (!gate.allowed) {
      return failure("Aguarde alguns minutos e tente novamente.", 429, {
        ...policy.headers,
        "Retry-After": String(Math.max(1, gate.retryAfterSeconds)),
      });
    }
    const saved = await registerBf1Access(parsed.value);
    return NextResponse.json(
      { success: true },
      { status: saved.result === "created" ? 201 : 200, headers: { ...baseHeaders, ...policy.headers } },
    );
  } catch (error) {
    const code = error && typeof error === "object" ? (error as { code?: string }).code : undefined;
    if (error instanceof Bf1AccessPersistenceError && code === "conflict") {
      return failure("Este envio já foi registrado com outros dados. Recarregue a página para enviar de novo.", 409, policy.headers);
    }
    if (code === "invalid_challenge") return failure("A verificação expirou. Tente novamente.", 400, policy.headers);
    logCode(error instanceof Bf1AccessBackendError || error instanceof Bf1AccessPersistenceError ? String(code) : "unexpected");
    return failure(UNAVAILABLE, 503, policy.headers);
  }
}
