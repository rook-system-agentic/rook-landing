import { NextResponse, type NextRequest } from "next/server";
import {
  LP_EXPERIMENT_COOKIE,
  LP_EXPERIMENT_COOKIE_MAX_AGE,
  LP_EXPERIMENT_FORCE_PARAM,
  allocateVariant,
  parseAssistedPercent,
  serializeExperimentCookie,
} from "@/lib/lp-experiment.mjs";

/**
 * Sorteia a variante do experimento da LP e grava o cookie ANTES da página
 * chegar ao navegador (ROO-1207). A regra mora em `lp-experiment.mjs`; aqui só
 * se liga a requisição à regra.
 *
 * Roda na home e em /planos — as duas páginas por onde o visitante chega ao
 * CTA testado. Nenhuma outra rota paga o custo do middleware.
 *
 * O cookie é gravado na resposta da página estática (ISR): o middleware corre
 * antes do cache, então a página continua servida do cache e cada visitante
 * recebe o próprio cookie. `/planos` NÃO lê o cookie no servidor de
 * propósito — ler `cookies()` ali tornaria a rota dinâmica e jogaria fora o
 * cache do catálogo. Quem lê é o script inline do layout, antes da pintura.
 *
 * A porcentagem vem de `LP_ASAFLOW_ASSISTED_PCT` (sem `NEXT_PUBLIC_`: é lida
 * no servidor a cada requisição, e não fica gravada no bundle). Mudar exige
 * redeploy na Vercel — decisão registrada na issue em 04/09/2026, em vez de
 * adicionar Edge Config por um número.
 *
 * A Variante B só existe se o widget e o formulário do AsaFlow estiverem
 * configurados: sem eles a porcentagem vale 0, e ninguém cai numa variante
 * que não tem para onde levar.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const configurada =
    Boolean(process.env.NEXT_PUBLIC_ASAFLOW_WIDGET_SRC) &&
    Boolean(process.env.NEXT_PUBLIC_ASAFLOW_FORM_URL);
  const assistedPercent = configurada
    ? parseAssistedPercent(process.env.LP_ASAFLOW_ASSISTED_PCT)
    : 0;

  const existing = request.cookies.get(LP_EXPERIMENT_COOKIE)?.value ?? null;
  const { variant, source } = allocateVariant({
    existing,
    assistedPercent,
    forced: request.nextUrl.searchParams.get(LP_EXPERIMENT_FORCE_PARAM),
  });

  if (source === "desligado") {
    // Kill switch: apaga o cookie de quem já tinha caído na B.
    if (existing) response.cookies.delete(LP_EXPERIMENT_COOKIE);
    return response;
  }

  const valor = serializeExperimentCookie(variant);
  if (existing !== valor) {
    response.cookies.set(LP_EXPERIMENT_COOKIE, valor, {
      maxAge: LP_EXPERIMENT_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }

  return response;
}

export const config = {
  matcher: ["/", "/planos", "/planos/"],
};
