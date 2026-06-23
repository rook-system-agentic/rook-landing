import { NextRequest, NextResponse } from "next/server";
import { isContentApiAuthorized } from "@/lib/content-api-auth";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import {
  isResendConfigured,
  isTemplateName,
  listRecipients,
  sendTemplate,
  unsubscribeUrlFor,
} from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ROO-139 · Bloco 5 — disparo de newsletter (broadcast protegido).
 *
 * Auth: Authorization: Bearer <CONTENT_AUTOMATION_SECRET> (trigger manual/ops) ou
 * Bearer <CRON_SECRET> (Vercel Cron, p/ digest/reengajamento futuros).
 *
 * Body JSON:
 *  - template: welcome | content_alert | weekly_digest | reengagement
 *  - audience: lead (default) | client | all
 *  - onlyConsented: bool (default true — só quem tem consent_at; LGPD)
 *  - payload: props extras do template (ex.: content_alert -> { title, url, excerpt, category })
 *  - testTo: envia só para este e-mail (teste de inbox/spam — Bloco 1)
 *  - dryRun: não envia; retorna a audiência que receberia
 */
function authorized(req: NextRequest): boolean {
  if (isContentApiAuthorized(req)) return true;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.CONTENT_AUTOMATION_SECRET && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CONTENT_AUTOMATION_SECRET ou CRON_SECRET não configurado." },
      { status: 503 },
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase admin não configurado." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));

  const template = typeof body.template === "string" ? body.template : "";
  if (!isTemplateName(template)) {
    return NextResponse.json(
      { error: "template inválido (welcome | content_alert | weekly_digest | reengagement)." },
      { status: 400 },
    );
  }

  const audience: "lead" | "client" | "all" =
    body.audience === "client" || body.audience === "all" ? body.audience : "lead";
  const onlyConsented = body.onlyConsented !== false; // default true (LGPD)
  const payload: Record<string, unknown> =
    body.payload && typeof body.payload === "object" ? body.payload : {};
  const dryRun = body.dryRun === true;
  const testTo = typeof body.testTo === "string" ? body.testTo.trim() : "";

  if (template === "content_alert" && (!payload.title || !payload.url)) {
    return NextResponse.json(
      { error: "content_alert exige payload.title e payload.url." },
      { status: 400 },
    );
  }

  if (!isResendConfigured() && !dryRun) {
    return NextResponse.json({ error: "RESEND_API_KEY não configurado." }, { status: 503 });
  }

  // Teste pontual de entregabilidade (inbox/spam) — não toca na audiência real.
  if (testTo) {
    if (dryRun) return NextResponse.json({ dryRun: true, testTo, template });
    const result = await sendTemplate({
      to: testTo,
      template,
      props: { ...payload, unsubscribeUrl: unsubscribeUrlFor("preview") },
    });
    return NextResponse.json({ success: true, testTo, id: result.id });
  }

  const recipients = await listRecipients({ audience, onlyConsented });

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      template,
      audience,
      onlyConsented,
      count: recipients.length,
      recipients: recipients.map((r) => ({
        email: r.email,
        name: r.name,
        audience_type: r.audience_type,
      })),
    });
  }

  let sent = 0;
  const failures: Array<{ email: string; error: string }> = [];

  for (const r of recipients) {
    try {
      await sendTemplate({
        to: r.email,
        template,
        props: { ...payload, name: r.name, unsubscribeUrl: unsubscribeUrlFor(r.id) },
      });
      sent += 1;
    } catch (error) {
      failures.push({ email: r.email, error: error instanceof Error ? error.message : "erro" });
    }
  }

  return NextResponse.json({
    success: true,
    template,
    audience,
    onlyConsented,
    total: recipients.length,
    sent,
    failed: failures.length,
    failures,
  });
}
