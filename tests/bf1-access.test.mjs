import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BF1_ACCESS_HOMOLOG_DATABASE_HOSTS,
  BF1_ACCESS_PRODUCTION_DATABASE_HOSTS,
  readBf1AccessConfig,
} from "../src/lib/bf1-access-config.mjs";
import { readCmvGuideConfig } from "../src/lib/cmv-guide-config.mjs";
import {
  BF1_ACCESS_CAMPAIGN,
  BF1_ACCESS_NOTICE_VERSION,
  validateBf1AccessInput,
} from "../src/lib/bf1-access-validation.mjs";
import {
  BF1_ACCESS_RPC,
  BF1_ACCESS_RPC_PARAMS,
  Bf1AccessPersistenceError,
  createBf1AccessPersistence,
} from "../src/lib/bf1-access-persistence.mjs";
import { buildTrackingEvent, TRACKING_EVENTS } from "../src/lib/tracking-events.mjs";
import { ACCESS, FakeBackendError, accessRequest, loadBf1AccessRoute } from "./helpers/bf1-access-route.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const KEY = "k".repeat(40);
const SECRET = "s".repeat(40);
const PROD_ENV = {
  BF1_ACCESS_ENABLED: "true",
  NEXT_PUBLIC_ENV: "production",
  CMV_GUIDE_ENV: "production",
  CMV_GUIDE_SUPABASE_URL: "https://fzvhgucgfmhnisaqellu.supabase.co",
  CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY: KEY,
  CMV_GUIDE_ABUSE_SECRET: SECRET,
};
const HML_ENV = {
  ...PROD_ENV,
  NEXT_PUBLIC_ENV: "homolog",
  CMV_GUIDE_ENV: "homolog",
  CMV_GUIDE_SUPABASE_URL: "https://hsaehgdbzqgqehkfzofz.supabase.co",
};

// ───────────── Configuração ─────────────

test("config: pronta com o banco/chave/antiabuso do Guia CMV, sem depender das flags do CMV", () => {
  const prod = readBf1AccessConfig(PROD_ENV);
  assert.equal(prod.ready, true);
  assert.equal(prod.recordKind, "live");
  assert.equal(prod.source, "cmv_guide");
  const hml = readBf1AccessConfig(HML_ENV);
  assert.equal(hml.ready, true);
  assert.equal(hml.recordKind, "test");
  // CMV desligado ou sem entrega não derruba o cadastro da /bl1.
  assert.equal(readBf1AccessConfig({ ...PROD_ENV, CMV_GUIDE_ENABLED: "false", CMV_GUIDE_DELIVERY_ENABLED: "false" }).ready, true);
});

test("config: desalinhamento de ambiente, host estranho, chave curta e kill switch fecham", () => {
  assert.equal(readBf1AccessConfig({ ...PROD_ENV, NEXT_PUBLIC_ENV: "homolog" }).ready, false);
  assert.equal(readBf1AccessConfig({ ...PROD_ENV, CMV_GUIDE_SUPABASE_URL: "https://hsaehgdbzqgqehkfzofz.supabase.co" }).ready, false);
  assert.equal(readBf1AccessConfig({ ...PROD_ENV, CMV_GUIDE_SUPABASE_URL: "https://evil.supabase.co" }).ready, false);
  assert.equal(readBf1AccessConfig({ ...PROD_ENV, CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY: "curta" }).ready, false);
  assert.equal(readBf1AccessConfig({ ...PROD_ENV, CMV_GUIDE_ABUSE_SECRET: "" }).ready, false);
  // Ativação explícita: sem BF1_ACCESS_ENABLED=true o cadastro fica desligado
  // e o CTA leva direto ao grupo (deploy da landing antes da migration é seguro).
  for (const value of [undefined, "", "false", "1", "TRUE"]) {
    const off = readBf1AccessConfig({ ...PROD_ENV, BF1_ACCESS_ENABLED: value });
    assert.equal(off.ready, false, `BF1_ACCESS_ENABLED=${value}`);
    assert.ok(off.errors.includes("disabled"));
    assert.equal(off.serviceRoleKey, null, "segredo não sai da config quando não está pronta");
  }
});

