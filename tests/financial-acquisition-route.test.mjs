import test from 'node:test';
import assert from 'node:assert/strict';
import { CommercialLeadAbuseProtectionError } from '../src/lib/commercial-lead-abuse-protection.mjs';
import { financialInput, financialLead, financialRequest, loadFinancialRoute } from './helpers/financial-acquisition-route.mjs';

const noInternal = body => assert.doesNotMatch(JSON.stringify(body), /private-|contactId|dealId|pipelineId|stageId|assumptions|formulaVersion|taxModelVersion|referencePercent|monthlyDifference|Parâmetros internos/);

test('GET emite desafio e depende da mesma configuração distribuída da captação', async () => {
  const request = new Request('http://localhost/api/financial-simulations/');
  const { get, calls } = loadFinancialRoute();
  const response = await get(request);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).token, 'challenge-token');
  assert.equal(calls.challenge.length, 1);
  assert.equal(calls.clients.length, 0);
  for (const options of [
    { enabled: false }, { abuseConfigured: false }, { env: { ASAFLOW_ACQUISITION_API_KEY: '' } },
    { env: { ASAFLOW_ACQUISITION_PIPELINE_ID: '' } }, { env: { ASAFLOW_ACQUISITION_STAGE_ID: '' } },
    { challenge: () => { throw new Error('private-error'); } },
  ]) {
    const route = loadFinancialRoute(options);
    assert.equal((await route.get(request)).status, 503);
    if (!options.challenge) assert.equal((await route.post(financialRequest())).status, 503);
    assert.equal(route.calls.crm.length, 0);
  }
});

test('somente números não liberam projeção; campos inválidos não consomem proteção nem gravam no CRM', async () => {
  for (const candidate of [financialInput, null, [], { ...financialLead, name: '' },
    { ...financialLead, email: '' }, { ...financialLead, phone: '123' },
    { ...financialLead, simulation: null }, { ...financialLead, simulation: { ...financialInput, cmvAmount: undefined } },
    { ...financialLead, simulation: { ...financialInput, revenue: -1 } },
    { ...financialLead, commercialContactRequested: 'true' },
  ]) {
    const route = loadFinancialRoute();
    const response = await route.post(new Request('http://localhost/api/financial-simulations/', {
      method: 'POST', body: JSON.stringify(candidate),
    }));
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.ok(Object.keys(body.fieldErrors).length > 0);
    assert.equal(Object.hasOwn(body, 'simulation'), false);
    assert.equal(Object.hasOwn(body, 'result'), false);
    assert.equal(route.calls.gate.length, 0);
    assert.equal(route.calls.crm.length, 0);
    noInternal(body);
  }
});

test('resultado público aguarda confirmação no CRM e a intenção comercial padrão é falsa', async () => {
  let confirm;
  let entered;
  const created = new Promise(resolve => { entered = resolve; });
  const route = loadFinancialRoute({ create: async () => {
    entered();
    await new Promise(resolve => { confirm = resolve; });
    return { contactId: 'private-contact', dealId: 'private-deal' };
  } });
  let responded = false;
  const pending = route.post(financialRequest()).then(response => { responded = true; return response; });
  await created;
  assert.equal(responded, false);
  assert.equal(route.calls.crm.length, 1);
  assert.equal(route.calls.crm[0].commercialContactRequested, false);
  assert.equal(route.calls.crm[0].demonstrationRequested, false);
  assert.equal(route.calls.crm[0].captureKind, 'financial_tool');
  assert.equal(route.calls.gate[0].value.cnpj, '+5511999999999');
  assert.equal(route.calls.gate[0].value.company, null);
  confirm();
  const response = await pending;
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ['success', 'simulation']);
  assert.equal(body.success, true);
  assert.equal(body.simulation.ok, true);
  assert.equal(body.simulation.result.estimatedNetRevenue, 91175);
  noInternal(body);
  assert.equal(route.calls.network, 0);
});

