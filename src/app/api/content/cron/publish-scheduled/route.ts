import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isContentApiAuthorized } from "@/lib/content-api-auth";
import { publishApprovedContentPack } from "@/lib/content-automation";
import { isSupabaseAdminConfigured, supabaseAdminRequest } from "@/lib/supabase-admin";
import type { ContentPack, PublicationResult } from "@/lib/content-types";

export const dynamic = "force-dynamic";

/**
 * ROO-145 — fecha o loop de publicação do blog.
 *
 * O cockpit (apps/marketing) aprova e AGENDA o pacote (status='scheduled' + scheduled_at).
 * O publishApprovedContentPack já sabe publicar; só faltava QUEM o aciona no horário.
 * Este cron (Vercel) varre os pacotes agendados e devidos e publica — blog automático,
 * canais sociais continuam virando publication_jobs 'manual_required' (publicação assistida).
 */

function cronAuthorized(req: NextRequest) {
  // Trigger manual (cockpit/ops) com o segredo de automação.
  if (isContentApiAuthorized(req)) return true;
  // Vercel Cron envia Authorization: Bearer ${CRON_SECRET} quando CRON_SECRET está setado.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

function revalidatePublishedPaths(results: PublicationResult[]) {
  revalidatePath("/blog");
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");

  for (const result of results) {
    if (result.channel !== "blog" || result.status !== "published" || !result.externalUrl) continue;
    revalidatePath(new URL(result.externalUrl).pathname);
  }
}

async function handle(req: NextRequest) {
  if (!process.env.CONTENT_AUTOMATION_SECRET && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET ou CONTENT_AUTOMATION_SECRET não configurado" },
      { status: 503 },
    );
  }

  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase admin não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  try {
    const now = new Date().toISOString();

    // Pacotes agendados; due = sem horário (publica já) ou com horário já vencido.
    const scheduled = await supabaseAdminRequest<ContentPack[]>(
      "content_packs?status=eq.scheduled&select=id,scheduled_at&order=scheduled_at.asc.nullsfirst",
    );
    const due = (scheduled || []).filter((pack) => !pack.scheduled_at || pack.scheduled_at <= now);

    const publications: Array<{ contentPackId: string; results?: PublicationResult[]; error?: string }> = [];
    const allResults: PublicationResult[] = [];

    for (const pack of due) {
      try {
        const publication = await publishApprovedContentPack({ contentPackId: pack.id, actor: "roo-145-cron" });
        publications.push({ contentPackId: pack.id, results: publication.results });
        allResults.push(...publication.results);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao publicar pacote agendado.";
        console.error("[content-cron] pack", pack.id, message);
        publications.push({ contentPackId: pack.id, error: message });
      }
    }

    if (allResults.length > 0) revalidatePublishedPaths(allResults);

    return NextResponse.json({ success: true, scheduled: scheduled?.length || 0, due: due.length, publications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[content-cron]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Vercel Cron chama via GET; POST liberado p/ trigger manual/ops.
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
