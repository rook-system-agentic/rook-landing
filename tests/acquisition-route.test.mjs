import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateAcquisition } from '../src/lib/acquisition.mjs';
import { CommercialLeadAbuseProtectionError } from '../src/lib/commercial-lead-abuse-protection.mjs';

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
const request = token => new Request('http://localhost/api/acquisition/', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ...lead, antiBot: { token, solution: '0' } }),
});
function loadRoute({ gate, create = async () => {} }) {
  const calls = { gate: [], clients: 0, crm: [], network: 0 };
  const dependencies = {
    'next/server': { NextResponse: Response },
    '@/data/municipalities.json': cities,
    '@/lib/acquisition.mjs': { validateAcquisition },
    '@/lib/asaflow-acquisition.mjs': {
      createAsaflowAcquisition: () => {
        calls.clients++;
        return { create: async value => { calls.crm.push(value); return create(value); } };
      },
    },
    '@/lib/commercial-lead-abuse': {
      CommercialLeadAbuseProtectionError,
      isCommercialLeadAbuseProtectionConfigured: () => true,
      issueCommercialLeadChallenge: () => { throw new Error('Unexpected challenge creation'); },
      consumeCommercialLeadAbuseGate: async (headers, value, proof) => {
        calls.gate.push({ value, proof });
        return gate(proof);
      },
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Buffer,
    console: { error() {} },
    process: { env: {
      ASAFLOW_ACQUISITION_ENABLED: 'true', ASAFLOW_ACQUISITION_API_KEY: 'test-only',
      ASAFLOW_ACQUISITION_PIPELINE_ID: 'test-pipeline', ASAFLOW_ACQUISITION_STAGE_ID: 'test-stage',
    } },
    fetch: () => { calls.network++; throw new Error('External requests forbidden'); },
    require: name => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: 'api/acquisition/route.cjs' });
  return { post: module.exports.POST, calls };
}

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
