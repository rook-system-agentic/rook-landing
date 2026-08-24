import { NextRequest, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdminRequest } from "@/lib/supabase-admin";
import { validarDiagnostico } from "@/lib/diagnostic-validation.mjs";

/**
 * Gravação do lead do diagnóstico.
 *
 * POR QUE ESTA ROTA EXISTE (24/08/2026 — incidente)
 *
 * O `DiagnosticoFlow` gravava DIRETO do navegador na REST do Supabase, com URL
 * e chave anônima embutidas no componente. Duas consequências, as duas ruins:
 *
 *   1. A chave embutida era de OUTRO projeto. A URL apontava para
 *      `...knuspwchwflqq` e o JWT tinha sido emitido para `...knespwchwflqq` —
 *      uma letra de diferença. O Supabase respondia 401 Invalid API key.
 *   2. `fetch()` não rejeita em 401, e o código não checava `response.ok`. O
 *      erro caía num `catch` que nunca era acionado: o visitante preenchia o
 *      formulário, via o resultado, e o lead sumia sem nenhum sinal.
 *
 * Resultado medido: ZERO linhas com `source = 'lp_diagnostico'` em
 * `onboarding_diagnostics` entre 07/08 (quando o fluxo foi ao ar) e 24/08.
 * Dezessete dias de lead perdido, em silêncio.
 *
 * A correção não é trocar a chave: é parar de gravar do navegador. Esta rota
 * segue o caminho que o formulário de planos já usava — `supabase-admin` com
 * service role, que nunca é servido ao cliente — e falha ALTO: erro de gravação
 * vira 502 com corpo, e o componente avisa o visitante em vez de fingir sucesso.
 *
 * A validação vive em `.mjs` puro para o `node --test` cobrir sem build.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** O corpo cabe folgado; o limite existe para não aceitar upload disfarçado. */
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

  const validacao = validarDiagnostico(corpo);
  if (!validacao.ok) {
    return NextResponse.json(
      { error: "invalid_payload", campos: validacao.erros },
      { status: 422, headers: semCache() },
    );
  }

  /*
   * A checagem de configuração vem DEPOIS da validação, de propósito: um corpo
   * malformado é malformado independentemente de o banco estar de pé, e
   * responder 422 nesse caso é mais preciso que esconder tudo atrás de 503.
   * Também é o que torna os modos de falha testáveis sem credencial.
   */
  if (!isSupabaseAdminConfigured()) {
    console.error("[diagnostics] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes — lead não gravado");
    return NextResponse.json(
      { error: "storage_unavailable" },
      { status: 503, headers: semCache() },
    );
  }

  try {
    await supabaseAdminRequest("onboarding_diagnostics", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(validacao.registro),
      allowEmpty: true,
    });
  } catch (erro) {
    /*
     * O `supabaseAdminRequest` já lança com status e corpo da resposta. Aqui o
     * papel é garantir que isso VIRE LOG e vire 502 — foi exatamente este ponto
     * que faltou no fluxo antigo e custou dezessete dias de lead.
     */
    console.error("[diagnostics] falha ao gravar lead:", erro);
    return NextResponse.json({ error: "storage_failed" }, { status: 502, headers: semCache() });
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: semCache() });
}
