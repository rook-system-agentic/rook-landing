import { NextRequest, NextResponse } from "next/server";
import {
  CommercialLeadAbuseProtectionError,
  consumeCommercialLeadAbuseGate,
  isCommercialLeadAbuseProtectionConfigured,
  issueCommercialLeadChallenge,
} from "@/lib/commercial-lead-abuse";
import { validateCommercialLeadInput } from "@/lib/commercial-lead-validation.mjs";
import { createOrUpdateCommercialLead } from "@/lib/commercial-leads";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_384;

function noStoreHeaders(extra: Record<string, string> = {}) {
  return { "Cache-Control": "no-store", ...extra };
}

function challengeFrom(candidate: unknown) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  const antiBot = (candidate as Record<string, unknown>).antiBot;
  if (!antiBot || typeof antiBot !== "object" || Array.isArray(antiBot)) return null;

  const { token, solution } = antiBot as Record<string, unknown>;
  if (typeof token !== "string" || typeof solution !== "string") return null;
  return { token, solution };
}

export async function GET(request: NextRequest) {
  if (!isCommercialLeadAbuseProtectionConfigured()) {
    return NextResponse.json(
      { error: "Verificação temporariamente indisponível." },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  try {
    return NextResponse.json(issueCommercialLeadChallenge(request.headers), {
      headers: noStoreHeaders(),
    });
  } catch {
    console.error("[commercial-leads] Falha ao emitir verificação antiabuso.");
    return NextResponse.json(
      { error: "Verificação temporariamente indisponível." },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Dados enviados excedem o limite." }, { status: 413 });
  }

  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Dados enviados excedem o limite." }, { status: 413 });
    }

    let candidate: unknown;
    try {
      candidate = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const parsed = validateCommercialLeadInput(candidate);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Revise os campos destacados.", fieldErrors: parsed.errors },
        { status: 400 },
      );
    }
    if (parsed.honeypot) return NextResponse.json({ success: true });

    if (!isSupabaseAdminConfigured() || !isCommercialLeadAbuseProtectionConfigured()) {
      return NextResponse.json(
        { error: "Contato temporariamente indisponível. Tente novamente em instantes." },
        { status: 503, headers: noStoreHeaders() },
      );
    }

    let abuseDecision;
    try {
      abuseDecision = await consumeCommercialLeadAbuseGate(
        request.headers,
        parsed.value,
        challengeFrom(candidate),
      );
    } catch (error) {
      if (
        error instanceof CommercialLeadAbuseProtectionError
        && error.code === "invalid_challenge"
      ) {
        return NextResponse.json(
          { error: "A verificação expirou. Tente enviar novamente." },
          { status: 400, headers: noStoreHeaders() },
        );
      }

      // Sem contador persistente não existe proteção correta em serverless.
      // A rota falha fechada em vez de cair para um contador em memória.
      console.error("[commercial-leads] Proteção distribuída indisponível.");
      return NextResponse.json(
        { error: "Contato temporariamente indisponível. Tente novamente em instantes." },
        { status: 503, headers: noStoreHeaders() },
      );
    }

    if (abuseDecision.reason === "nonce_replayed") {
      return NextResponse.json(
        { error: "Esta verificação já foi utilizada. Tente enviar novamente." },
        { status: 400, headers: noStoreHeaders() },
      );
    }

    if (!abuseDecision.allowed) {
      const retryAfter = Math.max(abuseDecision.retryAfterSeconds, 1);
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        {
          status: 429,
          headers: noStoreHeaders({ "Retry-After": String(retryAfter) }),
        },
      );
    }

    const result = await createOrUpdateCommercialLead(parsed.value);
    return NextResponse.json(
      { success: true },
      { status: result.created ? 201 : 200, headers: noStoreHeaders() },
    );
  } catch {
    console.error("[commercial-leads] Falha ao salvar contato no CRM.");
    return NextResponse.json(
      { error: "Não foi possível enviar agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