test("config: conjunto dedicado é tudo ou nada (não mistura URL de um banco com chave de outro)", () => {
  const mixed = readBf1AccessConfig({ ...PROD_ENV, BF1_ACCESS_SUPABASE_URL: "https://supabase.rook.com.br" });
  assert.equal(mixed.ready, false);
  assert.ok(mixed.errors.includes("database_key_missing"));
  const dedicated = readBf1AccessConfig({
    ...PROD_ENV,
    BF1_ACCESS_SUPABASE_URL: "https://supabase.rook.com.br",
    BF1_ACCESS_SUPABASE_SERVICE_ROLE_KEY: KEY,
    BF1_ACCESS_ABUSE_SECRET: SECRET,
  });
  assert.equal(dedicated.ready, true);
  assert.equal(dedicated.source, "dedicated");
});

test("config: hosts de banco aceitos são os mesmos do Guia CMV (não divergem em silêncio)", () => {
  const cmvBase = { CMV_GUIDE_ENABLED: "true", CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY: KEY, CMV_GUIDE_ABUSE_SECRET: SECRET, CMV_GUIDE_TEST_EMAIL: "t@rook.com.br" };
  for (const [environment, hosts] of [["homolog", BF1_ACCESS_HOMOLOG_DATABASE_HOSTS], ["production", BF1_ACCESS_PRODUCTION_DATABASE_HOSTS]]) {
    for (const host of hosts) {
      const cmv = readCmvGuideConfig({ ...cmvBase, NEXT_PUBLIC_ENV: environment, CMV_GUIDE_ENV: environment, CMV_GUIDE_SUPABASE_URL: `https://${host}` });
      assert.ok(!cmv.errors.includes("database_url_invalid"), `CMV não aceita ${host} em ${environment}`);
    }
  }
});

// ───────────── Validação ─────────────

test("validação: normaliza telefone +55 e e-mail, e o opt-in comercial nasce falso", () => {
  const result = validateBf1AccessInput({ ...ACCESS, commercialContactRequested: undefined });
  assert.equal(result.ok, true);
  assert.equal(result.value.phone, "+5511988887777");
  assert.equal(result.value.email, "teste@example.invalid");
  assert.equal(result.value.commercialContactRequested, false);
  assert.equal(result.value.attribution, null);
});

test("validação: recusa campo faltando, telefone sem DDD, opt-in não booleano e texto com controle", () => {
  for (const extra of [
    { name: "" },
    { email: "sem-arroba" },
    { phone: "98888-7777" },
    { phone: "01 98888-7777" },
    { restaurant: "R" },
    { restaurant: "Bar\u0007" },
    { commercialContactRequested: "true" },
    { submissionId: "nao-e-uuid" },
  ]) {
    assert.equal(validateBf1AccessInput({ ...ACCESS, ...extra }).ok, false, JSON.stringify(extra));
  }
});

test("validação: atribuição inválida é saneada ou descartada, nunca recusa o cadastro", () => {
  const shapeless = validateBf1AccessInput({ ...ACCESS, attribution: ["x"] });
  assert.equal(shapeless.ok, true);
  assert.equal(shapeless.value.attribution, null);
  const dirty = validateBf1AccessInput({ ...ACCESS, attribution: { utm_source: "meta", utm_campaign: "bf\u0000" } });
  assert.equal(dirty.ok, true);
  assert.equal(dirty.value.attribution.utm_source, "meta");
  assert.equal(dirty.value.attribution.utm_campaign, undefined, "campo inválido some, sem recusar");
});

// ───────────── Persistência (contrato com a RPC da ROO-1848) ─────────────

function fakePersistence(reply) {
  const calls = [];
  const persistence = createBf1AccessPersistence({
    adminRequest: async (path, init) => {
      calls.push({ path, body: JSON.parse(init.body) });
      return typeof reply === "function" ? reply() : reply;
    },
  });
  return { persistence, calls };
}

test("persistência: chama a RPC com exatamente os parâmetros da assinatura SQL", async () => {
  const valid = validateBf1AccessInput({ ...ACCESS, commercialContactRequested: true }).value;
  const { persistence, calls } = fakePersistence([{ result: "created", request_id: "9b2f6a1e-1c3d-4e5f-8a7b-6c5d4e3f2a1b", attribution_recorded: false }]);
  const saved = await persistence.register(valid, "live");
  assert.deepEqual(saved, { result: "created", requestId: "9b2f6a1e-1c3d-4e5f-8a7b-6c5d4e3f2a1b", attributionRecorded: false });
  assert.equal(calls[0].path, `rpc/${BF1_ACCESS_RPC}`);
  assert.deepEqual(Object.keys(calls[0].body).sort(), [...BF1_ACCESS_RPC_PARAMS].sort());
  assert.equal(calls[0].body.p_campaign, BF1_ACCESS_CAMPAIGN);
  assert.equal(calls[0].body.p_notice_version, BF1_ACCESS_NOTICE_VERSION);
  assert.match(BF1_ACCESS_NOTICE_VERSION, /^bf1-aviso-v[1-9][0-9]{0,2}$/, "mesmo formato do CHECK SQL");
  assert.equal(calls[0].body.p_record_kind, "live");
  assert.deepEqual(Object.keys(calls[0].body.p_request).sort(), ["commercialContactRequested", "email", "name", "phone", "restaurant"]);
  assert.equal(calls[0].body.p_request.commercialContactRequested, true);
  assert.equal(calls[0].body.p_attribution, null);
});

