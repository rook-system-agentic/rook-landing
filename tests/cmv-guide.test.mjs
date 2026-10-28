import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCmvGuidePhone,
  validateCmvGuideInput,
} from "../src/lib/cmv-guide-validation.mjs";
import { readCmvGuideConfig } from "../src/lib/cmv-guide-config.mjs";
import {
  CMV_GUIDE_MANIFEST,
  buildCmvGuideEmail,
  verifyCmvGuideMaterial,
} from "../src/lib/cmv-guide-envelope.mjs";
import {
  CmvGuidePersistenceError,
  createCmvGuidePersistence,
} from "../src/lib/cmv-guide-persistence.mjs";
import { CmvGuideStorageError, readCmvGuideMaterials } from "../src/lib/cmv-guide-storage.mjs";
import { runCmvGuideDispatch } from "../src/lib/cmv-guide-dispatch.mjs";
import { cmvGuideCorsPolicy } from "../src/lib/cmv-guide-origin.mjs";

const BASE = {
  submissionId: "bb189bc0-1c1d-4cca-8400-44ac47fbda81",
  name: "Pessoa Teste",
  email: "teste@example.invalid",
  phone: "(11) 99999-9999",
  restaurant: "Restaurante Teste",
  commercialContactRequested: false,
};

const env = (extra = {}) => ({
  CMV_GUIDE_ENABLED: "true",
  CMV_GUIDE_ENV: "homolog",
  NEXT_PUBLIC_ENV: "homolog",
  CMV_GUIDE_SUPABASE_URL: "https://hsaehgdbzqgqehkfzofz.supabase.co",
  CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY: "s".repeat(32),
  CMV_GUIDE_ABUSE_SECRET: "a".repeat(32),
  CMV_GUIDE_DELIVERY_ENABLED: "true",
  RESEND_API_KEY: "re_test",
  CMV_GUIDE_FROM: "Rook <materiais@rook.com.br>",
  CMV_GUIDE_TEST_EMAIL: BASE.email,
  ...extra,
});

test("validação normaliza telefone BR e mantém somente os quatro dados mais consentimento", () => {
  assert.equal(normalizeCmvGuidePhone("+55 (11) 99999-9999"), "+5511999999999");
  const parsed = validateCmvGuideInput({ ...BASE, phone: "+55 (11) 99999-9999", ignored: "não persiste" });
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.value, { ...BASE, phone: "+5511999999999" });
});

test("validação rejeita UUID, campos, booleano e header injection inválidos", () => {
  for (const patch of [
    { submissionId: "not-a-uuid" },
    { name: "A\nB" },
    { email: "invalido" },
    { phone: "11 9999" },
    { phone: "01 99999-9999" },
    { phone: "11 1999-9999" },
    { restaurant: "" },
    { commercialContactRequested: "true" },
  ]) {
    const result = validateCmvGuideInput({ ...BASE, ...patch });
    assert.equal(result.ok, false, JSON.stringify(patch));
    assert.ok(Object.keys(result.errors).length > 0);
  }
});

test("validação rejeita limites sem truncar o valor recebido", () => {
  for (const patch of [
    { name: "N".repeat(121) },
    { restaurant: "R".repeat(121) },
    { email: `${"a".repeat(250)}@x.co` },
  ]) {
    const result = validateCmvGuideInput({ ...BASE, ...patch });
    assert.equal(result.ok, false, JSON.stringify(patch));
  }
});

test("configuração exige ambiente alinhado, host dedicado e segredo antiabuso próprio", () => {
  assert.equal(readCmvGuideConfig(env()).publicReady, true);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_ABUSE_SECRET: undefined, COMMERCIAL_LEAD_ABUSE_SECRET: "x".repeat(32) })).publicReady, false);
  assert.equal(readCmvGuideConfig(env({ SUPABASE_URL: "https://hsaehgdbzqgqehkfzofz.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "x".repeat(32), CMV_GUIDE_SUPABASE_URL: undefined })).publicReady, false);
  assert.equal(readCmvGuideConfig(env({ NEXT_PUBLIC_ENV: "production" })).publicReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_SUPABASE_URL: "https://untrusted.invalid" })).publicReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_SUPABASE_URL: "https://user:pass@hsaehgdbzqgqehkfzofz.supabase.co/" })).publicReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_SUPABASE_URL: "https://hsaehgdbzqgqehkfzofz.supabase.co:8443/" })).publicReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_SUPABASE_URL: "https://hsaehgdbzqgqehkfzofz.supabase.co:443/" })).publicReady, true);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_DELIVERY_ENABLED: "false" })).deliveryReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_FROM: "Rook <materiais@evil.example>" })).deliveryReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_FROM: "Rook\r\nBcc: evil@example.invalid" })).deliveryReady, false);
  assert.equal(readCmvGuideConfig(env({ CMV_GUIDE_REPLY_TO: "support@example.invalid\nBcc: evil@example.invalid" })).deliveryReady, false);
});

