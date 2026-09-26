import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as acquisition from '../src/lib/acquisition-input.mjs';
import * as segments from '../src/lib/culinary-segments.mjs';
import * as options from '../src/lib/cmv-input-options.mjs';
import * as diagnostic from '../src/lib/diagnostic-context.mjs';
import * as reference from '../src/lib/financial-reference.mjs';
import * as numbers from '../src/lib/financial-number-input.mjs';
import * as validation from '../src/lib/financial-input.mjs';
import * as attribution from '../src/lib/lead-attribution.mjs';
import * as trackingEvents from '../src/lib/tracking-events.mjs';
import { defaultConsentState } from '../src/lib/consent.mjs';
import { calculateFinancialSimulation } from '../src/lib/financial-simulation.mjs';
import { toPublicFinancialSimulation } from '../src/lib/public-financial-simulation.mjs';

const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const code = compile('../src/components/acquisition/FinancialTool.tsx');
const trackCode = compile('../src/lib/track.ts');
const trackingCode = compile('../src/lib/tracking.ts');
const profile = { name: 'Pessoa Teste', phone: '(11) 99999-9999', email: 'teste@example.invalid' };
const textOf = node => !node ? '' : typeof node === 'string' || typeof node === 'number' ? String(node)
  : Array.isArray(node) ? node.map(textOf).join(' ') : textOf(node.props?.children);