test("persistência: existing passa, conflict e recibo inválido viram erro", async () => {
  const valid = validateBf1AccessInput(ACCESS).value;
  const existing = fakePersistence({ result: "existing", request_id: "9b2f6a1e-1c3d-4e5f-8a7b-6c5d4e3f2a1b" });
  assert.equal((await existing.persistence.register(valid, "test")).result, "existing");
  const conflict = fakePersistence([{ result: "conflict", request_id: "9b2f6a1e-1c3d-4e5f-8a7b-6c5d4e3f2a1b" }]);
  await assert.rejects(conflict.persistence.register(valid, "live"), (error) => error instanceof Bf1AccessPersistenceError && error.code === "conflict");
  const broken = fakePersistence([{ result: "created" }]);
  await assert.rejects(broken.persistence.register(valid, "live"), (error) => error.code === "invalid_register_receipt");
  await assert.rejects(existing.persistence.register(valid, "prod"), (error) => error.code === "invalid_record_kind");
});

// ───────────── Rota ─────────────

function noPrivateData(value) {
  assert.doesNotMatch(JSON.stringify(value), /Pessoa Teste|example\.invalid|98888|Restaurante Teste/i);
}

test("rota: sem configuração, GET e POST respondem 503 sem consumir antiabuso nem gravar", async () => {
  const route = loadBf1AccessRoute({ configured: false });
  assert.equal((await route.get(accessRequest({}, { method: "GET" }))).status, 503);
  assert.equal((await route.post(accessRequest())).status, 503);
  assert.equal(route.calls.challenge, 0);
  assert.equal(route.calls.gate.length, 0);
  assert.equal(route.calls.register.length, 0);
  assert.deepEqual(route.calls.logs, ["bf1_access_not_configured", "bf1_access_not_configured"]);
});

test("rota: GET emite o desafio sem cache", async () => {
  const route = loadBf1AccessRoute();
  const response = await route.get(accessRequest({}, { method: "GET" }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).token, "challenge");
});

test("rota: POST inválido devolve 422 por campo sem consumir antiabuso nem gravar", async () => {
  const route = loadBf1AccessRoute();
  for (const extra of [{ name: "" }, { phone: "123" }, { restaurant: "" }, { commercialContactRequested: "sim" }]) {
    const response = await route.post(accessRequest(extra));
    assert.equal(response.status, 422);
    assert.ok(Object.keys((await response.json()).fieldErrors).length > 0);
  }
  assert.equal((await route.post(new Request("https://www.rook.com.br/api/bf1-community-access/", { method: "POST", body: "[]" }))).status, 400);
  assert.equal(route.calls.gate.length, 0);
  assert.equal(route.calls.register.length, 0);
});

test("rota: POST válido grava depois do antiabuso e não devolve dado pessoal", async () => {
  const route = loadBf1AccessRoute();
  const response = await route.post(accessRequest());
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.deepEqual(body, { success: true });
  noPrivateData(body);
  assert.equal(route.calls.gate.length, 1);
  assert.equal(JSON.stringify(route.calls.gate[0].proof), JSON.stringify(ACCESS.antiBot));
  assert.equal(route.calls.register.length, 1);
  assert.equal(route.calls.register[0].phone, "+5511988887777");
  assert.equal(route.calls.register[0].commercialContactRequested, false);

  const replay = loadBf1AccessRoute({ register: async () => ({ result: "existing", requestId: ACCESS.submissionId }) });
  assert.equal((await replay.post(accessRequest())).status, 200);
});

