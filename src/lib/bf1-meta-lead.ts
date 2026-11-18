import "server-only";
import type { NextRequest } from "next/server";
import { SITE_ORIGIN, siteUrl } from "@/lib/site-origin";
import { bf1AccessEnvironment } from "@/lib/bf1-access";
import { resolveCommercialLeadClientIp } from "@/lib/commercial-lead-abuse-protection.mjs";
import {
  buildMetaLeadEvent,
  readMetaCapiConfig,
  resolveEventSourceUrl,
  sendMetaEvent,
  shouldSendMetaLead,
} from "@/lib/meta-capi.mjs";

/*
 * Lead da /bl1 pela API de Conversões da Meta (ROO-1939). As regras vivem em
 * meta-capi.mjs; aqui só se lê a requisição. Chamado depois do cadastro
 * gravado: nunca lança e nunca muda a resposta do cadastro.
 * Log: só um código curto (ex.: bf1_meta_capi_sent), nunca dado da pessoa.
 */
export async function sendBf1MetaLead(
  request: NextRequest,
  input: { adsConsent: unknown; eventId: unknown; result: string },
) {
  try {
    const config = readMetaCapiConfig(process.env, bf1AccessEnvironment());
    if (!config.enabled) return;
    if (!shouldSendMetaLead({ config, adsConsent: input.adsConsent, result: input.result, eventId: input.eventId })) {
      console.info(input.adsConsent === true ? "bf1_meta_capi_skip_invalid" : "bf1_meta_capi_skip_no_consent");
      return;
    }
    const event = buildMetaLeadEvent({
      eventId: input.eventId,
      eventTimeSeconds: Math.floor(Date.now() / 1000),
      sourceUrl: resolveEventSourceUrl({
        referer: request.headers.get("referer"),
        allowedOrigins: [SITE_ORIGIN, new URL(request.url).origin],
        fallbackUrl: siteUrl("/bl1/"),
      }),
      clientIp: resolveCommercialLeadClientIp(request.headers),
      userAgent: request.headers.get("user-agent"),
      fbp: request.cookies.get("_fbp")?.value,
      fbc: request.cookies.get("_fbc")?.value,
    });
    const code = await sendMetaEvent({ config, event });
    console.info(`bf1_meta_capi_${code}${config.testEventCode ? "_test" : ""}`);
  } catch {
    console.error("bf1_meta_capi_unexpected");
  }
}