// Os handlers e a porta de analytics são reais. Só hooks, elementos e transporte
// são substituídos; este teste não faz conexão de rede nem cria contato no CRM.
function setup({ tool = 'cmv', outcomes = [], challengeError = false, environment = 'production',
  href = 'https://rook.com.br/calculadora-cmv/?utm_source=meta' } = {}) {
  const states = [], refs = [], effects = [], callbacks = [], pending = [], calls = [], events = [];
  const target = { dataLayer: [], consent: defaultConsentState() };
  let stateIndex, refIndex, effectIndex, callbackIndex, tree, uuid = 0, nonce = 0;
  const changed = (old, next) => !old || next.some((item, i) => !Object.is(item, old[i]));
  const react = {
    Fragment: 'fragment', useId: () => 'financial',
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], update => { states[index] = typeof update === 'function' ? update(states[index]) : update; }];
    },
    useRef(initial) { const index = refIndex++; return refs[index] ??= { current: initial }; },
    useCallback(fn, deps) {
      const index = callbackIndex++;
      if (changed(callbacks[index]?.deps, deps)) callbacks[index] = { deps, fn };
      return callbacks[index].fn;
    },
    useEffect(fn, deps) {
      const index = effectIndex++;
      if (changed(effects[index]?.deps, deps)) pending.push(() => {
        effects[index]?.cleanup?.(); effects[index] = { deps, cleanup: fn() };
      });
    },
  };
  const globals = { process: { env: { NODE_ENV: 'production', NEXT_PUBLIC_ENV: environment } }, console };
  function evaluate(source, dependencies, extra = {}) {
    const module = { exports: {} };
    vm.runInNewContext(source, { module, exports: module.exports, ...globals, ...extra,
      require(name) { assert.ok(name in dependencies, `Dependência inesperada: ${name}`); return dependencies[name]; },
    });
    return module.exports;
  }
  const tracking = evaluate(trackingCode, {});
  const track = evaluate(trackCode, { './tracking': tracking, './tracking-events.mjs': { ...trackingEvents,
    pushTrackingEvent: (name, payload, opts) => trackingEvents.pushTrackingEvent(name, payload, { ...opts, target }),
  } });
  const NumericFormat = () => null;
  const dependencies = {
    react, 'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-number-format': { NumericFormat, PatternFormat: () => null }, '@/lib/acquisition-input.mjs': acquisition,
    '@/lib/culinary-segments.mjs': segments, '@/lib/cmv-input-options.mjs': options,
    '@/lib/diagnostic-context.mjs': diagnostic, '@/lib/financial-reference.mjs': reference,
    '@/lib/financial-number-input.mjs': numbers, '@/lib/financial-input.mjs': validation,
    '@/lib/lead-attribution.mjs': attribution, '@/lib/track': track, './financial-tool.module.css': {},
    '@/lib/lead-attribution-client': { captureVisitAttribution: attribution.createVisitAttributionCapture() },
    './PreviewModeWatcher': () => null,
    '@/lib/commercial-lead-challenge-client.mjs': { solveCommercialLeadChallenge: async () => 'proof' },
  };
  const location = { href, search: new URL(href).search };
  const Component = evaluate(code, dependencies, {
    AbortSignal, URLSearchParams,
    crypto: { randomUUID: () => `bb189bc0-1c1d-4cca-8400-${String(++uuid).padStart(12, '0')}` },
    document: { referrer: 'https://www.facebook.com/path?private=1', getElementById: () => null },
    requestAnimationFrame: fn => fn(),
    window: { location, dispatchEvent(event) { events.push(event.detail); }, requestAnimationFrame: fn => fn() },
    CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts.detail; } },
    fetch: async (url, opts = {}) => {
      calls.push({ url, ...opts });
      if (opts.method !== 'POST') return { ok: !challengeError, status: challengeError ? 503 : 200,
        json: async () => challengeError ? { error: 'Falha no desafio' } : { token: `challenge-${++nonce}` } };
      const outcome = outcomes.shift();
      if (outcome instanceof Error) throw outcome;
      const input = JSON.parse(opts.body);
      const result = typeof outcome === 'function' ? await outcome(input) : outcome;
      return result ? { ok: result.ok, status: result.status, json: async () => result.body }
        : { ok: true, status: 201, json: async () => ({ success: true,
          simulation: toPublicFinancialSimulation(calculateFinancialSimulation(input.simulation)) }) };
    },
  }).default;
  function render() {
    stateIndex = refIndex = effectIndex = callbackIndex = 0;
    tree = Component({ tool }); pending.splice(0).forEach(fn => fn());
  }
  function find(predicate, node = tree) {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) return node.map(item => find(predicate, item ?? null)).find(Boolean) || null;
    if (predicate(node)) return node;
    return find(predicate, node.props?.children ?? null);
  }
  const field = key => find(node => node.props?.id === `financial-${key}`);
  function change(key, value) { assert.ok(field(key), key); field(key).props.onChange({ target: { value } }); render(); }
  function numeric(key, value) { field(key).props.onValueChange({ formattedValue: value }, { source: 'event' }); render(); }
  function fillScenario() {
    change('referenceBasis', 'last_month');
    if (tool === 'cmv') change('segment', 'pizzaria');
    for (const [key, value] of Object.entries(tool === 'cmv'
      ? { revenue: '100.000,00', cmvAmount: '35.000,00' }
      : { revenue: '100.000,00', cmvPercent: '40,00', fixedCosts: '10.000,00', taxAmount: '5.000,00', feesPercent: '5,00', otherVariablePercent: '0,00' })) numeric(key, value);
  }
  function fillIdentity(values = profile) { for (const [key, value] of Object.entries(values)) change(key, value); }
  function rawSubmit() { return find(node => node.type === 'form').props.onSubmit({ preventDefault() {} }); }
  async function submit() { const pending = rawSubmit(); render(); await pending; render(); }
  function locked(key, node = tree, inherited = false) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(item => locked(key, item ?? null, inherited));
    const disabled = inherited || Boolean(node.props?.disabled || node.props?.readOnly);
    if (node.props?.id === `financial-${key}`) return disabled;
    return locked(key, node.props?.children ?? null, disabled);
  }
  const hasResult = () => Boolean(find(node => ['h2', 'h3'].includes(node.type)
    && /Seu CMV em perspectiva|Seu ponto de equilíbrio estimado/.test(textOf(node))));
  const posts = () => calls.filter(call => call.method === 'POST').map(call => JSON.parse(call.body));
  render(); render();
  return { render, find, field, change, numeric, fillScenario, fillIdentity, submit, rawSubmit, locked, hasResult, posts, calls, events, target };
}

