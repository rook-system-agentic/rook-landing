import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateAcquisition } from '../src/lib/acquisition.mjs';
import * as cors from '../src/lib/acquisition-cors.mjs';
import { CommercialLeadAbuseProtectionError, createCommercialLeadAbuseProtection } from '../src/lib/commercial-lead-abuse-protection.mjs';
import { solveCommercialLeadChallenge } from '../src/lib/commercial-lead-challenge-client.mjs';
import * as ledger from '../src/lib/acquisition-ledger.mjs';
import { memoryLedger, checkpointReceipt, RECEIPT } from './helpers/acquisition-ledger.mjs';

// Execute the actual route with only transport dependencies replaced. This
// exercises the HTTP status/headers and verifies denied gates never reach CRM.
const source = readFileSync(new URL('../src/app/api/acquisition/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const cities = [{ id: '3550308', name: 'São Paulo', uf: 'SP' }];
const lead = {
  submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste',
  company: 'Casa Teste', email: 'teste@example.invalid', phone: '11999999999',
  cityId: '3550308', segment: 'pizzaria', revenueBand: 'up_to_100k', usesErp: 'no', consent: true,
};
const request = (token, extra = {}) => new Request('http://localhost/api/acquisition/', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ...lead, ...extra, antiBot: { token, solution: '0' } }),
});
function loadRoute({ gate = async () => ({ allowed: true }), create = async () => {}, env = {}, siteOrigin = 'https://www.rook.com.br', issueChallenge = () => ({ token: 'test-only', difficulty: 3, expiresInSeconds: 600 }) } = {}) {
  const calls = { challenge: [], gate: [], clients: 0, clientOptions: [], crm: [], network: 0 };
  const store=memoryLedger();
  const dependencies = {
    'next/server': { NextResponse: Response },
    '@/data/municipalities.json': cities,
    '@/lib/acquisition.mjs': { validateAcquisition },
    '@/lib/acquisition-cors.mjs': cors,
    '@/lib/site-origin': { SITE_ORIGIN: siteOrigin },
    '@/lib/acquisition-ledger.mjs':ledger,
    '@/lib/supabase-admin':{isSupabaseAdminConfigured:()=>true,supabaseAdminRequest:store.request},
    '@/lib/asaflow-acquisition.mjs': {
      createAsaflowAcquisition: options => {
        calls.clients++;
        calls.clientOptions.push(options);
        return { create: async (value,options) => { calls.crm.push(value); await create(value); return checkpointReceipt(options,RECEIPT); } };
      },
    },
    '@/lib/commercial-lead-abuse': {
      CommercialLeadAbuseProtectionError,
      isCommercialLeadAbuseProtectionConfigured: () => true,
      issueCommercialLeadChallenge: headers => { calls.challenge.push(headers); return issueChallenge(headers); },
      consumeCommercialLeadAbuseGate: async (headers, value, proof) => {
        calls.gate.push({ value, proof });
        return gate(proof, headers, value);
      },
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Buffer, URL,
    console: { error() {} },
    process: { env: {
      ASAFLOW_ACQUISITION_ENABLED: 'true', ASAFLOW_ACQUISITION_API_KEY: 'test-only',
      ASAFLOW_ACQUISITION_PIPELINE_ID: 'test-pipeline', ASAFLOW_ACQUISITION_STAGE_ID: 'test-stage',
      ...env,
    } },
    fetch: () => { calls.network++; throw new Error('External requests forbidden'); },
    require: name => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: 'api/acquisition/route.cjs' });
  return { get: module.exports.GET, post: module.exports.POST, options: module.exports.OPTIONS, calls };
}

test('cadastro comercial usa o ambiente do servidor no link ADM, sem aceitar override público', async () => {
  const { post, calls } = loadRoute({
    gate: async () => ({ allowed: true }), env: { NEXT_PUBLIC_ENV: 'homolog' },
  });
  const response = await post(request('fresh-proof', { environment: 'production', adminOrigin: 'https://untrusted.invalid' }));
  assert.equal(response.status, 201);
  assert.equal(calls.clientOptions[0].environment, 'homolog');
  assert.equal(calls.crm[0].environment, undefined);
  assert.equal(calls.crm[0].adminOrigin, undefined);
});

