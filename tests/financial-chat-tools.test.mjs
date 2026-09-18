import test from 'node:test';
import assert from 'node:assert/strict';
import { FINANCIAL_CHAT_TOOLS, executeFinancialChatTool as execute } from '../src/lib/financial-chat-tools.mjs';
import { calculateFinancialSimulation } from '../src/lib/financial-simulation.mjs';

const cmv = { period: '2026-08', currency: 'BRL', revenueBasis: 'net', revenue: 100000, cmvPercent: 38, segment: 'a_la_carte', confirmed: true };
const pe = { period: '2026-08', currency: 'BRL', revenueBasis: 'gross', revenue: 150000, cmvPercent: 35, fixedCosts: 60000, taxPercent: 8, feesPercent: 2, otherVariablePercent: 5, confirmed: true };
const without = (candidate, field) => Object.fromEntries(Object.entries(candidate).filter(([key]) => key !== field));

test('ferramentas expõem esquemas completos, bases explícitas e confirmação obrigatória', () => {
  assert.deepEqual(FINANCIAL_CHAT_TOOLS.map(tool => tool.name), ['analisar_cmv', 'estimar_ponto_equilibrio']);
  for (const tool of FINANCIAL_CHAT_TOOLS) {
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.deepEqual(new Set(tool.inputSchema.required), new Set(Object.keys(tool.inputSchema.properties)));
    assert.equal(tool.inputSchema.properties.currency.const, 'BRL');
    assert.equal(tool.inputSchema.properties.confirmed.const, true);
    assert.equal(tool.inputSchema.properties.revenue.type, 'number');
  }
  assert.equal(FINANCIAL_CHAT_TOOLS[0].inputSchema.properties.revenueBasis.const, 'net');
  assert.equal(FINANCIAL_CHAT_TOOLS[1].inputSchema.properties.revenueBasis.const, 'gross');
});

test('CMV confirmado usa o motor existente e devolve entradas, mês, moeda, premissas e versão', () => {
  const response = execute('analisar_cmv', cmv);
  const expected = calculateFinancialSimulation({ tool: 'cmv', revenueBasis: 'net', revenue: 100000, cmvPercent: 38, segment: 'a_la_carte' });
  assert.deepEqual(response, { status: 'success', toolName: 'analisar_cmv', period: '2026-08', currency: 'BRL', ...expected });
  assert.equal(response.result.monthlyDifference, 6000);
});

test('ponto de equilíbrio confirmado preserva folga de receita separada do resultado operacional', () => {
  const response = execute('estimar_ponto_equilibrio', pe);
  assert.equal(response.status, 'success');
  assert.equal(response.result.breakEvenRevenue, 120000);
  assert.equal(response.result.revenueGap, 30000);
  assert.equal(response.result.operationalResult, 15000);
});

test('omissões em qualquer ordem pedem apenas os dados que faltam e não emitem resultado', () => {
  for (const [name, scenario] of [['analisar_cmv', cmv], ['estimar_ponto_equilibrio', pe]]) {
    for (const field of Object.keys(scenario).filter(field => field !== 'confirmed')) {
      const response = execute(name, without(scenario, field));
      assert.equal(response.status, 'needs_information', field);
      assert.deepEqual(response.missingFields, [field]);
      assert.equal(Object.hasOwn(response, 'result'), false);
    }
  }
});

test('zero explicitamente informado é válido; custo desconhecido permanece ausente', () => {
  const scenario = { ...pe, fixedCosts: 0, taxPercent: 0, feesPercent: 0, otherVariablePercent: 0 };
  assert.equal(execute('estimar_ponto_equilibrio', scenario).result.breakEvenRevenue, 0);
  const unknown = execute('estimar_ponto_equilibrio', { ...scenario, fixedCosts: null });
  assert.equal(unknown.status, 'needs_information');
  assert.deepEqual(unknown.missingFields, ['fixedCosts']);
});

