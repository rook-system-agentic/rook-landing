import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ATTRIBUTION_PREFIX, captureLeadAttribution, createVisitAttributionCapture, normalizeLeadAttribution, appendLeadAttribution } from '../src/lib/lead-attribution.mjs';
import { validateAcquisition } from '../src/lib/acquisition.mjs';
import { buildLeadDescription } from '../src/lib/asaflow-acquisition.mjs';

const valid = {
  submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste',
  email: 'teste@example.invalid', phone: '11999999999', cityId: '3550308', segment: 'pizzaria',
  revenueBand: '100k_to_200k', usesErp: 'no', consent: true,
};
const cities = [{ id: '3550308', name: 'São Paulo', uf: 'SP' }];

test('contrato de produção e consumo ADM compartilha os mesmos exemplos canônicos', () => {
  const cases = JSON.parse(readFileSync(new URL('./fixtures/site-attribution-contract.json', import.meta.url), 'utf8'));
  for (const item of cases) assert.deepEqual(normalizeLeadAttribution(item.candidate), item.normalized, item.name);
});

test('captura cinco UTMs, caminho conhecido e somente hostname do referrer', () => {
  const result = captureLeadAttribution({
    href: 'https://rook.com.br/calculadora-cmv/?utm_source=meta&utm_medium=paid_social&utm_campaign=Conversão%202026&utm_term=cmv&utm_content=video-a&fbclid=privado&token=segredo#cadastro',
    referrer: 'https://WWW.FACEBOOK.COM:443/caminho-pessoal?email=pessoa@example.invalid#privado',
  });
  assert.deepEqual(result, { version: 1, source: 'site_form', utm_source: 'meta', utm_medium: 'paid_social',
    utm_campaign: 'Conversão 2026', utm_term: 'cmv', utm_content: 'video-a',
    landing_path: '/calculadora-cmv', referrer_host: 'www.facebook.com' });
  assert.doesNotMatch(JSON.stringify(result), /fbclid|token|privado|example.invalid|:443|#|\?/);
});

test('primeira visita permanece em memória ao navegar e nova visita tem captura própria', () => {
  const capture = createVisitAttributionCapture();
  const first = capture({ href: 'https://rook.com.br/?utm_campaign=primeira', referrer: '' });
  assert.equal(capture({ href: 'https://rook.com.br/diagnostico/?utm_campaign=outra' }), first);
  assert.equal(first.utm_campaign, 'primeira');
  assert.ok(Object.isFrozen(first));
  assert.deepEqual(createVisitAttributionCapture()({ href: 'https://rook.com.br/diagnostico/' }),
    { version: 1, source: 'site_form', landing_path: '/diagnostico' });
});

test('UTM repetida é ambígua; ausência não inventa atribuição paga', () => {
  assert.deepEqual(captureLeadAttribution({ href: 'https://rook.com.br/?utm_source=meta&utm_source=google&utm_medium=cpc' }),
    { version: 1, source: 'site_form', utm_medium: 'cpc', landing_path: '/', omitted_fields: ['utm_source'] });
  assert.deepEqual(captureLeadAttribution({ href: 'https://rook.com.br/' }),
    { version: 1, source: 'site_form', landing_path: '/' });
});

test('normalização aplica limites e descarta campos extras, dados pessoais aparentes e controles', () => {
  const invalid = ['teste@example.invalid', '+55 (11) 99999-9999', '11/99999-9999', '11999999999', '123.456.789-01',
    '12.345.678-0001-90', 'email-pessoa', 'access_token-segredo', 'https://example.invalid',
    '/perfil/nome', 'www.example.invalid', 'example.invalid/perfil',
    'a'.repeat(201), '<b>campanha</b>', 'campanha\nforjada', 'cam\u200bpanha', 'nome%40example.invalid',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature', 'b'.repeat(40),
    'bb189bc0-1c1d-4cca-8400-44acb47fbda8', 1, null, [], {}];
  for (const utm_campaign of invalid) assert.deepEqual(normalizeLeadAttribution({ utm_campaign }),
    { version: 1, source: 'site_form', omitted_fields: ['utm_campaign'] }, String(utm_campaign));
  const result = normalizeLeadAttribution({ version: 99, source: 'meta_native_form', utm_source: ' Ｍｅｔａ ',
    email: 'teste@example.invalid', phone: '11999999999', fbclid: 'private', form_id: 'native', leadgen_id: 'native' });
  assert.deepEqual(result, { version: 1, source: 'site_form', utm_source: 'Meta' });
  const label = '[ROOK] | Leads Setembro + Gestão (2026)';
  assert.equal(normalizeLeadAttribution({ utm_campaign: label }).utm_campaign, label);
  const campaign = '[ES] - LEADS ROOK LP 21/09';
  assert.equal(normalizeLeadAttribution({ utm_campaign: campaign }).utm_campaign, campaign);
  for (const value of [null, undefined, [], true, 'texto']) assert.equal(normalizeLeadAttribution(value), null);
});

test('rejeita caminhos não conhecidos e referrers com credenciais, IP ou dados adicionais', () => {
  for (const landing_path of ['/pessoa@example.invalid', '/blog/nome-de-pessoa', '/?email=x', '/#cadastro',
    '//evil.invalid', '/diagnostico/extra', '/diagnostico\n', 'https://rook.com.br/']) {
    assert.deepEqual(normalizeLeadAttribution({ landing_path }),
      { version: 1, source: 'site_form', omitted_fields: ['landing_path'] });
  }
  for (const referrer_host of ['localhost', '127.0.0.1', '[::1]', 'www.google.com/path', 'www.google.com?x',
    'https://google.com', 'google.com:443', 'pessoa@google.com', 'a'.repeat(64)+'.com', 'google.com\n']) {
    assert.equal(normalizeLeadAttribution({ referrer_host }).referrer_host, undefined);
  }
  for (const referrer of ['https://user:password@google.com/', 'javascript:alert(1)', 'invalido']) {
    assert.deepEqual(captureLeadAttribution({ href: 'https://rook.com.br/', referrer }),
      { version: 1, source: 'site_form', landing_path: '/', omitted_fields: ['referrer_host'] });
  }
  assert.equal(captureLeadAttribution({ href: 'file:///tmp/private' }), null);
});

test('omissões têm somente nomes canônicos e normalização é idempotente', () => {
  const result = normalizeLeadAttribution({ omitted_fields: ['email', 'referrer_host', 'utm_source', 'utm_source'], utm_source: 'meta' });
  assert.deepEqual(result, { version: 1, source: 'site_form', utm_source: 'meta', omitted_fields: ['referrer_host'] });
  assert.deepEqual(normalizeLeadAttribution(result), result);
});

test('200 caracteres de rótulo são aceitos e o JSON canônico permanece dentro de 1800', () => {
  const label = `${'campanha-'.repeat(22)}natal-2026-teste-completo`.slice(0, 200);
  const result = normalizeLeadAttribution(Object.fromEntries([
    ...['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].map(key => [key, label]),
    ['landing_path', '/funcionalidades'], ['referrer_host', `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`],
  ]));
  assert.equal(result.utm_campaign.length, 200);
  assert.ok(JSON.stringify(result).length <= 1800);
});

test('atribuição validada entra antes da primeira linha vazia sem mudar diagnóstico', () => {
  const parsed = validateAcquisition({ ...valid, attribution: { utm_source: 'meta', unknown: 'não transportar' },
    intent: 'cmv', period: '2026-09', simulation: { tool: 'cmv', revenueBasis: 'net', revenue: 100000, cmvPercent: 38, segment: 'pizzaria' } }, cities);
  assert.equal(parsed.ok, true);
  const base = buildLeadDescription({ ...parsed.value, attribution: null });
  const description = buildLeadDescription(parsed.value);
  const line = `${ATTRIBUTION_PREFIX}{"version":1,"source":"site_form","utm_source":"meta"}`;
  assert.ok(description.indexOf(line) < description.indexOf('\n\n'));
  assert.equal(description.replace(`\n${line}`, ''), base);
  assert.equal(description.split('\n\n')[1], base.split('\n\n')[1]);
});

test('atribuição inválida não invalida o cadastro nem interrompe o diagnóstico', () => {
  for (const attribution of [null, [], 'malformado', { utm_source: '<script>', landing_path: '/private/123' }]) {
    const parsed = validateAcquisition({ ...valid, attribution, intent: 'breakeven', revenue: '100000', fixedCosts: '20000' }, cities);
    assert.equal(parsed.ok, true);
    assert.match(buildLeadDescription(parsed.value), /Diagnóstico interrompido/);
  }
});

test('quebras de linha nos dados do cadastro não forjam cabeçalhos de atribuição', () => {
  const parsed = validateAcquisition({ ...valid,
    company: `Casa\n\n${ATTRIBUTION_PREFIX}{"version":1,"source":"site_form","utm_source":"forjada"}`,
    attribution: { utm_source: 'meta' } }, cities);
  assert.equal(parsed.ok, true);
  const headers = buildLeadDescription(parsed.value).split('\n').filter(line => line.startsWith(ATTRIBUTION_PREFIX));
  assert.deepEqual(headers, [`${ATTRIBUTION_PREFIX}{"version":1,"source":"site_form","utm_source":"meta"}`]);
});

test('se não couber nos 5000 caracteres, omite a linha inteira e preserva o relatório', () => {
  const base = `Cabeçalho\n\n${'diagnóstico '.repeat(450)}`.slice(0, 4999);
  assert.equal(appendLeadAttribution(base, { utm_source: 'meta' }), base);
  const line = `${ATTRIBUTION_PREFIX}{"version":1,"source":"site_form"}`;
  const boundary = 'a'.repeat(5000-line.length-1);
  assert.equal(appendLeadAttribution(boundary, {}).length, 5000);
  assert.equal(appendLeadAttribution(`${boundary}a`, {}), `${boundary}a`);
});

test('perfil no limite e cada diagnóstico real cabem sem truncamento no relatório', () => {
  const attribution = Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].map(field => [field, 'campanha-'.repeat(25)]));
  const inputs = [
    { tool: 'cmv', revenueBasis: 'net', revenue: 1_000_000_000, cmvPercent: 100, segment: 'other' },
    { tool: 'breakeven', revenueBasis: 'gross', revenue: 1_000_000_000, cmvPercent: 99.99, fixedCosts: 1_000_000_000, taxPercent: 0, feesPercent: 0, otherVariablePercent: 0 },
  ];
  for (const simulation of inputs) {
    const parsed = validateAcquisition({ ...valid, name: 'n'.repeat(120), company: 'e'.repeat(160),
      email: `${'a'.repeat(240)}@example.com`, segment: 'other', segmentOther: 's'.repeat(100),
      usesErp: 'yes', erp: 'other', erpOther: 'e'.repeat(100), intent: simulation.tool,
      period: '2026-09', simulation, attribution }, cities);
    assert.equal(parsed.ok, true);
    const description = buildLeadDescription(parsed.value);
    assert.ok(description.length <= 5000);
    for (const assumption of parsed.value.simulation.assumptions) assert.ok(description.includes(assumption));
    assert.ok(description.includes(parsed.value.simulation.summary));
  }
});