test('servidor transmite apenas atribuição normalizada e mantém sucesso com atribuição inválida', async () => {
  for (const input of [
    { source: 'meta_native_form', utm_source: 'facebookads', utm_campaign: '[ES] - LEADS ROOK LP 21/09',
      landing_path: '/diagnostico/', referrer_host: 'WWW.FACEBOOK.COM', fbclid: 'private', email: 'não transportar' },
    { utm_campaign: 'teste@example.invalid', landing_path: 'https://invalid.test/private' },
    'malformado',
  ]) {
    const { post, calls } = loadRoute({ gate: async () => ({ allowed: true, reason: 'allowed', retryAfterSeconds: 0 }) });
    const response = await post(request('fresh-proof', { attribution: input }));
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { success: true });
    assert.equal(calls.crm.length, 1);
    const saved = calls.crm[0].attribution;
    assert.doesNotMatch(JSON.stringify(saved), /fbclid|private|example.invalid|não transportar|meta_native_form/);
    if (typeof input === 'object' && input.utm_source) assert.deepEqual(saved, {
      version: 1, source: 'site_form', utm_source: 'facebookads', utm_campaign: '[ES] - LEADS ROOK LP 21/09',
      landing_path: '/diagnostico', referrer_host: 'www.facebook.com',
    });
  }
});

test('desafio já usado retorna 400 renovável, sem espera de rate limit nem CRM', async () => {
  const { post, calls } = loadRoute({ gate: async () => ({ allowed: false, reason: 'nonce_replayed', retryAfterSeconds: 0 }) });
  const response = await post(request('already-consumed'));
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('retry-after'), null);
  assert.match((await response.json()).error, /verificação.*já foi utilizada.*enviar novamente/i);
  assert.equal(calls.gate.length, 1);
  assert.equal(calls.clients, 0);
  assert.equal(calls.crm.length, 0);
  assert.equal(calls.network, 0);
});

test('limites reais de IP e identidade continuam 429 com Retry-After, sem CRM', async () => {
  for (const reason of ['ip_rate_limited', 'identity_rate_limited']) {
    const { post, calls } = loadRoute({ gate: async () => ({ allowed: false, reason, retryAfterSeconds: 120 }) });
    const response = await post(request('rate-limited'));
    assert.equal(response.status, 429, reason);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('retry-after'), '120');
    assert.equal(calls.clients, 0);
    assert.equal(calls.crm.length, 0);
    assert.equal(calls.network, 0);
  }
});

test('falha CRM consome prova; replay não grava e prova nova reaproveita a solicitação', async () => {
  const consumed = new Set();
  let attempts = 0;
  const { post, calls } = loadRoute({
    gate: async proof => {
      if (consumed.has(proof.token)) return { allowed: false, reason: 'nonce_replayed', retryAfterSeconds: 0 };
      consumed.add(proof.token);
      return { allowed: true, reason: 'allowed', retryAfterSeconds: 0 };
    },
    create: async () => { if (++attempts === 1) throw new Error('CRM response unavailable'); },
  });
  assert.equal((await post(request('first-proof'))).status, 503);
  assert.equal(calls.crm.length, 1);
  assert.equal((await post(request('first-proof'))).status, 400);
  assert.equal(calls.crm.length, 1);
  const retried = await post(request('fresh-proof'));
  assert.equal(retried.status, 201);
  assert.deepEqual(await retried.json(), { success: true });
  assert.equal(calls.crm.length, 2);
  assert.equal(calls.crm[0].submissionId, lead.submissionId);
  assert.equal(calls.crm[1].submissionId, lead.submissionId);
  assert.deepEqual(calls.crm[0], calls.crm[1]);
  assert.equal(calls.network, 0);
});

test('desafio expirado ou inválido segue 400 e não cria cliente CRM', async () => {
  const { post, calls } = loadRoute({ gate: async () => { throw new CommercialLeadAbuseProtectionError('invalid_challenge'); } });
  const response = await post(request('expired-proof'));
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('retry-after'), null);
  assert.match((await response.json()).error, /verificação expirou/i);
  assert.equal(calls.clients, 0);
  assert.equal(calls.crm.length, 0);
});