test('sem confirmação verdadeira devolve cenário para conferir, sem cálculo', () => {
  for (const confirmed of [false, undefined, null]) {
    const response = execute('analisar_cmv', { ...cmv, confirmed });
    assert.equal(response.status, 'needs_confirmation');
    assert.equal(response.inputs.revenue, 100000);
    assert.equal(response.period, '2026-08');
    assert.equal(Object.hasOwn(response, 'result'), false);
    assert.equal(Object.hasOwn(response, 'summary'), false);
  }
  assert.equal(execute('analisar_cmv', without(cmv, 'confirmed')).status, 'needs_confirmation');
  assert.equal(execute('analisar_cmv', { ...cmv, confirmed: 'true' }).status, 'invalid_input');
});

test('base incompatível não é convertida nem corrigida silenciosamente', () => {
  for (const [name, scenario, wrongBasis] of [['analisar_cmv', cmv, 'gross'], ['estimar_ponto_equilibrio', pe, 'net']]) {
    const response = execute(name, { ...scenario, revenueBasis: wrongBasis });
    assert.equal(response.status, 'invalid_input');
    assert.ok(response.errors.revenueBasis);
  }
});

test('período, moeda e números ambíguos são rejeitados, sem coerção de texto', () => {
  for (const period of ['2026-00', '2026-13', '08/2026', '2026-8', ' 2026-08', '2026-08\n', 202608]) {
    assert.ok(execute('analisar_cmv', { ...cmv, period }).errors.period);
  }
  assert.ok(execute('analisar_cmv', { ...cmv, currency: 'USD' }).errors.currency);
  for (const revenue of [0, 0.001, -1, 1_000_000_001, NaN, Infinity, '100000', 'R$ 100.000,00']) {
    assert.ok(execute('analisar_cmv', { ...cmv, revenue }).errors.revenue);
  }
  assert.ok(execute('analisar_cmv', { ...cmv, cmvPercent: 101 }).errors.cmvPercent);
});

test('correção exige nova confirmação e produz novo resultado sem reaproveitar o anterior', () => {
  const original = Object.freeze({ ...cmv });
  const first = execute('analisar_cmv', original);
  const corrected = { ...original, revenue: 200000, period: '2026-09', confirmed: false };
  assert.equal(execute('analisar_cmv', corrected).status, 'needs_confirmation');
  const second = execute('analisar_cmv', { ...corrected, confirmed: true });
  assert.equal(second.result.monthlyDifference, 12000);
  assert.equal(second.period, '2026-09');
  assert.equal(first.result.monthlyDifference, 6000);
  assert.equal(original.revenue, 100000);
});

test('margem nula ou negativa mantém ponto de equilíbrio indisponível', () => {
  for (const taxPercent of [58, 60]) {
    const response = execute('estimar_ponto_equilibrio', { ...pe, taxPercent });
    assert.equal(response.status, 'success');
    assert.equal(response.result.status, 'non_positive_margin');
    assert.equal(response.result.breakEvenRevenue, null);
    assert.equal(response.result.revenueGap, null);
  }
});

test('segmento sem referência não recebe benchmark inventado', () => {
  const response = execute('analisar_cmv', { ...cmv, segment: 'other' });
  assert.equal(response.status, 'success');
  assert.equal(response.result.status, 'no_reference');
  assert.equal(response.result.referencePercent, null);
  assert.equal(execute('analisar_cmv', { ...cmv, segment: 'aproximado' }).status, 'invalid_input');
});

test('campos extras, resultados anteriores e dados de contato não são aceitos nem refletidos', () => {
  for (const extra of [{ email: 'teste@example.invalid' }, { result: { monthlyDifference: 999999 } }, { tool: 'breakeven' }]) {
    const response = execute('analisar_cmv', { ...cmv, ...extra });
    assert.deepEqual(response, { status: 'invalid_input', errors: { arguments: 'O cenário contém campos não permitidos.' } });
  }
  assert.equal(execute('desconhecida', cmv).status, 'invalid_input');
  for (const candidate of [null, [], 'texto', 1]) assert.equal(execute('analisar_cmv', candidate).status, 'invalid_input');
});
