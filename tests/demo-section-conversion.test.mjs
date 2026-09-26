import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as acquisition from '../src/lib/acquisition-input.mjs';
import * as culinarySegments from '../src/lib/culinary-segments.mjs';
import * as diagnostic from '../src/lib/diagnostic-context.mjs';
import * as financialReference from '../src/lib/financial-reference.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-input-options.mjs';
import * as attribution from '../src/lib/lead-attribution.mjs';
import * as trackingEvents from '../src/lib/tracking-events.mjs';
import { defaultConsentState } from '../src/lib/consent.mjs';

const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const demoCode = compile('../src/components/acquisition/DemoSection.tsx');
const trackCode = compile('../src/lib/track.ts');
const trackingCode = compile('../src/lib/tracking.ts');
const profile = { name: 'Pessoa Teste', company: 'Casa Teste', phone: '11999999999',
  email: 'teste@example.invalid', segment: 'pizzaria', revenueBand: 'up_to_100k' };
const plain = value => JSON.parse(JSON.stringify(value));

// Executa o componente e sua porta track reais. Somente transporte, hooks e
// elementos visuais são substituídos; nenhum CRM ou provedor externo é chamado.
function setup({ environment = 'production', href = 'https://rook.com.br/?utm_source=meta',
  outcomes = [{ ok: true, status: 201, body: { success: true } }], challengeError = false } = {}) {
  const state = [], refs = [], effects = [];
  let stateCursor = 0, refCursor = 0, effectCursor = 0, tree;
  let pathname = new URL(href).pathname;
  const pendingEffects = [], calls = [];
  const listeners = new Map();
  const target = { dataLayer: [], consent: defaultConsentState() };
  const location = { href, search: new URL(href).search };
  const react = {
    useState(initial) {
      const index = stateCursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], update => { state[index] = typeof update === 'function' ? update(state[index]) : update; }];
    },
    useRef(initial) { const index = refCursor++; return refs[index] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const index = effectCursor++, previous = effects[index];
      if (!previous || dependencies.some((item, i) => !Object.is(item, previous[i]))) pendingEffects.push(callback);
      effects[index] = dependencies;
    },
  };
  const environmentGlobals = { process: { env: { NODE_ENV: 'production', NEXT_PUBLIC_ENV: environment } }, console };
  function evaluate(code, dependencies, additional = {}) {
    const module = { exports: {} };
    vm.runInNewContext(code, { module, exports: module.exports, ...environmentGlobals, ...additional,
      require(name) { if (!(name in dependencies)) throw new Error(`Dependência inesperada: ${name}`); return dependencies[name]; },
    });
    return module.exports;
  }
  const tracking = evaluate(trackingCode, {});
  const track = evaluate(trackCode, { './tracking': tracking, './tracking-events.mjs': { ...trackingEvents,
    pushTrackingEvent: (name, payload, options) => trackingEvents.pushTrackingEvent(name, payload, { ...options, target }),
  } });
  const CityPicker = () => null;
  const dependencies = {
    react, 'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'next/navigation': { usePathname: () => pathname },
    '@/lib/culinary-segments.mjs': culinarySegments, '@/lib/acquisition-input.mjs': acquisition,
    '@/lib/diagnostic-context.mjs': diagnostic, '@/lib/lead-attribution.mjs': attribution,
    '@/lib/lead-attribution-client': { captureVisitAttribution: attribution.createVisitAttributionCapture() },
    '@/lib/financial-reference.mjs': financialReference,
    '@/lib/track': track, './CityPicker': CityPicker, './PreviewModeWatcher': () => null,
    './demo.module.css': {},
    '@/lib/commercial-lead-challenge-client.mjs': { solveCommercialLeadChallenge: async () => 'proof' },
  };
  const Component = evaluate(demoCode, dependencies, {
    crypto: { randomUUID: () => 'bb189bc0-1c1d-4cca-8400-44acb47fbda8' },
    window: { location, addEventListener(name, listener) { listeners.set(name, listener); }, removeEventListener(name) { listeners.delete(name); } },
    document: { referrer: 'https://www.facebook.com/path?private=1', getElementById: () => null },
    URLSearchParams, AbortSignal, requestAnimationFrame: callback => callback(),
    fetch: async (url, options = {}) => {
      calls.push({ url, ...options });
      if (options.method !== 'POST') return { ok: !challengeError,
        json: async () => challengeError ? { error: 'Falha no desafio' } : { token: 'challenge' } };
      const outcome = outcomes.shift();
      if (outcome instanceof Error) throw outcome;
      const result = typeof outcome === 'function' ? await outcome() : outcome;
      return { ok: result.ok, status: result.status, json: async () => result.body };
    },
  }).default;
  function render() {
    stateCursor = 0; refCursor = 0; effectCursor = 0;
    tree = Component();
    pendingEffects.splice(0).forEach(effect => effect());
    return tree;
  }
  function find(predicate, element = tree) {
    if (!element || typeof element !== 'object') return null;
    if (Array.isArray(element)) return element.map(item => find(predicate, item)).find(Boolean) || null;
    if (predicate(element)) return element;
    return find(predicate, element.props?.children ?? null);
  }
  render(); render();
  function fill({ consent = true } = {}) {
    for (const [key, value] of Object.entries(profile)) {
      find(node => node.props?.id === `demo-${key}`).props.onChange({ target: { value } }); render();
    }
    find(node => node.type === CityPicker).props.onChange('3550308', 'São Paulo/SP'); render();
    find(node => node.props?.id === 'demo-usesErp-no').props.onChange(); render();
    find(node => node.props?.id === 'demo-consent').props.onChange({ target: { checked: consent } }); render();
  }
  function submit() { return find(node => node.type === 'form').props.onSubmit({ preventDefault() {} }); }
  function navigate(next) {
    location.href = next; location.search = new URL(next).search; pathname = new URL(next).pathname; render(); render();
  }
  function receiveDiagnostic(detail) {
    listeners.get(diagnostic.DIAGNOSTIC_CONTEXT_EVENT)?.({ detail }); render(); render();
  }
  return { fill, submit, render, find, navigate, receiveDiagnostic, calls, target };
}

