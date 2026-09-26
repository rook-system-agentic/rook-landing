import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as segments from '../src/lib/culinary-segments.mjs';
import * as options from '../src/lib/cmv-input-options.mjs';
import * as acquisition from '../src/lib/acquisition-input.mjs';
import * as diagnostic from '../src/lib/diagnostic-context.mjs';
import * as reference from '../src/lib/financial-reference.mjs';
import * as numberInput from '../src/lib/financial-number-input.mjs';
import * as validation from '../src/lib/financial-input.mjs';
import * as attribution from '../src/lib/lead-attribution.mjs';
import { TRACKING_EVENTS } from '../src/lib/tracking-events.mjs';
import { calculateFinancialSimulation } from '../src/lib/financial-simulation.mjs';
import { toPublicFinancialSimulation } from '../src/lib/public-financial-simulation.mjs';

const source = readFileSync(new URL('../src/components/acquisition/FinancialTool.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;

// Exercita os handlers do componente real e o contrato numérico real; substitui
// somente hooks/elementos visuais e transporte, sem enviar dados a provedores.
function setup(tool = 'breakeven') {
  const states = [], effects = [], callbacks = [], refs = [], pending = [], requests = [], events = [];
  let stateIndex, effectIndex, callbackIndex, refIndex, tree;
  const changed = (old, next) => !old || next.some((value, index) => !Object.is(value, old[index]));
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
        effects[index]?.cleanup?.();
        effects[index] = { deps, cleanup: fn() };
      });
    },
  };
  const NumericFormat = () => null;
  const dependencies = {
    react, 'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-number-format': { NumericFormat, PatternFormat: () => null }, '@/lib/culinary-segments.mjs': segments,
    '@/lib/cmv-input-options.mjs': options, '@/lib/acquisition-input.mjs': acquisition,
    '@/lib/diagnostic-context.mjs': diagnostic, '@/lib/financial-reference.mjs': reference,
    '@/lib/financial-number-input.mjs': numberInput, '@/lib/financial-input.mjs': validation,
    '@/lib/lead-attribution-client': { captureVisitAttribution: attribution.createVisitAttributionCapture() },
    '@/lib/track': { track: () => false, TRACKING_EVENTS },
    '@/lib/commercial-lead-challenge-client.mjs': { solveCommercialLeadChallenge: async () => 'proof' },
    './PreviewModeWatcher': () => null,
    './financial-tool.module.css': {},
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, AbortSignal, URLSearchParams,
    process: { env: { NODE_ENV: 'production', NEXT_PUBLIC_ENV: 'production' } },
    crypto: { randomUUID: () => 'bb189bc0-1c1d-4cca-8400-44acb47fbda8' },
    document: { referrer: '', getElementById: () => null },
    requestAnimationFrame: fn => fn(),
    require(name) { assert.ok(name in dependencies, name); return dependencies[name]; },
    window: { location: { href: 'https://rook.com.br/diagnostico/', search: '' },
      dispatchEvent(event) { events.push(event.detail); }, requestAnimationFrame(fn) { fn(); } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    fetch: async (url, options = {}) => {
      if (options.method !== 'POST') return { ok: true, json: async () => ({ token: 'challenge' }) };
      const input = JSON.parse(options.body).simulation;
      requests.push(input);
      const result = toPublicFinancialSimulation(calculateFinancialSimulation(input));
      return { ok: result.ok, status: 201, json: async () => ({ success: true, simulation: result }) };
    },
  });
  function render() {
    stateIndex = effectIndex = callbackIndex = refIndex = 0;
    tree = module.exports.default({ tool });
    pending.splice(0).forEach(fn => fn());
  }
  function find(predicate, node = tree) {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) return node.map(item => find(predicate, item ?? null)).find(Boolean) || null;
    if (predicate(node)) return node;
    return find(predicate, node.props?.children ?? null);
  }
  const field = key => find(node => node.props?.id === `financial-${key}`);
  function select(key, value) { field(key).props.onChange({ target: { value } }); render(); }
  function numeric(key, value) { field(key).props.onValueChange({ formattedValue: value }, { source: 'event' }); render(); }
  function unknown(key) {
    const container = find(node => node.type === 'div' && Array.isArray(node.props?.children) && node.props.children.some(child => child?.type === 'label' && child.props.htmlFor === `financial-${key}`));
    find(node => node.type === 'input' && node.props.type === 'checkbox', container).props.onChange({ target: { checked: true } }); render();
  }
  async function calculate() {
    await find(node => node.type === 'form').props.onSubmit({ preventDefault() {} }); render();
    if (field('name')) {
      for (const [key, value] of Object.entries({ name: 'Pessoa Teste', phone: '(11) 99999-9999', email: 'teste@example.invalid' })) select(key, value);
      await find(node => node.type === 'form').props.onSubmit({ preventDefault() {} }); render();
    }
  }
  function newAnalysis() {
    const button = find(node => node.type === 'button' && node.props.children === 'Fazer nova análise');
    assert.ok(button); button.props.onClick(); render();
  }
  function fillBase() {
    select('referenceBasis', 'last_month');
    for (const [key, value] of Object.entries({ revenue: '100.000,00', cmvPercent: '40,00', fixedCosts: '10.000,00', feesPercent: '5,00', otherVariablePercent: '0,00' })) numeric(key, value);
  }
  render(); render();
  return { field, select, numeric, unknown, calculate, fillBase, newAnalysis, find, requests, events };
}