const PARTNER_ORIGIN = 'https://rook-beefood-parceria-20261023.gabriel-abdala.chatgpt.site';
const CUSTOM_PARTNER_ORIGIN = 'https://beefood.rook.com.br';
const API_URL = 'https://www.rook.com.br/api/acquisition/';
function browserRequest(method, { origin = PARTNER_ORIGIN, headers = {}, body } = {}) {
  return new Request(API_URL, { method,
    headers: { ...(origin === null ? {} : { origin }), ...headers },
    ...(body === undefined ? {} : { body }),
  });
}
function browserPost(extra = {}, options = {}) {
  return browserRequest('POST', { headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...lead, ...extra, antiBot: { token: 'fresh-proof', solution: '0' } }), ...options });
}
function assertCors(response, origin = PARTNER_ORIGIN) {
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-expose-headers'), 'Retry-After');
  assert.equal(response.headers.get('access-control-allow-credentials'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('vary'), 'Origin');
}
function assertNoEffects(calls) {
  assert.equal(calls.challenge.length, 0);
  assert.equal(calls.gate.length, 0);
  assert.equal(calls.clients, 0);
  assert.equal(calls.crm.length, 0);
  assert.equal(calls.network, 0);
}

test('pré-verificação aprova somente os métodos e headers do cadastro, sem desafio ou CRM', async () => {
  for (const method of ['GET', 'POST']) {
    const { options, calls } = loadRoute({ env: { ASAFLOW_ACQUISITION_ENABLED: 'false' } });
    const response = await options(browserRequest('OPTIONS', { headers: {
      'access-control-request-method': method, 'access-control-request-headers': 'Content-Type',
    } }));
    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    assertCors(response);
    assert.equal(response.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
    assert.equal(response.headers.get('access-control-allow-headers'), 'Content-Type');
    assertNoEffects(calls);
  }
  const { options, calls } = loadRoute();
  const response = await options(browserRequest('OPTIONS', { headers: { 'access-control-request-method': 'GET' } }));
  assert.equal(response.status, 204);
  assertNoEffects(calls);
});

test('origem não autorizada falha antes de desafio, validação e CRM em GET, POST e OPTIONS', async () => {
  for (const origin of ['null', 'https://untrusted.invalid', `${PARTNER_ORIGIN}/`,
    `${PARTNER_ORIGIN}.untrusted.invalid`, PARTNER_ORIGIN.replace('https:', 'http:'),
    'https://other.gabriel-abdala.chatgpt.site', `${PARTNER_ORIGIN}, https://untrusted.invalid`,
    `${CUSTOM_PARTNER_ORIGIN}/`, `${CUSTOM_PARTNER_ORIGIN}.untrusted.invalid`,
    CUSTOM_PARTNER_ORIGIN.replace('https:', 'http:'), `${CUSTOM_PARTNER_ORIGIN}:8443`,
    'https://other.rook.com.br', `https://www.beefood.rook.com.br`]) {
    for (const handler of ['get', 'post', 'options']) {
      const route = loadRoute();
      const response = await route[handler](browserRequest(handler.toUpperCase(), { origin,
        headers: { 'access-control-request-method': 'POST', 'access-control-request-headers': 'Content-Type' },
        ...(handler === 'post' ? { body: 'invalid-json' } : {}),
      }));
      assert.equal(response.status, 403, `${handler}: ${origin}`);
      assert.equal(response.headers.get('access-control-allow-origin'), null);
      assert.equal(response.headers.get('access-control-allow-credentials'), null);
      assert.equal(response.headers.get('vary'), 'Origin');
      assertNoEffects(route.calls);
    }
  }
});

test('domínio próprio da parceria recebe CORS exato sem dispensar as proteções do cadastro', async () => {
  for (const method of ['GET', 'POST']) {
    const { options, calls } = loadRoute({ env: { ASAFLOW_ACQUISITION_ENABLED: 'false' } });
    const response = await options(browserRequest('OPTIONS', { origin: CUSTOM_PARTNER_ORIGIN, headers: {
      'access-control-request-method': method, 'access-control-request-headers': 'Content-Type',
    } }));
    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    assertCors(response, CUSTOM_PARTNER_ORIGIN);
    assert.equal(response.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
    assert.equal(response.headers.get('access-control-allow-headers'), 'Content-Type');
    assertNoEffects(calls);
  }

  const challenge = { token: 'test-proof', difficulty: 3, expiresInSeconds: 600 };
  const { get, post, calls } = loadRoute({ issueChallenge: () => challenge });
  const response = await get(browserRequest('GET', { origin: CUSTOM_PARTNER_ORIGIN }));
  assert.equal(response.status, 200);
  assertCors(response, CUSTOM_PARTNER_ORIGIN);
  assert.deepEqual(await response.json(), challenge);
  assert.equal(calls.challenge.length, 1);

  const invalid = await post(browserRequest('POST', { origin: CUSTOM_PARTNER_ORIGIN,
    headers: { 'content-type': 'application/json' }, body: 'invalid-json' }));
  assert.equal(invalid.status, 400);
  assertCors(invalid, CUSTOM_PARTNER_ORIGIN);
  assert.equal(calls.gate.length, 0);
  assert.equal(calls.clients, 0);
  assert.equal(calls.crm.length, 0);
  assert.equal(calls.network, 0);
});

test('pré-verificação recusa métodos, headers extras e origem ausente sem efeitos', async () => {
  for (const input of [
    { headers: { 'access-control-request-method': 'DELETE' } },
    { headers: {} },
    { headers: { 'access-control-request-method': 'post' } },
    { headers: { 'access-control-request-method': 'POST', 'access-control-request-headers': 'Content-Type, Authorization' } },
    { headers: { 'access-control-request-method': 'POST', 'access-control-request-headers': 'X-Forwarded-For' } },
    { origin: null, headers: { 'access-control-request-method': 'POST' } },
  ]) {
    const { options, calls } = loadRoute();
    const response = await options(browserRequest('OPTIONS', input));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assertNoEffects(calls);
  }
});

test('GET autorizado conserva o desafio e seus headers originais sem chamar CRM', async () => {
  const challenge = { token: 'test-proof', difficulty: 3, expiresInSeconds: 600 };
  const { get, calls } = loadRoute({ issueChallenge: () => challenge });
  const input = browserRequest('GET', { headers: { 'x-vercel-forwarded-for': '203.0.113.20' } });
  const response = await get(input);
  assert.equal(response.status, 200);
  assertCors(response);
  assert.deepEqual(await response.json(), challenge);
  assert.equal(calls.challenge[0], input.headers);
  assert.equal(calls.gate.length, 0);
  assert.equal(calls.crm.length, 0);
});

test('origem própria e chamadas sem Origin continuam usando a proteção existente', async () => {
  for (const origin of ['https://www.rook.com.br', null]) {
    const { get, post, calls } = loadRoute();
    assert.equal((await get(browserRequest('GET', { origin }))).status, 200);
    const response = await post(browserPost({}, { origin }));
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('access-control-allow-credentials'), null);
    assert.equal(calls.gate.length, 1);
    assert.equal(calls.crm.length, 1);
  }
});

test('origem pública configurada permanece nativa quando o proxy usa URL interna HTTP', async () => {
  for (const siteOrigin of ['https://www.rook.com.br', 'https://lp-homolog.rooksystem.com.br']) {
    const route = loadRoute({ siteOrigin });
    const internalUrl = 'http://rook-lp:3000/api/acquisition/';
    const response = await route.get(new Request(internalUrl, { headers: { origin: siteOrigin } }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), siteOrigin);
    const preflight = await route.options(new Request(internalUrl, { method: 'OPTIONS', headers: {
      origin: siteOrigin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'Content-Type',
    } }));
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), siteOrigin);
    assert.equal(route.calls.challenge.length, 1);
    assert.equal(route.calls.gate.length, 0);
    assert.equal(route.calls.crm.length, 0);
  }
});

