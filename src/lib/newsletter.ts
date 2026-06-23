import * as React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { siteUrl } from "@/lib/blog";
import { isSupabaseAdminConfigured, supabaseAdminRequest } from "@/lib/supabase-admin";
import WelcomeEmail from "@/emails/Welcome";
import ContentAlertEmail from "@/emails/ContentAlert";
import WeeklyDigestEmail from "@/emails/WeeklyDigest";
import ReengagementEmail from "@/emails/Reengagement";

/**
 * ROO-139 — Newsletter (Resend).
 * Centraliza envio (render React Email -> HTML/texto -> Resend), persistência de
 * leads (leads_newsletter via service_role) e leitura da audiência unificada
 * (view public.newsletter_recipients).
 */

const DEFAULT_SENDER = "Rook System <conteudo@rooksystem.com.br>";
const SENDER = process.env.NEWSLETTER_FROM || DEFAULT_SENDER;
const REPLY_TO = process.env.NEWSLETTER_REPLY_TO || "";

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurado.");
  return new Resend(key);
}

export function unsubscribeUrlFor(id: string) {
  return `${siteUrl}/api/newsletter/unsubscribe?id=${encodeURIComponent(id)}`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export type TemplateName = "welcome" | "content_alert" | "weekly_digest" | "reengagement";

type TemplateEntry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subject: (props: any) => string;
};

const TEMPLATES: Record<TemplateName, TemplateEntry> = {
  welcome: {
    component: WelcomeEmail,
    subject: () => "Bem-vindo à newsletter da Rook 👋",
  },
  content_alert: {
    component: ContentAlertEmail,
    subject: (props) => `Novo no blog da Rook: ${props.title}`,
  },
  weekly_digest: {
    component: WeeklyDigestEmail,
    subject: (props) =>
      props.subject || `Resumo da semana na Rook${props.periodLabel ? ` · ${props.periodLabel}` : ""} 📊`,
  },
  reengagement: {
    component: ReengagementEmail,
    subject: () => "Faz um tempo… tem novidade na Rook 📉",
  },
};

export function isTemplateName(value: string): value is TemplateName {
  return value === "welcome" || value === "content_alert" || value === "weekly_digest" || value === "reengagement";
}

export async function renderTemplate(
  template: TemplateName,
  props: Record<string, unknown>,
): Promise<{ html: string; text: string }> {
  const element = React.createElement(TEMPLATES[template].component, props);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return { html, text };
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

export type SendResult = { id: string | null };

export async function sendTemplate(opts: {
  to: string | string[];
  template: TemplateName;
  props?: Record<string, unknown>;
  subject?: string;
}): Promise<SendResult> {
  const props = opts.props ?? {};
  const subject = opts.subject ?? TEMPLATES[opts.template].subject(props);
  const { html, text } = await renderTemplate(opts.template, props);

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: SENDER,
    to: opts.to,
    subject,
    html,
    text,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
  });

  if (error) {
    throw new Error(`[resend] ${error.message || "falha ao enviar"}`);
  }
  return { id: data?.id ?? null };
}

// ---------------------------------------------------------------------------
// Leads (leads_newsletter)
// ---------------------------------------------------------------------------

export type UpsertLeadInput = {
  email: string;
  name?: string | null;
  source?: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type UpsertedLead = { id: string; created: boolean; reactivated: boolean };

export async function upsertLead(input: UpsertLeadInput): Promise<UpsertedLead> {
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const existing = await supabaseAdminRequest<Array<{ id: string; status: string }>>(
    `leads_newsletter?email=eq.${encodeURIComponent(email)}&select=id,status&limit=1`,
  );

  if (existing && existing.length > 0) {
    const lead = existing[0];
    const wasInactive = lead.status !== "active";
    const patch: Record<string, unknown> = {
      status: "active",
      consent_at: now,
      unsubscribed_at: null,
    };
    if (input.name) patch.name = input.name;
    if (wasInactive) patch.reactivated_at = now;

    const updated = await supabaseAdminRequest<Array<{ id: string }>>(
      `leads_newsletter?id=eq.${lead.id}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      },
    );
    return { id: updated?.[0]?.id ?? lead.id, created: false, reactivated: wasInactive };
  }

  const row = {
    email,
    name: input.name ?? null,
    status: "active",
    source: input.source ?? "landing_page",
    consent_at: now,
    ip_address: input.ip ?? null,
    user_agent: input.userAgent ?? null,
  };

  const inserted = await supabaseAdminRequest<Array<{ id: string }>>("leads_newsletter", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([row]),
  });
  return { id: inserted?.[0]?.id ?? "", created: true, reactivated: false };
}

export async function unsubscribeLead(opts: { id?: string; email?: string }): Promise<boolean> {
  let filter = "";
  if (opts.id) {
    filter = `id=eq.${encodeURIComponent(opts.id)}`;
  } else if (opts.email) {
    filter = `email=eq.${encodeURIComponent(opts.email.trim().toLowerCase())}`;
  } else {
    return false;
  }

  const updated = await supabaseAdminRequest<Array<{ id: string }>>(`leads_newsletter?${filter}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }),
  });
  return Boolean(updated && updated.length > 0);
}

// ---------------------------------------------------------------------------
// Audiência unificada (view newsletter_recipients)
// ---------------------------------------------------------------------------

export type NewsletterRecipient = {
  id: string;
  name: string | null;
  email: string;
  audience_type: "lead" | "client";
  status: string;
  consent_at: string | null;
  created_at: string | null;
};

export async function listRecipients(
  opts: { audience?: "lead" | "client" | "all"; onlyConsented?: boolean } = {},
): Promise<NewsletterRecipient[]> {
  const params = new URLSearchParams();
  params.set("select", "id,name,email,audience_type,status,consent_at,created_at");
  if (opts.audience && opts.audience !== "all") {
    params.set("audience_type", `eq.${opts.audience}`);
  }
  if (opts.onlyConsented) {
    params.set("consent_at", "not.is.null");
  }
  params.set("order", "created_at.asc");

  const rows = await supabaseAdminRequest<NewsletterRecipient[]>(
    `newsletter_recipients?${params.toString()}`,
  );
  return rows ?? [];
}

export function newsletterConfigStatus() {
  return { supabase: isSupabaseAdminConfigured(), resend: isResendConfigured(), sender: SENDER };
}
