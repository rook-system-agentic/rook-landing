import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { handleFinancialChatToolRequest as handle, MAX_FINANCIAL_CHAT_BODY_BYTES as limit } from '../src/lib/financial-chat-http.mjs';
import { executeFinancialChatTool, FINANCIAL_CHAT_TOOLS } from '../src/lib/financial-chat-tools.mjs';

const cmv = { period: '2026-08', currency: 'BRL', revenueBasis: 'net', revenue: 100000, cmvPercent: 38, segment: 'a_la_carte', confirmed: true };
const pe = { period: '2026-08', currency: 'BRL', revenueBasis: 'gross', revenue: 150000, cmvPercent: 35, fixedCosts: 60000, taxPercent: 8, feesPercent: 2, otherVariablePercent: 5, confirmed: true };
const makeRequest = (body, headers = {}) => new Request('http://localhost/api/ai/tools/analisar-cmv', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body,
});
const request = (value, headers) => makeRequest(JSON.stringify(value), headers);
const streamRequest = (stream, headers = {}) => new Request('http://localhost/api/ai/tools/analisar-cmv', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: stream, duplex: 'half',
});

test('cada ferramenta mantém a resposta do adaptador e nunca permite cache do cenário', async () => {
  for (const [tool, scenario] of [['analisar_cmv', cmv], ['estimar_ponto_equilibrio', pe]]) {
    const response = await handle(request(scenario, { 'content-type': 'Application/JSON; charset=utf-8' }), tool);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('content-type'), /^application\/json/);
    assert.deepEqual(await response.json(), executeFinancialChatTool(tool, scenario));
  }
});

test('dados parciais e confirmação ausente voltam à conversa sem emitir cálculo', async () => {
  for (const scenario of [{ revenue: 100000 }, { ...cmv, confirmed: false }]) {
    const response = await handle(request(scenario), 'analisar_cmv');
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.deepEqual(result, executeFinancialChatTool('analisar_cmv', scenario));
    assert.equal(Object.hasOwn(result, 'result'), false);
  }
});

test('erros do cenário usam 422 e não refletem dados extras nem o conteúdo informado', async () => {
  const secret = 'contato-privado@example.invalid';
  for (const scenario of [null, [], { ...cmv, email: secret }, { ...cmv, revenue: secret }]) {
    const response = await handle(request(scenario), 'analisar_cmv');
    assert.equal(response.status, 422);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.text();
    assert.equal(JSON.parse(body).status, 'invalid_input');
    assert.equal(body.includes(secret), false);
  }
});

test('JSON inválido, corpo vazio e UTF-8 inválido são 400 sem eco do corpo', async () => {
  for (const body of ['{ "email": "privado@example.invalid",', '', new Uint8Array([0x7b, 0xc3, 0x28, 0x7d])]) {
    const response = await handle(makeRequest(body), 'analisar_cmv');
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.text()).includes('privado@example.invalid'), false);
  }
});

test('tipo de conteúdo incorreto ou ausente é rejeitado antes da leitura', async () => {
  for (const contentType of ['text/plain', 'application/jsonp', 'application/problem+json', '']) {
    const response = await handle(request(cmv, { 'content-type': contentType }), 'analisar_cmv');
    assert.equal(response.status, 415);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('métodos fora de POST recebem 405 com Allow', async () => {
  const response = await handle(new Request('http://localhost', { method: 'GET' }), 'analisar_cmv');
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('limite de 4 KiB conta bytes reais, aceita o limite e rejeita o byte seguinte', async () => {
  const body = JSON.stringify(cmv);
  const padded = body + ' '.repeat(limit - Buffer.byteLength(body));
  assert.equal((await handle(makeRequest(padded), 'analisar_cmv')).status, 200);
  assert.equal((await handle(makeRequest(padded + ' ', { 'content-length': '1' }), 'analisar_cmv')).status, 413);
  // Caracteres multibyte abaixo de 4.096 caracteres também excedem o limite.
  const multibyte = JSON.stringify({ extra: 'é'.repeat(2500) });
  assert.ok(multibyte.length < limit);
  assert.equal((await handle(makeRequest(multibyte), 'analisar_cmv')).status, 413);
  assert.equal((await handle(request(cmv, { 'content-length': String(limit + 1) }), 'analisar_cmv')).status, 413);
});

test('stream sem tamanho declarado é interrompido assim que ultrapassa 4 KiB', async () => {
  let pulled = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { pulled += 1; controller.enqueue(new Uint8Array(1024).fill(32)); },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const response = await handle(streamRequest(stream), 'analisar_cmv');
  assert.equal(response.status, 413);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(pulled, 5);
  assert.equal(cancelled, true);
});

test('JSON UTF-8 pode atravessar vários chunks sem alterar seu conteúdo', async () => {
  const bytes = new TextEncoder().encode(JSON.stringify(cmv));
  let offset = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (offset === bytes.length) return controller.close();
      controller.enqueue(bytes.slice(offset, offset + 1));
      offset += 1;
    },
  });
  const response = await handle(streamRequest(stream), 'analisar_cmv');
  assert.deepEqual(await response.json(), executeFinancialChatTool('analisar_cmv', cmv));
});

test('falha na leitura retorna erro fixo e não revela mensagem interna', async () => {
  const stream = new ReadableStream({ pull(controller) { controller.error(new Error('privado@example.invalid')); } });
  const response = await handle(streamRequest(stream), 'analisar_cmv');
  assert.equal(response.status, 400);
  assert.equal((await response.text()).includes('privado@example.invalid'), false);
});

test('OpenAPI mantém descritores oficiais e declara somente origem relativa', async () => {
  const document = JSON.parse(await readFile(new URL('../docs/rook-ai-financial-tools.openapi.json', import.meta.url), 'utf8'));
  assert.deepEqual(document.servers, [{ url: '/', description: 'Origem do ambiente em que estas rotas estiverem publicadas; o arquivo não comprova publicação.' }]);
  for (const tool of FINANCIAL_CHAT_TOOLS) {
    assert.deepEqual(document.components.schemas[`${tool.name}_confirmed`], tool.inputSchema);
  }
  assert.deepEqual(Object.keys(document.paths), ['/api/ai/tools/analisar-cmv/', '/api/ai/tools/estimar-ponto-equilibrio/']);
  for (const entry of Object.values(document.paths)) {
    assert.deepEqual(Object.keys(entry.post.responses).sort(), ['200', '400', '413', '415', '422']);
  }
});