test("rota: limite, conflito, desafio vencido e banco fora respondem sem PII nos logs", async () => {
  const limited = loadBf1AccessRoute({ gate: async () => ({ allowed: false, reason: "identity_rate_limited", retryAfterSeconds: 120 }) });
  const r429 = await limited.post(accessRequest());
  assert.equal(r429.status, 429);
  assert.equal(r429.headers.get("retry-after"), "120");
  assert.equal(limited.calls.register.length, 0);

  const replayed = loadBf1AccessRoute({ gate: async () => ({ allowed: false, reason: "nonce_replayed", retryAfterSeconds: 0 }) });
  assert.equal((await replayed.post(accessRequest())).status, 400);

  const conflict = loadBf1AccessRoute({ register: async () => { throw new Bf1AccessPersistenceError("conflict"); } });
  assert.equal((await conflict.post(accessRequest())).status, 409);

  const expired = loadBf1AccessRoute({ gate: async () => { throw new FakeBackendError("invalid_challenge"); } });
  assert.equal((await expired.post(accessRequest())).status, 400);

  const down = loadBf1AccessRoute({ register: async () => { throw new FakeBackendError("rpc_not_found"); } });
  const r503 = await down.post(accessRequest());
  assert.equal(r503.status, 503);
  noPrivateData(await r503.json());
  assert.deepEqual(down.calls.logs, ["bf1_access_rpc_not_found"]);
  noPrivateData(down.calls.logs);
});

// ───────────── UI, copy e privacidade (travas estáticas) ─────────────

test("UI: o CTA abre o cadastro antes do grupo e o modal só abre o grupo depois da gravação", () => {
  // ROO-1876: o clique é interceptado por um host único; o CTA é só a âncora.
  const host = read("src/components/bf1/Bf1AccessHost.tsx");
  assert.match(host, /event\.preventDefault\(\)/);
  assert.match(host, /Bf1AccessDialog/);
  assert.match(host, /hasBf1Access\(\)/);
  const cta = read("src/components/bf1/Bf1CommunityCta.tsx");
  assert.match(cta, /href=\{BF1_ACCESS_ANCHOR\}/);
  assert.doesNotMatch(cta, /href=\{link\.href\}|target="_blank"/, "o CTA nunca aponta para o convite");
  const dialog = read("src/components/bf1/Bf1AccessDialog.tsx");
  assert.match(dialog, /\/api\/bf1-community-access\//);
  assert.match(dialog, /validateBf1AccessInput/, "cliente usa a mesma validação do servidor");
  assert.match(dialog, /useState\(false\)/, "opt-in comercial desmarcado por padrão");
  const success = dialog.indexOf("rememberBf1Access();");
  assert.ok(success > dialog.indexOf("data.success !== true"), "só lembra/abre o grupo depois da confirmação do servidor");
  assert.ok(
    dialog.indexOf("window.setTimeout(() => window.location.assign(href), REDIRECT_DELAY_MS)") > success,
    "redirecionamento do sucesso só depois de lembrar o cadastro confirmado",
  );
  assert.match(dialog, /track\(TRACKING_EVENTS\.bf1AccessRequest\)/, "evento sem campos");
  assert.match(dialog, /response\.status === 503\) return "unavailable"/, "cadastro desligado → direto ao grupo");
  assert.match(dialog, /if \(result === "unavailable" && !inFlight\.current\) goDirect\(\)/);
  assert.match(dialog, /proof\.current = null;/, "prova do desafio é de uso único");
  assert.doesNotMatch(dialog, /track\([^)]*values|track\([^)]*email|console\./, "nada do formulário vai para analytics ou console");
});

test("analytics: bf1_access_request não aceita nenhum campo", () => {
  assert.deepEqual(buildTrackingEvent(TRACKING_EVENTS.bf1AccessRequest), { event: "bf1_access_request" });
  assert.throws(() => buildTrackingEvent(TRACKING_EVENTS.bf1AccessRequest, { email: "x" }));
});

test("copy: aviso de finalidade versionado, opt-in separado e link para a Política de Privacidade", async () => {
  const source = read("src/lib/bf1-content.ts");
  assert.match(source, /noticeVersion: BF1_ACCESS_NOTICE_VERSION/);
  assert.match(source, /liberar sua entrada no grupo Black Rook 2026/);
  assert.match(source, /Contato comercial sobre o sistema, só se você marcar/);
  assert.match(read("src/components/bf1/Bf1AccessDialog.tsx"), /href="\/privacidade\/"/);
  assert.doesNotMatch(source, /O Rook\b/, "marca é feminina: A Rook");
});

test("armazenamento local guarda só um marcador, nenhum dado pessoal", () => {
  const storage = read("src/components/bf1/bf1-access-storage.ts");
  assert.match(storage, /setItem\(BF1_ACCESS_STORAGE_KEY, "1"\)/);
  assert.equal((storage.match(/setItem\(/g) || []).length, 1);
});
