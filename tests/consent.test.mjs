import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_STORAGE_KEY,
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

test("a chave de armazenamento e estavel", () => {
  assert.equal(CONSENT_STORAGE_KEY, "rook-consent");
});