test('falha ou rejeição de proteção nunca retorna cálculo nem cria cliente CRM', async () => {
  for (const [gate, status, retry] of [
    [async () => ({ allowed: false, reason: 'nonce_replayed', retryAfterSeconds: 0 }), 400, null],
    [async () => ({ allowed: false, reason: 'ip_rate_limited', retryAfterSeconds: 90 }), 429, '90'],
    [async () => ({ allowed: false, reason: 'identity_rate_limited', retryAfterSeconds: 120 }), 429, '120'],
    [async () => { throw new CommercialLeadAbuseProtectionError('invalid_challenge'); }, 400, null],
    [async () => { throw new Error('private-protection-error'); }, 503, null],
  ]) {
    const route = loadFinancialRoute({ gate });
    const response = await route.post(financialRequest());
    assert.equal(response.status, status);
    assert.equal(response.headers.get('retry-after'), retry);
    assert.equal(route.calls.clients.length, 0);
    const body = await response.json();
    assert.equal(Object.hasOwn(body, 'simulation'), false);
    noInternal(body);
  }
});

test('falha CRM exige prova nova e mantém submissionId ao repetir a solicitação', async () => {
  const used = new Set();
  let attempts = 0;
  const route = loadFinancialRoute({
    gate: async proof => {
      if (used.has(proof.token)) return { allowed: false, reason: 'nonce_replayed', retryAfterSeconds: 0 };
      used.add(proof.token);
      return { allowed: true, reason: 'allowed', retryAfterSeconds: 0 };
    },
    create: async () => { if (++attempts === 1) throw new Error('private-crm-error'); },
  });
  const first = await route.post(financialRequest());
  assert.equal(first.status, 503);
  const failure = await first.json();
  assert.equal(Object.hasOwn(failure, 'simulation'), false);
  noInternal(failure);
  assert.equal((await route.post(financialRequest())).status, 400);
  assert.equal(route.calls.crm.length, 1);
  assert.equal((await route.post(financialRequest({ antiBot: { token: 'new-proof', solution: '0' } }))).status, 201);
  assert.equal(route.calls.crm.length, 2);
  assert.equal(route.calls.crm[0].submissionId, financialLead.submissionId);
  assert.deepEqual(route.calls.crm[0], route.calls.crm[1]);
});

test('reenvio após escrita parcial ou resposta perdida não duplica contato nem negócio', async () => {
  for (const failAt of ['contact', 'deal']) {
    const persisted = new Map();
    const requests = [];
    let lost = true;
    const route = loadFinancialRoute({ fetchImpl: async (url, options) => {
      requests.push({ url, ...options });
      if (options.method === 'GET') return { ok: true, json: async () => ({ data: [], nextCursor: null }) };
      const kind = url.endsWith('/contacts') ? 'contact' : 'deal';
      const key = options.headers['Idempotency-Key'];
      if (!persisted.has(key)) persisted.set(key, { id: `private-${kind}`, body: options.body });
      assert.equal(persisted.get(key).body, options.body);
      if (lost && kind === failAt) { lost = false; throw new Error('Resposta perdida após persistir'); }
      return { ok: true, json: async () => ({ id: persisted.get(key).id }) };
    } });
    const first = await route.post(financialRequest());
    assert.equal(first.status, 503, failAt);
    assert.equal(Object.hasOwn(await first.json(), 'simulation'), false);
    const second = await route.post(financialRequest({ antiBot: { token: 'new-proof', solution: '0' } }));
    assert.equal(second.status, 201, failAt);
    noInternal(await second.json());
    assert.equal(persisted.size, 2);
    assert.ok(persisted.has(`rook-acquisition-${financialLead.submissionId}`));
    assert.equal(requests.some(call => call.method === 'PATCH'), false);
  }
});

