import { NextRequest, NextResponse } from "next/server";
import { isContentApiAuthorized } from "@/lib/content-api-auth";
import {
  createContentStudioPack,
  createContentStudioVariation,
  getContentStudioPack,
  listContentStudioPacks,
  updateContentStudioPack,
  updateContentStudioVariation,
} from "@/lib/content-studio";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function assertConfigured(req: NextRequest) {
  if (!process.env.CONTENT_AUTOMATION_SECRET) {
    return NextResponse.json({ error: "CONTENT_AUTOMATION_SECRET não configurado" }, { status: 503 });
  }

  if (!isContentApiAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase admin não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  return null;
}

export async function GET(req: NextRequest) {
  const configError = assertConfigured(req);
  if (configError) return configError;

  try {
    const contentPackId = req.nextUrl.searchParams.get("contentPackId");
    if (contentPackId) {
      const pack = await getContentStudioPack(contentPackId);
      return NextResponse.json({ success: true, pack });
    }

    const limit = Number(req.nextUrl.searchParams.get("limit") || 30);
    const packs = await listContentStudioPacks(limit);
    return NextResponse.json({ success: true, packs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[content-studio:get]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const configError = assertConfigured(req);
  if (configError) return configError;

  try {
    const body = (await req.json()) as {
      action?: string;
      contentPackId?: string;
      variationId?: string;
      pack?: Parameters<typeof createContentStudioPack>[0];
      packPatch?: Parameters<typeof updateContentStudioPack>[1];
      variation?: Parameters<typeof createContentStudioVariation>[0];
      variationPatch?: Parameters<typeof updateContentStudioVariation>[1];
    };

    if (body.action === "createPack" && body.pack) {
      const pack = await createContentStudioPack(body.pack);
      return NextResponse.json({ success: true, pack });
    }

    if (body.action === "updatePack" && body.contentPackId && body.packPatch) {
      const pack = await updateContentStudioPack(body.contentPackId, body.packPatch);
      return NextResponse.json({ success: true, pack });
    }

    if (body.action === "createVariation" && body.variation) {
      const variation = await createContentStudioVariation(body.variation);
      return NextResponse.json({ success: true, variation });
    }

    if (body.action === "updateVariation" && body.variationId && body.variationPatch) {
      const variation = await updateContentStudioVariation(body.variationId, body.variationPatch);
      return NextResponse.json({ success: true, variation });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[content-studio:post]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
