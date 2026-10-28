import { NextRequest, NextResponse } from "next/server";
import { SITE_ORIGIN } from "@/lib/site-origin";
import {
  CmvGuideBackendError,
  CmvGuidePersistenceError,
  consumeCmvGuideAbuseGate,
  enqueueCmvGuideRequest,
  isCmvGuidePublicConfigured,
  issueCmvGuideChallenge,
  cmvGuideTestRecipient,
} from "@/lib/cmv-guide";
import { cmvGuideCorsPolicy, cmvGuidePreflightPolicy } from "@/lib/cmv-guide-origin.mjs";
import { isCmvGuideChallenge, validateCmvGuideInput } from "@/lib/cmv-guide-validation.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const baseHeaders = { "Cache-Control": "no-store" };

function failure(message: string, status = 503, extra: Record<string, string> = {}) {
  return NextResponse.json({ error: message }, { status, headers: { ...baseHeaders, ...extra } });
}

function originPolicy(request: NextRequest) {
  return cmvGuideCorsPolicy(request.headers.get("origin"), new URL(request.url).origin, SITE_ORIGIN, process.env.CMV_GUIDE_ENV);
}

function publicMessage(state: string) {
  if (state === "provider_accepted" || state === "delivered") return "Envio solicitado. Verifique sua caixa de entrada e o spam.";
  if (state === "failed" || state === "bounced" || state === "needs_reconciliation") return "Cadastro confirmado. A solicitação de envio será conferida pela equipe.";
  return "Cadastro confirmado. Estamos preparando o envio para o email informado.";
}

export async function OPTIONS(request: NextRequest) {
  const policy = cmvGuidePreflightPolicy(
    request.headers.get("origin"),
    new URL(request.url).origin,
    SITE_ORIGIN,
    process.env.CMV_GUIDE_ENV,
    request.headers.get("access-control-request-method"),
    request.headers.get("access-control-request-headers"),
  );
  return policy.allowed
    ? new NextResponse(null, { status: 204, headers: policy.headers })
    : failure("Origem ou pré-verificação não permitida.", 403, policy.headers);
}

export async function GET(request: NextRequest) {
  const policy = originPolicy(request);
  if (!policy.allowed) return failure("Origem ou pré-verificação não permitida.", 403, policy.headers);
  if (!isCmvGuidePublicConfigured()) return failure("O cadastro está temporariamente indisponível.", 503, policy.headers);
  try {
    return NextResponse.json(issueCmvGuideChallenge(request.headers), { headers: policy.headers });
  } catch {
    return failure("O cadastro está temporariamente indisponível.", 503, policy.headers);
  }
}

export async function POST(request: NextRequest) {
  const policy = originPolicy(request);
  if (!policy.allowed) return failure("Origem ou pré-verificação não permitida.", 403, policy.headers);
  if (!isCmvGuidePublicConfigured()) return failure("O cadastro está temporariamente indisponível.", 503, policy.headers);

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

  const parsed = validateCmvGuideInput(candidate);
  if (!parsed.ok) return NextResponse.json({ error: "Revise os campos.", fieldErrors: parsed.errors }, { status: 422, headers: { ...baseHeaders, ...policy.headers } });
  const testRecipient = cmvGuideTestRecipient();
  if (testRecipient && parsed.value.email !== testRecipient) {
    return NextResponse.json({ error: "Revise os campos.", fieldErrors: { email: "Use o destinatário de homologação autorizado." } }, { status: 422, headers: { ...baseHeaders, ...policy.headers } });
  }
  const challenge = isCmvGuideChallenge(candidate.antiBot) ? candidate.antiBot : null;

  try {
    const gate = await consumeCmvGuideAbuseGate(request.headers, parsed.value, challenge);
    if (gate.reason === "nonce_replayed") return failure("Esta verificação já foi utilizada. Tente enviar novamente.", 400, policy.headers);
    if (!gate.allowed) {
      return failure("Aguarde alguns minutos e tente novamente.", 429, { ...policy.headers, "Retry-After": String(Math.max(1, gate.retryAfterSeconds)) });
    }
    const saved = await enqueueCmvGuideRequest(parsed.value);
    const status = saved.result === "created" ? 201 : 200;
    return NextResponse.json({ success: true, state: saved.state, message: publicMessage(saved.state) }, { status, headers: { ...baseHeaders, ...policy.headers } });
  } catch (error) {
    if (error instanceof CmvGuidePersistenceError && error.code === "conflict") {
      return failure("Esta solicitação já foi registrada com outros dados. Retome os dados originais para tentar novamente.", 409, policy.headers);
    }
    if (error instanceof CmvGuideBackendError && error.code === "invalid_challenge") {
      return failure("A verificação expirou. Tente novamente.", 400, policy.headers);
    }
    if (error && typeof error === "object" && (error as { code?: string }).code === "invalid_challenge") {
      return failure("A verificação expirou. Tente novamente.", 400, policy.headers);
    }
    return failure("O cadastro está temporariamente indisponível.", 503, policy.headers);
  }
}