const latestScenario = app => app.events.filter(event => !event.clear).at(-1);

test('PE começa com imposto em reais e envia o valor da guia sem convertê-lo em percentual na UI', async () => {
  const app = setup(); app.fillBase();
  assert.equal(app.field('taxInputMode').props.value, 'amount');
  assert.equal(app.field('taxAmount').props['aria-label'], 'Impostos sobre as vendas no último mês em reais');
  assert.equal(app.field('taxPercent'), null);
  app.numeric('taxAmount', '5.000,00'); await app.calculate();
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].taxInputMode, 'amount');
  assert.equal(app.requests[0].taxAmount, 5000);
  assert.equal(Object.hasOwn(app.requests[0], 'taxPercent'), false);
  assert.equal(latestScenario(app).simulation.taxAmount, 5000);
});

test('trocar modo remove resultado e contexto anterior, limpa ambos os valores e desfaz desconhecido', async () => {
  const app = setup(); app.fillBase(); app.numeric('taxAmount', '5.000,00'); await app.calculate();
  app.newAnalysis();
  app.select('taxInputMode', 'percent');
  assert.equal(app.events.at(-1).clear, true);
  assert.equal(app.field('taxAmount'), null);
  assert.equal(app.field('taxPercent').props.value, '');
  assert.equal(app.field('revenue').props.value, '100.000,00');
  app.numeric('taxPercent', '5,00'); await app.calculate();
  assert.equal(app.requests[1].taxPercent, 5);
  assert.equal(Object.hasOwn(app.requests[1], 'taxAmount'), false);
  app.newAnalysis();
  app.unknown('taxPercent');
  app.select('taxInputMode', 'amount');
  assert.equal(app.field('taxAmount').props.disabled, undefined);
  assert.equal(app.field('taxAmount').props.value, '');
  app.unknown('taxAmount');
  app.select('taxInputMode', 'percent');
  assert.equal(app.field('taxPercent').props.disabled, undefined);
  assert.equal(app.field('taxPercent').props.value, '');
});

test('média de 12 meses limpa guia anterior e desconhecido do imposto ativo continua sem estimativa', async () => {
  const app = setup(); app.fillBase(); app.numeric('taxAmount', '5.000,00');
  app.select('referenceBasis', 'monthly_average_12m');
  assert.equal(app.field('taxAmount').props.value, '');
  assert.equal(app.field('revenue').props.value, '');
  assert.match(app.find(node => node.props?.id === 'financial-taxAmount-help').props.children, /média mensal.*mesmos 12 meses/);
  for (const [key, value] of Object.entries({ revenue: '100.000,00', cmvPercent: '40,00', fixedCosts: '10.000,00', feesPercent: '5,00', otherVariablePercent: '0,00' })) app.numeric(key, value);
  app.unknown('taxAmount'); await app.calculate();
  assert.equal(app.requests.length, 0);
  assert.equal(latestScenario(app).simulation, null);
  assert.equal(latestScenario(app).unknown.taxAmount, true);
  assert.equal(app.field('taxAmount').props.disabled, true);
});

test('calculadora CMV mantém modo de consumo e não recebe seletor da guia do PE', () => {
  const app = setup('cmv');
  assert.equal(app.field('taxInputMode'), null);
  assert.equal(app.field('cmvInputMode').props.value, 'amount');
  assert.ok(app.field('cmvAmount'));
  assert.ok(app.field('taxState'));
});