test('atribuição é normalizada, contato existente é preservado e projeção não expõe a resposta do CRM', async () => {
  const requests = [];
  const route = loadFinancialRoute({ fetchImpl: async (url, options) => {
    requests.push({ url, ...options });
    return { ok: true, json: async () => options.method === 'GET' ? {
      data: [{ id: 'private-existing', email: ' TESTE@EXAMPLE.INVALID ', phone: '(11) 99999-9999' }], nextCursor: null,
    } : { id: 'private-deal' } };
  } });
  const response = await route.post(financialRequest({ commercialContactRequested: true, attribution: {
    source: 'meta_native_form', utm_source: 'facebookads', utm_medium: 'paid_social',
    utm_campaign: '[ES] - CMV', landing_path: '/calculadora-cmv/',
    email: 'private-email', fbclid: 'private-fbclid', utm_content: 'teste@example.invalid',
  } }));
  assert.equal(response.status, 201);
  noInternal(await response.json());
  assert.deepEqual(requests.map(call => call.method), ['GET', 'POST']);
  assert.ok(requests[1].url.endsWith('/deals'));
  const deal = JSON.parse(requests[1].body);
  assert.equal(deal.name, 'CMV — Pessoa Teste');
  assert.deepEqual(deal.contactIds, ['private-existing']);
  assert.equal(deal.properties.origem, 'Tráfego pago');
  assert.equal(deal.properties.utm_campaign, '[ES] - CMV');
  assert.equal(deal.properties.landing_page, '/calculadora-cmv');
  assert.match(deal.description, /Contato comercial solicitado: sim/);
  assert.match(deal.description, /Demonstração solicitada: não/);
  assert.doesNotMatch(deal.description, /private-email|private-fbclid|meta_native_form|ERP\/PDV|Não utiliza|Estabelecimento:|Cidade\/UF:/);
  assert.equal(Object.hasOwn(deal.properties, 'empresa_cliente'), false);
});

test('JSON e corpo fora do limite são recusados antes dos efeitos', async () => {
  for (const [body, headers, status] of [
    ['{', {}, 400], [' '.repeat(16385), {}, 413], ['{}', { 'content-length': '16385' }, 413],
  ]) {
    const route = loadFinancialRoute();
    const response = await route.post(new Request('http://localhost/api/financial-simulations/', { method: 'POST', headers, body }));
    assert.equal(response.status, status);
    assert.equal(route.calls.gate.length, 0);
    assert.equal(route.calls.crm.length, 0);
  }
});

test('timeout e confirmação inválida do provedor retornam 503 sem resultado público', async () => {
  for (const failure of ['timeout', 'invalid-contact', 'invalid-deal', 'http-error']) {
    const requests = [];
    const route = loadFinancialRoute({ fetchImpl: async (url, options) => {
      requests.push({ url, ...options });
      assert.ok(options.signal instanceof AbortSignal);
      if (options.method === 'GET') return { ok: true, json: async () => ({ data: [], nextCursor: null }) };
      if (failure === 'timeout') throw new DOMException('private-provider-timeout', 'TimeoutError');
      if (failure === 'http-error') return { ok: false, status: 503 };
      return { ok: true, json: async () => ({ id:
        (failure === 'invalid-contact' && url.endsWith('/contacts')) || (failure === 'invalid-deal' && url.endsWith('/deals'))
          ? '' : 'private-confirmed',
      }) };
    } });
    const response = await route.post(financialRequest());
    assert.equal(response.status, 503, failure);
    const body = await response.json();
    assert.equal(Object.hasOwn(body, 'simulation'), false);
    noInternal(body);
    assert.equal(requests.length, failure === 'invalid-deal' ? 3 : 2);
  }
});

test('coincidência isolada de e-mail ou telefone não reutiliza contato de outra identidade', async () => {
  const requests = [];
  const route = loadFinancialRoute({ fetchImpl: async (url, options) => {
    requests.push({ url, ...options });
    return { ok: true, json: async () => options.method === 'GET' ? { data: [
      { id: 'private-email-only', email: financialLead.email, phone: '+5521999999999' },
      { id: 'private-phone-only', email: 'outra@example.invalid', phone: '+5511999999999' },
    ], nextCursor: null } : { id: url.endsWith('/contacts') ? 'private-new-contact' : 'private-deal' } };
  } });
  const response = await route.post(financialRequest());
  assert.equal(response.status, 201);
  assert.deepEqual(requests.map(call => call.method), ['GET', 'POST', 'POST']);
  assert.ok(requests[1].url.endsWith('/contacts'));
  assert.deepEqual(JSON.parse(requests[2].body).contactIds, ['private-new-contact']);
  noInternal(await response.json());
});
