import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { publishApprovedContentPack } from "@/lib/content-automation";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function getProvidedSecret(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return req.headers.get("x-content-automation-secret") || "";
}

function isAuthorized(req: NextRequest) {
  const expected = process.env.CONTENT_AUTOMATION_SECRET;
  if (!expected) return false;
  return safeEqual(getProvidedSecret(req), expected);
}

function revalidatePublishedPaths(results: Awaited<ReturnType<typeof publishApprovedContentPack>>["results"]) {
  revalidatePath("/blog");
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");

  for (const result of results) {
    if (result.channel !== "blog" || result.status !== "published" || !result.externalUrl) continue;
    const path = new URL(result.externalUrl).pathname;
    revalidatePath(path);
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.CONTENT_AUTOMATION_SECRET) {
    return NextResponse.json({ error: "CONTENT_AUTOMATION_SECRET não configurado" }, { status: 503 });
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase admin não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as { contentPackId?: string; force?: boolean; actor?: string };
    if (!body.contentPackId) {
      return NextResponse.json({ error: "contentPackId é obrigatório" }, { status: 400 });
    }

    const publication = await publishApprovedContentPack({
      contentPackId: body.contentPackId,
      force: body.force,
      actor: body.actor,
    });

    revalidatePublishedPaths(publication.results);

    return NextResponse.json({ success: true, publication });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[content-publish]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