for (const tool of ['cmv', 'breakeven']) {
  test(`${tool}: valores e identificação precedem a captação; só confirmação libera resultado`, async () => {
    const app = setup({ tool });
    await app.submit(); assert.equal(app.calls.length, 0);
    app.fillScenario(); await app.submit();
    assert.equal(app.calls.length, 0); assert.equal(app.hasResult(), false);
    assert.ok(app.field('name')); assert.ok(app.field('phone')); assert.ok(app.field('email'));
    await app.submit(); assert.equal(app.calls.length, 0);
    app.fillIdentity(); await app.submit();
    assert.equal(app.posts().length, 1); assert.equal(app.hasResult(), true);
    const body = app.posts()[0];
    assert.equal(body.simulation.tool, tool); assert.equal(body.simulation.revenue, 100000);
    assert.equal(body.commercialContactRequested, false);
    assert.equal(body.name, profile.name); assert.equal(body.email, profile.email);
    assert.equal(body.attribution.utm_source, 'meta');
    assert.ok(app.calls.every(call => call.url === '/api/financial-simulations/'));
    assert.deepEqual(app.target.dataLayer, [{ event: 'generate_lead', channel: tool === 'cmv' ? 'cmv' : 'diagnostico' }]);
    const context = app.events.filter(event => !event.clear).at(-1);
    assert.ok(context.simulation); assert.equal(context.answers.email, undefined); assert.equal(context.answers.phone, undefined);
  });
}

test('clique duplo e POST em andamento não mostram resultado nem duplicam o lead', async () => {
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  const app = setup({ outcomes: [async input => { await wait; return { ok: true, status: 201,
    body: { success: true, simulation: toPublicFinancialSimulation(calculateFinancialSimulation(input.simulation)) } }; }] });
  app.fillScenario(); await app.submit(); app.fillIdentity();
  const first = app.rawSubmit(); await app.rawSubmit();
  await new Promise(resolve => setImmediate(resolve)); app.render();
  assert.equal(app.posts().length, 1); assert.equal(app.hasResult(), false);
  assert.equal(app.locked('name'), true); assert.deepEqual(app.target.dataLayer, []);
  release(); await first; app.render(); await app.rawSubmit();
  assert.equal(app.posts().length, 1); assert.equal(app.hasResult(), true);
  assert.deepEqual(app.target.dataLayer, [{ event: 'generate_lead', channel: 'cmv' }]);
});

test('falha ambígua conserva contato, cenário e UUID; retry renova desafio e mede uma conversão', async () => {
  const app = setup({ outcomes: [new Error('Timeout')] });
  app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  assert.equal(app.hasResult(), false); assert.deepEqual(app.target.dataLayer, []);
  assert.equal(app.locked('name'), true);
  await app.submit();
  const [first, retry] = app.posts();
  assert.equal(app.posts().length, 2);
  assert.notEqual(first.antiBot.token, retry.antiBot.token);
  delete first.antiBot; delete retry.antiBot;
  assert.deepEqual(retry, first);
  assert.equal(app.hasResult(), true); assert.deepEqual(app.target.dataLayer, [{ event: 'generate_lead', channel: 'cmv' }]);
});

test('422 libera correção de identidade com o mesmo UUID e sem resultado prematuro', async () => {
  const app = setup({ outcomes: [{ ok: false, status: 422, body: { error: 'Revise os campos.', fieldErrors: { name: 'Revise o nome.' } } }] });
  app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  assert.equal(app.hasResult(), false); assert.equal(app.locked('name'), false);
  app.change('name', 'Pessoa Corrigida'); await app.submit();
  assert.equal(app.posts()[0].submissionId, app.posts()[1].submissionId);
  assert.equal(app.posts()[1].name, 'Pessoa Corrigida'); assert.equal(app.hasResult(), true);
});

test('desafio indisponível não cria POST, não congela identidade nem mede conversão', async () => {
  const app = setup({ challengeError: true });
  app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  assert.equal(app.posts().length, 0); assert.equal(app.hasResult(), false);
  assert.equal(app.locked('name'), false); assert.deepEqual(app.target.dataLayer, []);
});