test("origem canônica atravessa proxy interno, mas host de produção não atravessa HML", () => {
  assert.equal(cmvGuideCorsPolicy("https://lp.homolog.rook.com.br", "http://upstream.internal", "https://lp.homolog.rook.com.br", "homolog").allowed, true);
  assert.equal(cmvGuideCorsPolicy("https://www.rook.com.br", "https://www.rook.com.br", "https://lp.homolog.rook.com.br", "homolog").allowed, false);
  assert.equal(cmvGuideCorsPolicy("https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "homolog").allowed, true);
  assert.equal(cmvGuideCorsPolicy("http://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "homolog").allowed, false);
  assert.equal(cmvGuideCorsPolicy("https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "https://preview.vercel.app", "homolog").allowed, false);
  assert.equal(cmvGuideCorsPolicy("https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "production").allowed, false);
  assert.equal(cmvGuideCorsPolicy("https://user:pass@lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "https://lp.homolog.rook.com.br", "homolog").allowed, false);
});

test("manifesto usa objetos fixos, hashes e tamanhos dos originais", () => {
  assert.deepEqual(CMV_GUIDE_MANIFEST.map((entry) => [entry.objectPath, entry.filename, entry.bytes]), [
    ["cmv-guide-v2/Guia_Pratico_CMV_Rook.pdf", "Guia_Pratico_CMV_Rook.pdf", 237658],
    ["cmv-guide-v2/Planilha_Apoio_Guia_Pratico_CMV_Rook.xlsx", "Planilha_Apoio_Guia_Pratico_CMV_Rook.xlsx", 35909],
  ]);
  assert.equal(verifyCmvGuideMaterial({ bytes: new Uint8Array([1]) }, CMV_GUIDE_MANIFEST[0]), false);
});

test("envelope é escapado e determinístico, sem pixel ou link de tracking", () => {
  const attachments = [
    { filename: CMV_GUIDE_MANIFEST[0].filename, content: "cGRm" },
    { filename: CMV_GUIDE_MANIFEST[1].filename, content: "eGxzeA==" },
  ];
  const first = buildCmvGuideEmail({ request: { ...BASE, name: "<Ana> Silva" }, recordKind: "test", requestId: BASE.submissionId, from: "Rook <materiais@rook.com.br>", attachments });
  const second = buildCmvGuideEmail({ request: { ...BASE, name: "<Ana> Silva" }, recordKind: "test", requestId: BASE.submissionId, from: "Rook <materiais@rook.com.br>", attachments });
  assert.equal(first.envelopeHash, second.envelopeHash);
  assert.equal(first.idempotencyKey, `cmv-guide-v2/test/${BASE.submissionId}`);
  assert.match(first.payload.html, /&lt;Ana&gt;/);
  assert.doesNotMatch(`${first.payload.html}${first.payload.text}`, /pixel|unsubscribe|utm_|tracking/i);
  assert.match(first.payload.text, /estoque inicial \+ compras − estoque final/);
});

test("adapter chama RPCs fixas, rejeita receipt inválido e não salva CNPJ/CRM", async () => {
  const calls = [];
  const persistence = createCmvGuidePersistence({ adminRequest: async (path, options) => {
    calls.push({ path, body: JSON.parse(options.body) });
    if (path.includes("enqueue")) return [{ result: "created", request_id: BASE.submissionId, delivery_status: "queued" }];
    if (path.includes("prepare")) return [{ prepared: true }];
    if (path.includes("finish")) return [{ updated: true }];
    if (path.includes("claim")) return [];
    if (path.includes("list")) return [];
    return [{ updated: true }];
  } });
  const saved = await persistence.enqueue({ ...BASE, phone: "+5511999999999" }, "test");
  assert.equal(saved.result, "created");
  assert.deepEqual(Object.keys(calls[0].body.p_request).sort(), ["commercialContactRequested", "email", "name", "phone", "restaurant"]);
  assert.equal(Object.hasOwn(calls[0].body.p_request, "cnpj"), false);
  await assert.rejects(() => persistence.finish(BASE.submissionId, BASE.submissionId, "accepted"), (error) => error instanceof CmvGuidePersistenceError && error.code === "invalid_provider_receipt");
});

test("storage falha fechado em checksum incorreto e não expõe bytes públicos", async () => {
  const response = new Response(Uint8Array.from([1]));
  await assert.rejects(() => readCmvGuideMaterials({ supabaseUrl: env().CMV_GUIDE_SUPABASE_URL, serviceRoleKey: env().CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY, fetchImpl: async () => response }), (error) => error instanceof CmvGuideStorageError && error.code === "asset_checksum_mismatch");
});

test("storage rejeita Content-Length diferente do manifesto antes de ler o body", async () => {
  const response = new Response(Uint8Array.from([1]), { headers: { "content-length": "1" } });
  await assert.rejects(() => readCmvGuideMaterials({ supabaseUrl: env().CMV_GUIDE_SUPABASE_URL, serviceRoleKey: env().CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY, fetchImpl: async () => response }), (error) => error instanceof CmvGuideStorageError && error.code === "asset_size_mismatch");
});

test("storage limita stream chunked a manifesto mais um byte", async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(CMV_GUIDE_MANIFEST[0].bytes + 1));
      controller.close();
    },
  });
  const response = new Response(stream);
  await assert.rejects(() => readCmvGuideMaterials({ supabaseUrl: env().CMV_GUIDE_SUPABASE_URL, serviceRoleKey: env().CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY, fetchImpl: async () => response }), (error) => error instanceof CmvGuideStorageError && error.code === "asset_size_mismatch");
});

test("dispatch mantém hash/idempotência no retry, reconcilia mismatch e faz polling monotônico", async () => {
  const calls = [];
  let sends = 0;
  const counters = await runCmvGuideDispatch({
    recordKind: "test",
    testEmail: BASE.email,
    claim: async () => [{ id: BASE.submissionId, lease_token: "lease", request: BASE }],
    prepare: async (id, lease, hash) => { calls.push(["prepare", id, lease, hash]); return true; },
    finish: async (...args) => { calls.push(["finish", ...args]); return true; },
    loadMaterials: async () => [],
    buildEnvelope: () => ({ envelopeHash: "a".repeat(64), idempotencyKey: "cmv-guide-v2/test/id", payload: {} }),
    sendEmail: async (envelope) => { sends += 1; assert.equal(envelope.idempotencyKey, "cmv-guide-v2/test/id"); return { id: "re_123" }; },
    listReceipts: async () => [{ id: BASE.submissionId, providerMessageId: "re_123" }],
    readReceipt: async () => "delivered",
    recordReceipt: async (...args) => { calls.push(["receipt", ...args]); return true; },
  });
  assert.equal(sends, 1);
  assert.deepEqual(counters, { claimed: 1, accepted: 1, retried: 0, failed: 0, delivered: 1, bounced: 0, reconciled: 1, needsReconciliation: 0 });
  assert.equal(calls.filter((call) => call[0] === "finish")[0][4], "re_123");
});

test("dispatch não envia HML para destinatário diferente do controlado", async () => {
  let sent = false;
  const result = await runCmvGuideDispatch({
    recordKind: "test",
    testEmail: "controle@example.invalid",
    claim: async () => [{ id: BASE.submissionId, lease_token: "lease", request: BASE }],
    prepare: async () => { throw new Error("não deveria preparar"); },
    finish: async (...args) => { assert.equal(args[2], "needs_reconciliation"); return true; },
    loadMaterials: async () => [],
    buildEnvelope: () => ({}),
    sendEmail: async () => { sent = true; return { id: "re_bad" }; },
  });
  assert.equal(sent, false);
  assert.equal(result.needsReconciliation, 1);
});


test("bounce é falha pública e não um estado de UI desconhecido", async () => {
  const persistence = createCmvGuidePersistence({ adminRequest: async () => ({ result: "existing", request_id: BASE.submissionId, delivery_status: "bounced" }) });
  assert.equal((await persistence.enqueue({ ...BASE, phone: "+5511999999999" }, "test")).state, "failed");
});

test("lote paralelo limitado confirma duas mensagens sem espera serial e sem contar finish perdido", async () => {
  let releases = 0;
  let finishOne;
  const bothSending = new Promise(resolve => { finishOne = resolve; });
  const claims = [1, 2].map(index => ({ id: String(index), lease_token: "lease", request: BASE }));
  const result = await runCmvGuideDispatch({
    recordKind: "test", testEmail: BASE.email, limit: 2,
    claim: async limit => { assert.equal(limit, 2); return claims; },
    prepare: async () => true,
    finish: async id => id === "1",
    loadMaterials: async () => [],
    buildEnvelope: () => ({ envelopeHash: "a".repeat(64), payload: {} }),
    sendEmail: async () => { releases++; if (releases === 2) finishOne(); await bothSending; return { id: "re_12345678" }; },
  });
  assert.equal(result.claimed, 2);
  assert.equal(result.accepted, 1);
  assert.equal(result.needsReconciliation, 1);
});
