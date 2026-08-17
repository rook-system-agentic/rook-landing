import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_KEYS,
  CONSENT_VALUES,
  defaultConsentState,
  grantedConsentState,
  parseConsentState,
  serializeConsentState,
} from "../src/lib/consent.mjs";

test("por padrao a publicidade e negada e a medicao e concedida", () => {
  assert.deepEqual(defaultConsentState(), {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
});

test("aceitar concede tudo", () => {
  const estado = grantedConsentState();
  assert.deepEqual(Object.keys(estado).sort(), [
    "ad_personalization",
    "ad_storage",
    "ad_user_data",
    "analytics_storage",
  ]);
  for (const valor of Object.values(estado)) {
    assert.equal(valor, "granted");
  }
});

test("serializa e le de volta o mesmo estado", () => {
  const estado = grantedConsentState();
  assert.deepEqual(parseConsentState(serializeConsentState(estado)), estado);
});

test("valor invalido no armazenamento vira null, nao explode", () => {
  assert.equal(parseConsentState("nao é json"), null);
  assert.equal(parseConsentState(null), null);
  assert.equal(parseConsentState('{"ad_storage":"talvez"}'), null);
});

test("objeto parcial com chaves faltando vira null mesmo com valores validos", () => {
  const parcial = JSON.stringify({
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    // analytics_storage faltando
  });
  assert.equal(parseConsentState(parcial), null);
});

test("campo extra e descartado, devolvendo exatamente as quatro chaves", () => {
  const comExtra = JSON.stringify({
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
    utm_source: "newsletter", // campo desconhecido
  });
  const resultado = parseConsentState(comExtra);
  assert.notEqual(resultado, null);
  assert.deepEqual(Object.keys(resultado).sort(), [
    "ad_personalization",
    "ad_storage",
    "ad_user_data",
    "analytics_storage",
  ]);
  assert.equal(resultado.utm_source, undefined);
});

test("a chave de armazenamento e estavel", () => {
  assert.equal(CONSENT_STORAGE_KEY, "rook-consent");
});

test("CONSENT_KEYS e CONSENT_VALUES ficam coerentes com defaultConsentState, para nao divergir da validacao inline do script GTM", () => {
  assert.deepEqual(
    [...CONSENT_KEYS].sort(),
    Object.keys(defaultConsentState()).sort(),
  );

  for (const valor of Object.values(defaultConsentState())) {
    assert.ok(
      CONSENT_VALUES.includes(valor),
      `valor padrao "${valor}" deveria estar em CONSENT_VALUES`,
    );
  }
});
