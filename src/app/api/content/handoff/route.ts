import { NextRequest, NextResponse } from "next/server";
import { isContentApiAuthorized } from "@/lib/content-api-auth";
import { buildContentHandoff } from "@/lib/content-handoff";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  if (!process.env.CONTENT_AUTOMATION_SECRET) {
    return NextResponse.json({ error: "CONTENT_AUTOMATION_SECRET não configurado" }, { status: 503 });
  }

  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

function assertConfigured(req: NextRequest) {
  if (!isContentApiAuthorized(req)) return unauthorizedResponse();

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase admin não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  return null;
}

async function handoffResponse(contentPackId?: string) {
  if (!contentPackId) {
    return NextResponse.json({ error: "contentPackId é obrigatório" }, { status: 400 });
  }

  try {
    const handoff = await buildContentHandoff(contentPackId);
    return NextResponse.json({ success: true, handoff });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[content-handoff]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const configError = assertConfigured(req);
  if (configError) return configError;

  return handoffResponse(req.nextUrl.searchParams.get("contentPackId") || undefined);
}

export async function POST(req: NextRequest) {
  const configError = assertConfigured(req);
  if (configError) return configError;

  const body = (await req.json()) as { contentPackId?: string };
  return handoffResponse(body.contentPackId);
}
