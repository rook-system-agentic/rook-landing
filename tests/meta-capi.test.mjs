/**
 * API de Conversões da Meta — Lead da /bl1 (ROO-1939, 18/11/2026).
 *
 * O que se protege:
 * - só sai Lead com consentimento de anúncios, cadastro novo e ID válido;
 * - nenhum dado do formulário vai para a Meta (nem em hash);
 * - o mesmo ID vai no servidor e no pixel (deduplicação);
 * - desligado sem token; fora de produção, só com código de teste;
 * - falha da Meta nunca derruba o cadastro.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  META_ADS_PIXEL_ID,
  META_GRAPH_API_VERSION,
  buildMetaLeadEvent,
  readMetaCapiConfig,
  resolveEventSourceUrl,
  sanitizeEventSourceUrl,
  sanitizeFbCookie,
  sendMetaEvent,
  shouldSendMetaLead,
} from "../src/lib/meta-capi.mjs";
import { buildTrackingEvent, TRACKING_EVENTS } from "../src/lib/tracking-events.mjs";
import { ACCESS, accessRequest, loadBf1AccessRoute } from "./helpers/bf1-access-route.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const TOKEN = "EAAB".padEnd(40, "x");
const EVENT_ID = "7d3c1a2b-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X)";
const FBP = "fb.1.1763460000000.1234567890";
const FBC = "fb.1.1763460000000.IwAR0abcDEF_123";

test("sem token não envia nada; fora de produção exige código de teste", () => {
  assert.deepEqual(readMetaCapiConfig({}, "production"), { enabled: false, reason: "no_token" });
  assert.equal(readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: "curto" }, "production").reason, "invalid_token");
  assert.equal(readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN }, "homolog").reason, "test_code_required");
  assert.equal(readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN }, null).reason, "test_code_required");
  assert.equal(readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN, META_CAPI_TEST_EVENT_CODE: "x y" }, "homolog").reason, "invalid_test_code");
  const hml = readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN, META_CAPI_TEST_EVENT_CODE: "TEST12345" }, "homolog");
  assert.equal(hml.enabled, true);
  assert.equal(hml.reason, "test_events");
  const prod = readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN }, "production");
  assert.deepEqual({ ...prod, token: "***" }, { enabled: true, reason: "live", pixelId: "1060053930335437", token: "***", testEventCode: null });
  assert.equal(META_ADS_PIXEL_ID, "1060053930335437", "mesmo pixel das tags FB Pixel do GTM");
});

test("só envia com consentimento de anúncios, cadastro novo e ID válido", () => {
  const config = readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN }, "production");
  const ok = { config, adsConsent: true, result: "created", eventId: EVENT_ID };
  assert.equal(shouldSendMetaLead(ok), true);
  assert.equal(shouldSendMetaLead({ ...ok, adsConsent: false }), false);
  assert.equal(shouldSendMetaLead({ ...ok, adsConsent: "true" }), false, "só o booleano true vale");
  assert.equal(shouldSendMetaLead({ ...ok, adsConsent: undefined }), false);
  assert.equal(shouldSendMetaLead({ ...ok, result: "duplicate" }), false);
  assert.equal(shouldSendMetaLead({ ...ok, result: "updated" }), false);
  assert.equal(shouldSendMetaLead({ ...ok, eventId: "abc" }), false);
  assert.equal(shouldSendMetaLead({ ...ok, eventId: undefined }), false);
  assert.equal(shouldSendMetaLead({ ...ok, config: { enabled: false, reason: "no_token" } }), false);
});

test("o evento leva só sinais técnicos do pixel, nunca dado do formulário", () => {
  const event = buildMetaLeadEvent({
    eventId: EVENT_ID,
    eventTimeSeconds: 1_763_460_000,
    sourceUrl: "https://www.rook.com.br/bl1/",
    clientIp: "200.100.50.25",
    userAgent: UA,
    fbp: FBP,
    fbc: FBC,
  });
  assert.deepEqual(event, {
    event_name: "Lead",
    event_time: 1_763_460_000,
    event_id: EVENT_ID,
    action_source: "website",
    event_source_url: "https://www.rook.com.br/bl1/",
    user_data: { client_user_agent: UA, client_ip_address: "200.100.50.25", fbp: FBP, fbc: FBC },
  });
  const json = JSON.stringify(event);
  for (const valor of [ACCESS.name, ACCESS.email.toLowerCase(), "98888", ACCESS.restaurant]) {
    assert.ok(!json.toLowerCase().includes(valor.toLowerCase()), `dado do formulário vazou: ${valor}`);
  }
  // Sem chaves de correspondência avançada (em, ph, fn, ln...) nem custom_data.
  assert.deepEqual(Object.keys(event.user_data).sort(), ["client_ip_address", "client_user_agent", "fbc", "fbp"]);
  assert.equal("custom_data" in event, false);
  // Sem os obrigatórios de evento de site, não monta.
  assert.equal(buildMetaLeadEvent({ eventId: EVENT_ID, eventTimeSeconds: 1, sourceUrl: null, clientIp: null, userAgent: UA }), null);
  assert.equal(buildMetaLeadEvent({ eventId: EVENT_ID, eventTimeSeconds: 1, sourceUrl: "https://www.rook.com.br/bl1/", clientIp: null, userAgent: "" }), null);
});

test("URL sem query (UTMs e fbclid não vão no texto), cookies e IP saneados", () => {
  const origens = ["https://www.rook.com.br"];
  assert.equal(
    sanitizeEventSourceUrl("https://www.rook.com.br/bl1/?utm_source=meta&fbclid=IwAR0abc#acesso", origens),
    "https://www.rook.com.br/bl1/",
  );
  assert.equal(sanitizeEventSourceUrl("https://evil.example/bl1/", origens), null);
  assert.equal(sanitizeEventSourceUrl("javascript:alert(1)", origens), null);
  assert.equal(sanitizeEventSourceUrl(null, origens), null);
  assert.equal(sanitizeFbCookie(FBP), FBP);
  assert.equal(sanitizeFbCookie("fb.1.123.<script>"), null);
  assert.equal(sanitizeFbCookie("qualquer"), null);
  // Sem Referer (política do navegador, app do Instagram): URL canônica da /bl1.
  assert.equal(
    resolveEventSourceUrl({ referer: null, allowedOrigins: origens, fallbackUrl: "https://www.rook.com.br/bl1/" }),
    "https://www.rook.com.br/bl1/",
  );
  assert.equal(
    resolveEventSourceUrl({ referer: "https://www.rook.com.br/bl1/?utm_source=meta", allowedOrigins: origens, fallbackUrl: "https://www.rook.com.br/bl1/" }),
    "https://www.rook.com.br/bl1/",
  );
  assert.equal(resolveEventSourceUrl({ referer: null, allowedOrigins: origens, fallbackUrl: "https://evil.example/" }), null);
});

test("envio: URL do pixel, token no cabeçalho, código de teste e nenhuma exceção", async () => {
  const pedidos = [];
  const fakeOk = async (url, init) => {
    pedidos.push({ url, init });
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  };
  const event = buildMetaLeadEvent({ eventId: EVENT_ID, eventTimeSeconds: 1, sourceUrl: "https://www.rook.com.br/bl1/", clientIp: null, userAgent: UA });
  const hml = readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN, META_CAPI_TEST_EVENT_CODE: "TEST12345" }, "homolog");
  assert.equal(await sendMetaEvent({ config: hml, event, fetchImpl: fakeOk }), "sent");
  assert.equal(pedidos[0].url, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/1060053930335437/events`);
  assert.equal(pedidos[0].init.headers.Authorization, `Bearer ${TOKEN}`);
  const corpo = JSON.parse(pedidos[0].init.body);
  assert.equal(corpo.test_event_code, "TEST12345");
  assert.equal(corpo.data[0].event_id, EVENT_ID);
  assert.ok(!pedidos[0].init.body.includes(TOKEN), "o token não vai no corpo");

  const prod = readMetaCapiConfig({ META_CAPI_ACCESS_TOKEN: TOKEN }, "production");
  pedidos.length = 0;
  await sendMetaEvent({ config: prod, event, fetchImpl: fakeOk });
  assert.equal("test_event_code" in JSON.parse(pedidos[0].init.body), false);

  assert.equal(await sendMetaEvent({ config: prod, event, fetchImpl: async () => new Response("{}", { status: 400 }) }), "http_400");
  assert.equal(await sendMetaEvent({ config: prod, event, fetchImpl: async () => { throw new TypeError("rede"); } }), "network");
  const lento = (url, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("abort"), { name: "AbortError" }))));
  assert.equal(await sendMetaEvent({ config: prod, event, fetchImpl: lento, timeoutMs: 20 }), "timeout");
  assert.equal(await sendMetaEvent({ config: prod, event: null, fetchImpl: fakeOk }), "invalid_event");
  assert.equal(await sendMetaEvent({ config: { enabled: false }, event, fetchImpl: fakeOk }), "disabled");
});

test("a rota só chama a Meta depois de cadastro novo e repassa só consentimento e ID", async () => {
  const novo = loadBf1AccessRoute();
  const resposta = await novo.post(accessRequest({ adsConsent: true, leadEventId: EVENT_ID }));
  assert.equal(resposta.status, 201);
  // Objetos criados dentro do vm têm outro protótipo: compara por valor.
  assert.equal(JSON.stringify(novo.calls.metaLead), JSON.stringify([{ adsConsent: true, eventId: EVENT_ID, result: "created" }]));
  // O consentimento e o ID não entram no que é gravado.
  assert.equal("adsConsent" in novo.calls.register[0], false);
  assert.equal("leadEventId" in novo.calls.register[0], false);

  const repetido = loadBf1AccessRoute({ register: async () => ({ result: "duplicate", requestId: ACCESS.submissionId, attributionRecorded: false }) });
  assert.equal((await repetido.post(accessRequest({ adsConsent: true, leadEventId: EVENT_ID }))).status, 200);
  assert.equal(repetido.calls.metaLead.length, 0);

  const falhou = loadBf1AccessRoute({ metaLead: async () => { throw new Error("meta fora do ar"); } });
  assert.equal((await falhou.post(accessRequest({ adsConsent: true, leadEventId: EVENT_ID }))).status, 201, "falha da Meta não derruba o cadastro");
});

test("o formulário manda o consentimento e o mesmo ID ao servidor e ao pixel", () => {
  const dialogo = read("src/components/bf1/Bf1AccessDialog.tsx");
  assert.match(dialogo, /leadEventId\.current = crypto\.randomUUID\(\);/);
  assert.match(dialogo, /adsConsent: adsConsentGranted\(\),\s*leadEventId: leadEventId\.current,/);
  assert.match(dialogo, /parseConsentState\(window\.localStorage\.getItem\(CONSENT_STORAGE_KEY\)\)\?\.ad_storage === "granted"/);
  assert.match(dialogo, /track\(TRACKING_EVENTS\.lead, \{ channel: BF1_LEAD_CHANNEL, event_id: leadEventId\.current \}\)/);
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.lead, { channel: "bf1_comunidade", event_id: EVENT_ID }),
    { event: "generate_lead", channel: "bf1_comunidade", event_id: EVENT_ID },
  );
  assert.throws(() => buildTrackingEvent(TRACKING_EVENTS.lead, { email: "a@b.com" }));
});

test("o envio do servidor não lê o cadastro e não registra dado pessoal", () => {
  const helper = read("src/lib/bf1-meta-lead.ts");
  assert.match(helper, /^import "server-only";/);
  assert.doesNotMatch(helper, /parsed|\.email|\.phone|\.name\b|restaurant|sha256|createHash/);
  // Log só com código fixo: todo console.* começa com o prefixo bf1_meta_capi_.
  const logs = [...helper.matchAll(/console\.(info|error)\(([^)]*)\)/g)].map((m) => m[2]);
  assert.ok(logs.length >= 3, "achou as chamadas de log (o teste não pode passar vazio)");
  for (const arg of logs) {
    assert.match(arg, /^(`bf1_meta_capi_|"bf1_meta_capi_|input\.adsConsent === true \? "bf1_meta_capi_)/, `log inesperado: ${arg}`);
  }
  // IP: a mesma função do antiabuso; URL: fallback na /bl1 canônica.
  assert.match(helper, /clientIp: resolveCommercialLeadClientIp\(request\.headers\)/);
  assert.match(helper, /fallbackUrl: siteUrl\("\/bl1\/"\)/);
  const modulo = read("src/lib/meta-capi.mjs");
  assert.doesNotMatch(modulo, /console\./, "o módulo puro não loga (o token nunca vai para log)");
});
