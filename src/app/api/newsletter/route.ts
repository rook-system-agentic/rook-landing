import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import {
  isResendConfigured,
  sendTemplate,
  unsubscribeUrlFor,
  upsertLead,
} from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

/**
 * ROO-139 — Captura de inscrição na newsletter (LP).
 * Antes: só disparava um welcome inline e NÃO persistia o lead (inscrições se perdiam).
 * Agora: valida consentimento (LGPD), persiste em leads_newsletter (service_role) e
 * dispara o welcome via template React Email (fail-soft).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name =
      typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 120) : null;
    const consent = body.consent === true || body.consent === "true";

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json(
        { error: "É necessário aceitar receber comunicações para concluir a inscrição." },
        { status: 400 },
      );
    }

    if (!isSupabaseAdminConfigured()) {
      console.error("[newsletter] Supabase admin não configurado — inscrição não persistida:", email);
      return NextResponse.json(
        { error: "Inscrição temporariamente indisponível. Tente novamente em instantes." },
        { status: 503 },
      );
    }

    const lead = await upsertLead({
      email,
      name,
      source: "landing_page",
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    // Boas-vindas: fail-soft — não falha a inscrição se o envio falhar ou faltar Resend.
    if (isResendConfigured()) {
      try {
        await sendTemplate({
          to: email,
          template: "welcome",
          props: { name, unsubscribeUrl: unsubscribeUrlFor(lead.id) },
        });
      } catch (err) {
        console.error("[newsletter] welcome falhou:", err instanceof Error ? err.message : err);
      }
    } else {
      console.warn("[newsletter] RESEND_API_KEY ausente — lead salvo, welcome não enviado:", email);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