test('headers encaminhados não autorizam outra origem quando a URL usa host interno', async () => {
  const route = loadRoute({ siteOrigin: 'https://lp-homolog.rooksystem.com.br' });
  const response = await route.get(new Request('http://rook-lp:3000/api/acquisition/', { headers: {
    origin: 'https://untrusted.invalid', 'x-forwarded-host': 'untrusted.invalid', 'x-forwarded-proto': 'https',
  } }));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assertNoEffects(route.calls);
});

test('sucesso do cadastro parceiro depende do ledger e CRM e preserva atribuição BeeFood', async () => {
  const { post, calls } = loadRoute();
  const response = await post(browserPost({ usesErp: 'yes', erp: 'other', erpOther: 'BeeFood',
    capturePath: '/', attribution: { utm_source: 'beefood', utm_medium: 'parceria', utm_campaign: 'rook-beefood', landing_path: '/' } }));
  assert.equal(response.status, 201);
  assertCors(response);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(calls.gate.length, 1);
  assert.equal(calls.crm.length, 1);
  assert.equal(calls.crm[0].erpOther, 'BeeFood');
  assert.equal(calls.crm[0].attribution.utm_source, 'beefood');
  assert.equal(calls.crm[0].attribution.utm_campaign, 'rook-beefood');
  assert.equal(calls.network, 0);
});