const averageCmvScenario = () => {
  const answers = { referenceBasis: 'monthly_average_12m', revenueBasis: 'gross', revenue: '100000', cmvInputMode: 'amount', cmvAmount: '35000',
    segment: 'pizzaria', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION };
  return { sourceId: 'cmv-reference-test', intent: 'cmv', answers, simulation: acquisition.buildSimulationInput(answers, 'cmv') };
};

test('formulário mostra referência mensal e envia diagnóstico sem inventar mês e ano', async () => {
  const app = setup(); app.fill(); app.receiveDiagnostic(averageCmvScenario());
  const label = app.find(node => node.type === 'small' && JSON.stringify(node.props.children).includes('Média mensal dos últimos 12 meses'));
  assert.ok(label);
  assert.equal(app.calls.length, 0);
  await app.submit();
  const body = JSON.parse(app.calls.find(call => call.method === 'POST').body);
  assert.equal(body.referenceBasis, 'monthly_average_12m');
  assert.equal(body.simulation.referenceBasis, 'monthly_average_12m');
  assert.equal(body.simulation.revenue, 100000);
  assert.equal(Object.hasOwn(body, 'period'), false);
  assert.equal(Object.hasOwn(body.simulation, 'period'), false);
});

test('invalidar cenário da calculadora retira a referência e o resultado antes de enviar o formulário', async () => {
  const app = setup(); app.fill(); app.receiveDiagnostic(averageCmvScenario());
  const hasDiagnostic = () => app.find(node => node.props?.['aria-label'] === 'Remover diagnóstico desta solicitação');
  assert.ok(hasDiagnostic());
  app.receiveDiagnostic({ sourceId: 'cmv-reference-test', clear: true });
  assert.equal(hasDiagnostic(), null);
  assert.equal(app.calls.length, 0);
  await app.submit();
  const body = JSON.parse(app.calls.find(call => call.method === 'POST').body);
  assert.equal(body.simulation, null);
  assert.equal(body.intent, 'demo');
  assert.equal(Object.hasOwn(body, 'referenceBasis'), false);
  assert.equal(Object.hasOwn(body, 'period'), false);
});

