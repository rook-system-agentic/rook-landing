import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { validarSolicitacaoIntegracao } from "@/lib/integration-request-validation.mjs";
import { createOrUpdateIntegrationRequest } from "@/lib/integration-requests";

/**
 * Solicitação de integração vinda da landing.
 *
 * O botão da seção de integrações abria um `mailto:` — que depende de o
 * visitante ter cliente de e-mail configurado, não registra nada e chega ao
 * Comercial sem dizer qual sistema foi pedido. Agora é formulário, e o pedido
 * entra no CRM com o sistema na etiqueta.
 *
 * Falha ALTO, como a rota do diagnóstico: sem env configurada devolve 503 e
 * registra; erro de gravação vira 502 com log. O silêncio de `fetch()` que
 * custou 17 dias de lead do diagnóstico não se repete aqui.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8_192;

function semCache(extra: Record<string, string> = {}) {
  return { "Cache-Control": "no-store", ...extra };
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413, headers: semCache() });
  }

  let corpo: unknown;
  try {
    corpo = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: semCache() });
  }

  const validacao = validarSolicitacaoIntegracao(corpo);

  if (!validacao.ok) {
    return NextResponse.json(
      { error: "invalid_payload", campos: validacao.errors },
      { status: 422, headers: semCache() },
    );
  }

  /*
   * Honeypot: o bot preencheu o campo-armadilha. Devolve 201 como se tivesse
   * gravado — responder 4xx ensina o bot a contornar — e não grava nada.
   */
  if (validacao.honeypot) {
    return NextResponse.json({ ok: true }, { status: 201, headers: semCache() });
  }

  if (!isSupabaseAdminConfigured()) {
    console.error("[integration-requests] SUPABASE_URL/SERVICE_ROLE ausentes — pedido não gravado");
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503, headers: semCache() });
  }

  try {
    await createOrUpdateIntegrationRequest(validacao.value);
  } catch (erro) {
    console.error("[integration-requests] falha ao gravar pedido:", erro);
    return NextResponse.json({ error: "storage_failed" }, { status: 502, headers: semCache() });
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: semCache() });
}
