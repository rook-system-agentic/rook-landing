import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dispatchCmvGuide, CMV_GUIDE_ORIGINS } from '../scripts/dispatch-cmv-guide.mjs';

const secret = 'segredo-sintetico-cmv-nao-valido-em-ambiente';

test('acionador CMV só aceita os dois hosts canônicos e nunca segue redirect com Bearer', async () => {
  for (const [environment, origin] of Object.entries(CMV_GUIDE_ORIGINS)) {
    let call;
    const result = await dispatchCmvGuide({ environment, secret, fetchImpl: async (url, init) => {
      call = { url, init };
      return { ok: true, json: async () => ({ ok: true, accepted: 2, email: 'privado@example.invalid', token: secret }) };
    } });
    assert.equal(call.url, `${origin}/api/internal/cmv-guide-dispatch/`);
    assert.equal(call.init.method, 'POST');
    assert.equal(call.init.redirect, 'error');
    assert.equal(call.init.cache, 'no-store');
    assert.ok(call.init.signal instanceof AbortSignal);
    assert.equal(call.init.headers.Authorization, `Bearer ${secret}`);
    assert.deepEqual(result, { accepted: 2 });
  }
});

test('configuração ausente, destino arbitrário e chave curta não acionam a rede', async () => {
  for (const candidate of [{ environment: 'local', secret }, { environment: 'https://malicioso.invalid', secret },
    { environment: 'production', secret: '' }, { environment: 'production', secret: `${secret}\r\nvalor` }]) {
    let network = 0;
    await assert.rejects(dispatchCmvGuide({ ...candidate, fetchImpl: async () => { network++; } }), /inválida/);
    assert.equal(network, 0);
  }
});

test('falha HTTP e sucesso sem confirmação não são registrados como envio realizado', async () => {
  for (const response of [
    { ok: false, status: 503, json: async () => ({ email: 'privado' }) },
    { ok: true, json: async () => ({ accepted: 1 }) },
    { ok: true, json: async () => [] },
  ]) await assert.rejects(dispatchCmvGuide({ environment: 'homolog', secret, fetchImpl: async () => response }));
});

test('workflow CMV não ativa ambientes sem flags nem usa chave do Resend no runner', () => {
  const source = readFileSync(new URL('../.github/workflows/cmv-guide-delivery.yml', import.meta.url), 'utf8');
  assert.match(source, /CMV_GUIDE_HML_DISPATCH_ENABLED == 'true'/);
  assert.match(source, /CMV_GUIDE_PROD_DISPATCH_ENABLED == 'true'/);
  assert.match(source, /contents: read/);
  assert.match(source, /CMV_GUIDE_HML_DISPATCH_SECRET/);
  assert.match(source, /CMV_GUIDE_PROD_DISPATCH_SECRET/);
  assert.match(source, /cancel-in-progress: false/);
  assert.doesNotMatch(source, /RESEND_API_KEY|CONTENT_AUTOMATION_SECRET|pull_request/);
});
