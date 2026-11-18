/*
 * API de Conversões da Meta (CAPI) — Lead do cadastro da /bl1 (ROO-1939).
 *
 * POR QUE EXISTE
 * O Lead do navegador só sai depois da resposta do POST e a página redireciona
 * para o grupo 1,5 s depois. Bloqueador, ITP ou o redirecionamento podem
 * engolir esse Lead, e a campanha fica sem o sinal de cadastro. O servidor
 * sabe, com certeza, que o cadastro foi gravado: ele manda o mesmo Lead.
 *
 * REGRAS (fonte da verdade: este arquivo)
 * 1. Só com consentimento de anúncios (ad_storage) dado no aviso de cookies,
 *    igual ao pixel do navegador (GTM v11). Sem consentimento, nada sai.
 * 2. Só para cadastro novo (result "created"). Reenvio ou cadastro repetido
 *    não gera um segundo Lead no servidor.
 * 3. Sem contar em dobro: event_id = eventID do Lead do navegador (mesmo UUID,
 *    gerado no formulário). A Meta descarta o segundo evento com o mesmo par
 *    nome + ID no mesmo pixel em até 48 h. A deduplicação por fbp/external_id
 *    não serve aqui, porque o servidor envia ANTES do navegador.
 * 4. Sem dado do formulário: nada de nome, e-mail, telefone ou restaurante,
 *    nem em hash. Vão só os sinais que o próprio pixel já manda (IP, navegador,
 *    cookies _fbp/_fbc). O IP vem da mesma função do antiabuso
 *    (resolveCommercialLeadClientIp), para não haver duas regras de IP. Correspondência avançada com e-mail/telefone em hash
 *    é decisão à parte (política de privacidade), fora deste módulo.
 * 5. Desligado por padrão: sem META_CAPI_ACCESS_TOKEN, nada é enviado. Fora de
 *    produção, só envia com META_CAPI_TEST_EVENT_CODE (vai para "Eventos de
 *    teste" e não entra nas métricas da campanha).
 * 6. Nunca derruba o cadastro: timeout curto e nenhuma exceção sai daqui.
 *
 * Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api/
 * Deduplicação: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/
 */

// Pixel dos anúncios da campanha BF26 (o mesmo das tags "FB Pixel" do GTM).
export const META_ADS_PIXEL_ID = "1060053930335437";
// v26.0: lançada em 29/07/2026, sem data de expiração anunciada.
export const META_GRAPH_API_VERSION = "v26.0";
export const META_CAPI_TIMEOUT_MS = 1_500;
export const META_LEAD_EVENT_NAME = "Lead";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Formato dos cookies do pixel: fb.<subdomínio>.<timestamp>.<valor>.
const FB_COOKIE = /^fb\.[0-2]\.\d{10,16}\.[A-Za-z0-9_.-]{1,500}$/;
const TEST_EVENT_CODE = /^[A-Za-z0-9]{3,40}$/;
const MAX_USER_AGENT = 512;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isLeadEventId(value) {
  return typeof value === "string" && UUID.test(value);
}

/**
 * Lê a configuração das variáveis de ambiente. Nunca devolve o token em log:
 * quem chama só olha `enabled` e `reason`.
 */
export function readMetaCapiConfig(env, environment) {
  const token = text(env?.META_CAPI_ACCESS_TOKEN);
  const testEventCode = text(env?.META_CAPI_TEST_EVENT_CODE);
  if (!token) return { enabled: false, reason: "no_token" };
  if (token.length < 20 || /\s/.test(token)) return { enabled: false, reason: "invalid_token" };
  if (testEventCode && !TEST_EVENT_CODE.test(testEventCode)) return { enabled: false, reason: "invalid_test_code" };
  if (environment !== "production" && !testEventCode) return { enabled: false, reason: "test_code_required" };
  return {
    enabled: true,
    reason: testEventCode ? "test_events" : "live",
    pixelId: META_ADS_PIXEL_ID,
    token,
    testEventCode: testEventCode || null,
  };
}

/** Decide se o Lead do servidor sai. Todas as condições precisam ser verdadeiras. */
export function shouldSendMetaLead({ config, adsConsent, result, eventId }) {
  return Boolean(config?.enabled) && adsConsent === true && result === "created" && isLeadEventId(eventId);
}

/** URL da página sem query nem fragmento: as UTMs e o fbclid já vão no _fbc. */
export function sanitizeEventSourceUrl(referer, allowedOrigins) {
  try {
    const url = new URL(text(referer));
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
    if (!allowedOrigins.includes(url.origin)) return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

/**
 * A rota de cadastro só é chamada pela /bl1. Se o navegador não mandar o
 * Referer (política do navegador, app do Instagram), vale a URL canônica da
 * página: a Meta exige event_source_url e o Lead não se perde por isso.
 */
export function resolveEventSourceUrl({ referer, allowedOrigins, fallbackUrl }) {
  return sanitizeEventSourceUrl(referer, allowedOrigins) ?? sanitizeEventSourceUrl(fallbackUrl, allowedOrigins);
}

export function sanitizeFbCookie(value) {
  const candidate = text(value);
  return FB_COOKIE.test(candidate) ? candidate : null;
}

/**
 * Monta o evento Lead. Retorna null se faltar algo que a Meta exige para
 * eventos de site (event_source_url e client_user_agent).
 */
export function buildMetaLeadEvent({ eventId, eventTimeSeconds, sourceUrl, clientIp, userAgent, fbp, fbc }) {
  const agent = text(userAgent).slice(0, MAX_USER_AGENT);
  if (!isLeadEventId(eventId) || !sourceUrl || !agent || !Number.isInteger(eventTimeSeconds)) return null;
  const userData = { client_user_agent: agent };
  if (clientIp) userData.client_ip_address = clientIp;
  const cleanFbp = sanitizeFbCookie(fbp);
  const cleanFbc = sanitizeFbCookie(fbc);
  if (cleanFbp) userData.fbp = cleanFbp;
  if (cleanFbc) userData.fbc = cleanFbc;
  return {
    event_name: META_LEAD_EVENT_NAME,
    event_time: eventTimeSeconds,
    event_id: eventId,
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
  };
}

/**
 * Envia um evento. Nunca lança: devolve só um código curto para log
 * ("sent", "http_<status>", "timeout", "network", "invalid_event").
 */
export async function sendMetaEvent({ config, event, fetchImpl = fetch, timeoutMs = META_CAPI_TIMEOUT_MS }) {
  if (!config?.enabled) return "disabled";
  if (!event) return "invalid_event";
  const body = { data: [event] };
  if (config.testEventCode) body.test_event_code = config.testEventCode;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${config.pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}` },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    if (!response.ok) return `http_${response.status}`;
    const data = await response.json().catch(() => null);
    return data && Number(data.events_received) >= 1 ? "sent" : "not_received";
  } catch (error) {
    return error && typeof error === "object" && error.name === "AbortError" ? "timeout" : "network";
  } finally {
    clearTimeout(timer);
  }
}