test('submit real confirma CRM e gera uma única conversão sem perfil, diagnóstico ou UTMs', async () => {
  const app = setup(); app.fill();
  assert.equal(app.calls.length, 0);
  await app.submit();
  await app.submit(); // Mesmo handler antes do próximo render, como clique duplo.
  assert.deepEqual(app.target.dataLayer, [{ event: 'generate_lead' }]);
  assert.equal(app.calls.filter(call => call.method === 'POST').length, 1);
  const body = JSON.parse(app.calls.find(call => call.method === 'POST').body);
  assert.deepEqual(body.attribution, { version: 1, source: 'site_form', utm_source: 'meta', landing_path: '/', referrer_host: 'www.facebook.com' });
  assert.deepEqual(plain(app.target.consent), defaultConsentState());
  app.render();
  assert.ok(app.find(node => node.props?.role === 'status'));
});

test('navegação mantém atribuição da entrada e não usa a URL atual na conversão', async () => {
  const app = setup(); app.navigate('https://rook.com.br/diagnostico/?utm_source=outra#cadastro'); app.fill();
  await app.submit();
  assert.equal(JSON.parse(app.calls.find(call => call.method === 'POST').body).attribution.utm_source, 'meta');
  assert.equal(JSON.parse(app.calls.find(call => call.method === 'POST').body).attribution.landing_path, '/');
});

test('prévia não chama API e homologação mantém o rastreamento desligado', async () => {
  const preview = setup({ environment: 'homolog', href: 'https://rook.com.br/?preview=1' }); preview.fill();
  await preview.submit();
  assert.equal(preview.calls.length, 0);
  assert.deepEqual(preview.target.dataLayer, []);
  const homolog = setup({ environment: 'homolog' }); homolog.fill(); await homolog.submit();
  assert.equal(homolog.calls.filter(call => call.method === 'POST').length, 1);
  assert.deepEqual(homolog.target.dataLayer, []);
});

test('validação e consentimento comercial ausente impedem envio e conversão', async () => {
  const empty = setup(); await empty.submit();
  assert.equal(empty.calls.length, 0); assert.deepEqual(empty.target.dataLayer, []);
  const app = setup(); app.fill({ consent: false }); await app.submit();
  assert.equal(app.calls.length, 0); assert.deepEqual(app.target.dataLayer, []);
});

test('erro no desafio, na API, timeout ou resposta sem sucesso não gera conversão', async () => {
  const challenge = setup({ challengeError: true }); challenge.fill(); await challenge.submit();
  assert.equal(challenge.calls.filter(call => call.method === 'POST').length, 0);
  assert.deepEqual(challenge.target.dataLayer, []);
  for (const outcome of [{ ok: false, status: 503, body: {} }, { ok: false, status: 422, body: { fieldErrors: { company: 'Revise' } } },
    { ok: true, status: 201, body: {} }, { ok: false, status: 500, body: { success: true } }, new Error('Timeout')]) {
    const app = setup({ outcomes: [outcome] }); app.fill(); await app.submit();
    assert.deepEqual(app.target.dataLayer, []);
  }
});

test('clique durante envio não duplica e retry confirmado mede somente uma vez', async () => {
  let release;
  const deferred = new Promise(resolve => { release = resolve; });
  const app = setup({ outcomes: [() => deferred, { ok: true, status: 201, body: { success: true } }] }); app.fill();
  const first = app.submit();
  await app.submit();
  release({ ok: false, status: 503, body: {} }); await first;
  assert.equal(app.calls.filter(call => call.method === 'POST').length, 1);
  assert.deepEqual(app.target.dataLayer, []);
  app.navigate('https://rook.com.br/planos/?utm_source=outra');
  await app.submit(); await app.submit();
  const posts = app.calls.filter(call => call.method === 'POST').map(call => JSON.parse(call.body));
  assert.equal(posts.length, 2);
  assert.deepEqual(posts[0].attribution, posts[1].attribution);
  assert.equal(posts[0].submissionId, posts[1].submissionId);
  assert.deepEqual(app.target.dataLayer, [{ event: 'generate_lead' }]);
});