test('erros de entrada e configuração também ficam legíveis só para a origem autorizada', async () => {
  for (const [input, status] of [
    [browserRequest('POST', { body: 'invalid-json' }), 400],
    [browserRequest('POST', { body: 'x'.repeat(16385) }), 413],
    [browserPost({}, { headers: { 'content-length': '16385' } }), 413],
    [browserPost({ email: 'invalid' }), 422],
  ]) {
    const { post, calls } = loadRoute();
    const response = await post(input);
    assert.equal(response.status, status);
    assertCors(response);
    assertNoEffects(calls);
  }
  for (const handler of ['get', 'post']) {
    const route = loadRoute({ env: { ASAFLOW_ACQUISITION_ENABLED: 'false' } });
    const response = await route[handler](handler === 'get' ? browserRequest('GET') : browserPost());
    assert.equal(response.status, 503);
    assertCors(response);
    assertNoEffects(route.calls);
  }
  const { get, calls } = loadRoute({ issueChallenge: () => { throw new Error('unavailable'); } });
  const unavailable = await get(browserRequest('GET'));
  assert.equal(unavailable.status, 503);
  assertCors(unavailable);
  assert.equal(calls.crm.length, 0);
});

test('replay, limite e desafio inválido preservam CORS sem liberar o CRM', async () => {
  for (const [gate, status] of [
    [async () => ({ allowed: false, reason: 'nonce_replayed' }), 400],
    [async () => ({ allowed: false, reason: 'ip_rate_limited', retryAfterSeconds: 120 }), 429],
    [async () => { throw new CommercialLeadAbuseProtectionError('invalid_challenge'); }, 400],
  ]) {
    const { post, calls } = loadRoute({ gate });
    const response = await post(browserPost());
    assert.equal(response.status, status);
    assertCors(response);
    if (status === 429) assert.equal(response.headers.get('retry-after'), '120');
    assert.equal(calls.clients, 0);
    assert.equal(calls.crm.length, 0);
  }
});

test('conflito, espera e reconciliação nunca viram sucesso do formulário parceiro', async () => {
  for (const [error, status] of [
    [new ledger.AcquisitionPersistenceError('conflict'), 409],
    [new ledger.AcquisitionPersistenceError('busy', 42), 503],
    [new ledger.AcquisitionPersistenceError('needs_reconciliation'), 503],
    [new Error('transport-unavailable'), 503],
  ]) {
    const { post } = loadRoute({ create: async () => { throw error; } });
    const response = await post(browserPost());
    assert.equal(response.status, status);
    assertCors(response);
    assert.notEqual((await response.json()).success, true);
    if (error.code === 'busy') assert.equal(response.headers.get('retry-after'), '42');
  }
});

test('CORS conserva o vínculo real entre IP, desafio, prova no navegador e consumo único', async () => {
  const consumed = new Set();
  const protection = createCommercialLeadAbuseProtection({
    secret: 'test-only-secret-longer-than-thirty-two-bytes',
    adminRequest: async (_path, { body }) => {
      const { p_nonce_hash } = JSON.parse(body);
      if (consumed.has(p_nonce_hash)) return [{ allowed: false, reason: 'nonce_replayed', retry_after_seconds: 0 }];
      consumed.add(p_nonce_hash);
      return [{ allowed: true, reason: 'allowed', retry_after_seconds: 0 }];
    },
  });
  const route = loadRoute({ issueChallenge: protection.issueChallenge,
    gate: (proof, headers, value) => protection.consumeAbuseGate(headers, value, proof) });
  const ip = '203.0.113.20';
  const challengeResponse = await route.get(browserRequest('GET', { headers: { 'x-vercel-forwarded-for': ip } }));
  assertCors(challengeResponse);
  const challenge = await challengeResponse.json();
  const solution = await solveCommercialLeadChallenge(challenge);
  const submit = address => browserRequest('POST', { headers: { 'content-type': 'application/json', 'x-vercel-forwarded-for': address },
    body: JSON.stringify({ ...lead, antiBot: { token: challenge.token, solution } }) });
  assert.equal((await route.post(submit('203.0.113.21'))).status, 400);
  assert.equal(route.calls.clients, 0);
  assert.equal(consumed.size, 0);
  assert.equal((await route.post(submit(ip))).status, 201);
  assert.equal((await route.post(submit(ip))).status, 400);
  assert.equal(route.calls.crm.length, 1);
  assert.equal(consumed.size, 1);
  assert.equal(route.calls.network, 0);
});