test('resposta HTTP sem confirmação explícita nunca mostra resultado ou conversão', async () => {
  for (const outcome of [{ ok: false, status: 503, body: {} },
    { ok: true, status: 201, body: {} }, { ok: false, status: 500, body: { success: true } }]) {
    const app = setup({ outcomes: [outcome] }); app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
    assert.equal(app.hasResult(), false); assert.deepEqual(app.target.dataLayer, []);
    assert.equal(app.locked('name'), true);
  }
});

test('homologação com envio confirmado mantém analytics desligado', async () => {
  const app = setup({ environment: 'homolog' });
  app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  assert.equal(app.hasResult(), true); assert.deepEqual(app.target.dataLayer, []);
});

test('prévia em homologação bloqueia envio sem simular resultado nem conversão', async () => {
  const app = setup({ environment: 'homolog', href: 'https://rook.com.br/calculadora-cmv/?preview=1' });
  app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  assert.equal(app.calls.length, 0); assert.equal(app.hasResult(), false);
  assert.deepEqual(app.target.dataLayer, []);
  assert.match(textOf(app.find(node => node.props?.role === 'alert')), /prévia/i);
});

test('nova análise exige ação explícita, invalida contexto anterior e usa outro UUID', async () => {
  const app = setup(); app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  const first = app.posts()[0]; assert.equal(app.locked('name'), true);
  app.find(node => node.type === 'button' && textOf(node) === 'Fazer nova análise').props.onClick(); app.render();
  assert.equal(app.hasResult(), false); assert.equal(app.events.at(-1).clear, true);
  app.numeric('revenue', '200.000,00'); await app.submit();
  assert.equal(app.posts().length, 1); await app.submit();
  const next = app.posts()[1]; assert.notEqual(first.submissionId, next.submissionId);
  assert.equal(next.simulation.revenue, 200000); assert.equal(next.email, profile.email);
});

test('voltar aos números antes do envio preserva contato, sem requests', async () => {
  const app = setup(); app.fillScenario(); await app.submit(); app.fillIdentity();
  app.find(node => node.type === 'button' && textOf(node) === 'Voltar aos números').props.onClick(); app.render();
  assert.equal(app.field('revenue').props.value, '100.000,00');
  await app.submit();
  assert.equal(app.field('name').props.value, profile.name);
  assert.equal(app.field('email').props.value, profile.email);
  assert.equal(app.calls.length, 0);
});

test('identidade inválida não consome desafio; opção comercial só é enviada quando marcada', async () => {
  const app = setup(); app.fillScenario(); await app.submit();
  app.fillIdentity({ name: 'P', phone: '00000000000', email: 'email-sem-dominio' }); await app.submit();
  assert.equal(app.calls.length, 0); assert.equal(app.hasResult(), false);
  for (const key of ['name', 'phone', 'email']) assert.equal(app.field(key).props['aria-invalid'], true);
  app.fillIdentity();
  const choice = app.field('commercialContactRequested'); assert.equal(choice.props.checked, false);
  choice.props.onChange({ target: { checked: true } }); app.render(); await app.submit();
  assert.equal(app.posts()[0].commercialContactRequested, true);
  assert.deepEqual(app.target.consent, defaultConsentState());
});

test('422 financeiro retorna aos números para correção mantendo identidade e UUID', async () => {
  const app = setup({ outcomes: [{ ok: false, status: 422,
    body: { error: 'Revise os campos.', fieldErrors: { 'simulation.revenue': 'Revise a receita.' } } }] });
  app.fillScenario(); await app.submit(); app.fillIdentity(); await app.submit();
  assert.equal(app.field('name'), null); assert.equal(app.locked('revenue'), false);
  assert.equal(app.field('revenue').props['aria-invalid'], true); assert.equal(app.hasResult(), false);
  app.numeric('revenue', '120.000,00'); await app.submit();
  assert.equal(app.field('name').props.value, profile.name); await app.submit();
  assert.equal(app.posts()[0].submissionId, app.posts()[1].submissionId);
  assert.equal(app.posts()[1].simulation.revenue, 120000); assert.equal(app.hasResult(), true);
});
