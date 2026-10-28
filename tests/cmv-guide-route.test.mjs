import test from "node:test";
import assert from "node:assert/strict";
import { GUIDE, guideRequest, loadCmvGuideRoute } from "./helpers/cmv-guide-route.mjs";
import { CmvGuidePersistenceError } from "../src/lib/cmv-guide-persistence.mjs";

function noPrivateData(body) {
  const raw = JSON.stringify(body);
  assert.doesNotMatch(raw, /teste@example|99999|Pessoa Teste|private-|provider_message|cnpj|resend/i);
}

test("GET do Guia emite desafio só quando a configuração dedicada está pronta", async () => {
  const unavailable = loadCmvGuideRoute({ configured: false });
  assert.equal((await unavailable.get(guideRequest({}, { method: "GET" }))).status, 503);
  assert.equal(unavailable.calls.challenge, 0);

  const available = loadCmvGuideRoute();
  const response = await available.get(guideRequest({}, { method: "GET" }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { token: "challenge", difficulty: 3, expiresInSeconds: 600 });
  assert.equal(available.calls.challenge, 1);
});

test("POST inválido não consome antiabuso nem chama enqueue", async () => {
  const route = loadCmvGuideRoute();
  for (const [payload, expectedStatus] of [
    [null, 400],
    [{ ...GUIDE, name: "" }, 422],
    [{ ...GUIDE, name: "N".repeat(121) }, 422],
    [{ ...GUIDE, email: "sem-email" }, 422],
    [{ ...GUIDE, email: `${"a".repeat(250)}@x.co` }, 422],
    [{ ...GUIDE, phone: "01 99999-9999" }, 422],
    [{ ...GUIDE, phone: "11 1999-9999" }, 422],
    [{ ...GUIDE, commercialContactRequested: "true" }, 422],
  ]) {
    const response = await route.post(new Request("https://www.rook.com.br/api/cmv-guide/", { method: "POST", body: JSON.stringify(payload) }));
    assert.equal(response.status, expectedStatus);
    const body = await response.json();
    if (expectedStatus === 422) assert.ok(Object.keys(body.fieldErrors).length > 0);
  }
  assert.equal(route.calls.gate.length, 0);
  assert.equal(route.calls.enqueue.length, 0);
});

test("POST confirmado só responde depois do enqueue RPC e não expõe PII", async () => {
  let entered;
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const route = loadCmvGuideRoute({ enqueue: async (value) => { entered(value); await pending; return { result: "created", state: "queued" }; } });
  const waiting = route.post(guideRequest());
  await new Promise((resolve) => { entered = (value) => { assert.equal(value.phone, "+5511999999999"); resolve(); }; });
  release();
  const response = await waiting;
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["success", "state", "message"]);
  assert.equal(body.state, "queued");
  noPrivateData(body);
  assert.equal(route.calls.gate.length, 1);
});

test("duplo clique/replay de UUID retorna estado existente; conflito retorna 409", async () => {
  const existing = loadCmvGuideRoute({ enqueue: async () => ({ result: "existing", state: "provider_accepted" }) });
  const response = await existing.post(guideRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).state, "provider_accepted");

  const conflict = loadCmvGuideRoute({ enqueue: async () => { throw new CmvGuidePersistenceError("conflict"); } });
  const conflictResponse = await conflict.post(guideRequest());
  assert.equal(conflictResponse.status, 409);
  noPrivateData(await conflictResponse.json());
});

test("HML recusa destinatário diferente antes de consumir antiabuso ou enfileirar", async () => {
  const route = loadCmvGuideRoute({ testRecipient: "controle@example.invalid" });
  const response = await route.post(guideRequest());
  assert.equal(response.status, 422);
  assert.equal((await response.json()).fieldErrors.email, "Use o destinatário de homologação autorizado.");
  assert.equal(route.calls.gate.length, 0);
  assert.equal(route.calls.enqueue.length, 0);
});

test("proteção traduz replay, rate limit e falha de infraestrutura sem enqueue", async () => {
  for (const [gate, status, retry] of [
    [async () => ({ allowed: false, reason: "nonce_replayed", retryAfterSeconds: 0 }), 400, null],
    [async () => ({ allowed: false, reason: "ip_rate_limited", retryAfterSeconds: 75 }), 429, "75"],
    [async () => { throw Object.assign(new Error("invalid"), { code: "invalid_challenge" }); }, 400, null],
    [async () => { throw new Error("private"); }, 503, null],
  ]) {
    const route = loadCmvGuideRoute({ gate });
    const response = await route.post(guideRequest());
    assert.equal(response.status, status);
    assert.equal(response.headers.get("retry-after"), retry);
    noPrivateData(await response.json());
    assert.equal(route.calls.enqueue.length, 0);
  }
});

test("origem não autorizada e corpo acima de 16 KiB são rejeitados", async () => {
  const origin = loadCmvGuideRoute({ corsAllowed: false });
  assert.equal((await origin.post(guideRequest())).status, 403);
  assert.equal(origin.calls.gate.length, 0);
  const oversized = loadCmvGuideRoute();
  const response = await oversized.post(new Request("https://www.rook.com.br/api/cmv-guide/", { method: "POST", body: "x".repeat(16 * 1024 + 1) }));
  assert.equal(response.status, 413);
});
