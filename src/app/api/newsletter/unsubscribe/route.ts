import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { unsubscribeLead } from "@/lib/newsletter";
import { SITE_ORIGIN } from "@/lib/site-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ROO-139 — Cancelamento de inscrição (LGPD). Link presente no rodapé de todos os
 * e-mails: /api/newsletter/unsubscribe?id=<uuid do lead> (ou ?email=<email>).
 */
function page(title: string, message: string, status = 200) {
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title} · Rook System</title>
    <style>
      body { margin:0; background:#f5f4f2; color:#2b2b2b; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
      .card { max-width:520px; margin:64px auto; background:#fff; border:1px solid #e7e2dc; border-radius:12px; padding:40px 32px; text-align:center; }
      .logo { color:#5D4037; font-weight:700; font-size:20px; margin-bottom:24px; }
      h1 { color:#5D4037; font-size:22px; margin:0 0 12px; }
      p { color:#6b6b6b; font-size:15px; line-height:1.6; margin:0 0 20px; }
      a { color:#5D4037; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">♜ Rook System</div>
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="${SITE_ORIGIN}">Voltar ao site</a></p>
    </div>
  </body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || undefined;
  const email = url.searchParams.get("email") || undefined;

  if (!id && !email) {
    return page("Link inválido", "Não foi possível identificar a inscrição neste link.", 400);
  }
  if (!isSupabaseAdminConfigured()) {
    return page("Indisponível", "Serviço temporariamente indisponível. Tente novamente mais tarde.", 503);
  }

  try {
    const ok = await unsubscribeLead({ id, email });
    if (!ok) {
      return page("Inscrição não encontrada", "Não localizamos uma inscrição ativa para este link.", 404);
    }
    return page(
      "Inscrição cancelada",
      "Pronto — você não receberá mais nossos e-mails. Sentiremos sua falta. Se mudar de ideia, é só assinar de novo no site.",
    );
  } catch (error) {
    console.error("[newsletter/unsubscribe]", error);
    return page("Erro", "Algo deu errado ao cancelar sua inscrição. Tente novamente em instantes.", 500);
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
