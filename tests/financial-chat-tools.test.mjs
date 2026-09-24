import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FINANCIAL_CHAT_TOOLS, executeFinancialChatTool as execute } from '../src/lib/financial-chat-tools.mjs';
import { calculateFinancialSimulation } from '../src/lib/financial-simulation.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-tax-estimate.mjs';

const cmv = { period: '2026-08', currency: 'BRL', revenueBasis: 'net', revenue: 100000, cmvPercent: 38, segment: 'a_la_carte', confirmed: true };
const pe = { period: '2026-08', currency: 'BRL', revenueBasis: 'gross', revenue: 150000, cmvPercent: 35, fixedCosts: 60000, taxPercent: 8, feesPercent: 2, otherVariablePercent: 5, confirmed: true };
const without = (candidate, field) => Object.fromEntries(Object.entries(candidate).filter(([key]) => key !== field));

test('ferramentas expõem esquemas completos, bases explícitas e confirmação obrigatória', () => {
  assert.deepEqual(FINANCIAL_CHAT_TOOLS.map(tool => tool.name), ['analisar_cmv', 'estimar_ponto_equilibrio']);
  for (const tool of FINANCIAL_CHAT_TOOLS) {
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.ok(tool.inputSchema.required.includes('confirmed'));
    assert.ok(!tool.inputSchema.required.includes('period'));
    assert.deepEqual(tool.inputSchema.properties.referenceBasis.enum, ['last_month', 'monthly_average_12m']);
    assert.equal(tool.inputSchema.allOf[0].oneOf.length, 2);
    assert.equal(tool.inputSchema.properties.currency.const, 'BRL');
    assert.equal(tool.inputSchema.properties.confirmed.const, true);
    assert.equal(tool.inputSchema.properties.revenue.type, 'number');
  }
  assert.deepEqual(FINANCIAL_CHAT_TOOLS[0].inputSchema.properties.revenueBasis.enum, ['gross', 'net']);
  assert.equal(FINANCIAL_CHAT_TOOLS[0].inputSchema.allOf[1].oneOf.length, 4);
  assert.equal(FINANCIAL_CHAT_TOOLS[0].inputSchema.properties.taxModelVersion.const, CMV_TAX_MODEL_VERSION);
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
      assert.deepEqual(response.missingFields, [field === 'period' ? 'referenceBasis' : field]);
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
  for (const [name, scenario, wrongBasis] of [['analisar_cmv', cmv, 'unknown'], ['estimar_ponto_equilibrio', pe, 'net']]) {
    const response = execute(name, { ...scenario, revenueBasis: wrongBasis });
    assert.equal(response.status, 'invalid_input');
    assert.ok(response.errors.revenueBasis);
  }
  const gross = execute('analisar_cmv', { ...cmv, revenueBasis: 'gross' });
  assert.equal(gross.status, 'needs_information');
  assert.deepEqual(gross.missingFields, ['cmvInputMode', 'taxState', 'taxModelVersion']);
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

const grossCmv = {
  referenceBasis: 'last_month', currency: 'BRL', revenueBasis: 'gross',
  revenue: 100000, cmvInputMode: 'amount', cmvAmount: 35000,
  taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION, segment: 'a_la_carte', confirmed: true,
};

test('CMV bruto aceita os três modos e as duas referências, usando o mesmo motor sem fabricar data', () => {
  for (const referenceBasis of ['last_month', 'monthly_average_12m']) {
    for (const [cmvInputMode, cost] of [['amount', { cmvAmount: 35000 }], ['gross_percent', { cmvPercent: 35 }], ['net_percent', { cmvPercent: 35 }]]) {
      const candidate = { ...without(grossCmv, 'cmvAmount'), referenceBasis, cmvInputMode, ...cost };
      const expected = calculateFinancialSimulation({ tool: 'cmv', ...without(without(candidate, 'currency'), 'confirmed') });
      const response = execute('analisar_cmv', candidate);
      assert.deepEqual(response, { status: 'success', toolName: 'analisar_cmv', referenceBasis, currency: 'BRL', ...expected });
      assert.equal(response.formulaVersion, 'rook-cmv-gross-1');
      assert.ok(response.result.estimatedTaxAmount > 0);
      assert.ok(response.result.estimatedNetRevenue < candidate.revenue);
      assert.equal(Object.hasOwn(response, 'period'), false);
      assert.equal(Object.hasOwn(response.inputs, 'period'), false);
      if (cmvInputMode === 'net_percent') assert.ok(Math.abs(response.result.comparisonCmvPercent - 35) < 0.00001);
      else assert.equal(response.result.cmvAmount, 35000);
      if (referenceBasis === 'monthly_average_12m') {
        assert.equal(response.inputs.revenue, 100000);
        assert.match(response.assumptions.join(' '), /mesmos 12 meses/);
        assert.match(response.assumptions.join(' '), /não são divididos por 12 novamente/);
      }
    }
  }
});

test('ponto de equilíbrio aceita referência relativa e média mensal sem alterar os números', () => {
  const legacy = execute('estimar_ponto_equilibrio', pe);
  for (const referenceBasis of ['last_month', 'monthly_average_12m']) {
    const response = execute('estimar_ponto_equilibrio', { ...without(pe, 'period'), referenceBasis });
    assert.equal(response.status, 'success');
    assert.equal(response.referenceBasis, referenceBasis);
    assert.equal(response.inputs.referenceBasis, referenceBasis);
    assert.deepEqual(response.result, legacy.result);
    assert.equal(Object.hasOwn(response, 'period'), false);
    assert.equal(Object.hasOwn(response.inputs, 'period'), false);
  }
});

test('receita líquida explícita continua disponível com referência relativa sem novo desconto', () => {
  const legacy = execute('analisar_cmv', cmv);
  const response = execute('analisar_cmv', { ...without(cmv, 'period'), referenceBasis: 'last_month' });
  assert.equal(response.status, 'success');
  assert.deepEqual(response.result, legacy.result);
  assert.equal(response.formulaVersion, legacy.formulaVersion);
  assert.equal(response.inputs.revenueBasis, 'net');
  assert.equal(Object.hasOwn(response.result, 'estimatedTaxAmount'), false);
});

test('base de referência ausente é solicitada sem pedir mês, e referências conflitantes são rejeitadas', () => {
  for (const missingReference of [without(grossCmv, 'referenceBasis'), { ...grossCmv, referenceBasis: null }, { ...grossCmv, referenceBasis: undefined }]) {
    assert.deepEqual(execute('analisar_cmv', missingReference), { status: 'needs_information', toolName: 'analisar_cmv', missingFields: ['referenceBasis'] });
  }
  for (const referenceBasis of ['yearly_total', '2026-09', 12, false, '']) {
    assert.ok(execute('analisar_cmv', { ...grossCmv, referenceBasis }).errors.referenceBasis);
  }
  const conflict = execute('analisar_cmv', { ...grossCmv, period: '2026-08' });
  assert.equal(conflict.status, 'invalid_input');
  assert.ok(conflict.errors.referenceBasis);
  assert.equal(Object.hasOwn(conflict, 'result'), false);
  const explicitMonth = execute('analisar_cmv', { ...without(grossCmv, 'referenceBasis'), period: '2026-08' });
  assert.equal(explicitMonth.status, 'success');
  assert.equal(explicitMonth.period, '2026-08');
  assert.equal(Object.hasOwn(explicitMonth, 'referenceBasis'), false);
});

test('CMV bruto pede somente os campos do modo escolhido e não inventa UF, consumo ou modelo', () => {
  for (const field of ['revenue', 'cmvInputMode', 'cmvAmount', 'taxState', 'taxModelVersion', 'segment']) {
    const response = execute('analisar_cmv', without(grossCmv, field));
    assert.equal(response.status, 'needs_information', field);
    assert.deepEqual(response.missingFields, [field]);
  }
  const percentCandidate = { ...without(grossCmv, 'cmvAmount'), cmvInputMode: 'gross_percent' };
  assert.deepEqual(execute('analisar_cmv', percentCandidate).missingFields, ['cmvPercent']);
  for (const taxState of ['sp', 'XX', '', 1]) assert.ok(execute('analisar_cmv', { ...grossCmv, taxState }).errors.taxState);
  assert.ok(execute('analisar_cmv', { ...grossCmv, taxModelVersion: 'old' }).errors.taxModelVersion);
  assert.ok(execute('analisar_cmv', { ...grossCmv, cmvInputMode: 'purchases' }).errors.cmvInputMode);
  assert.ok(execute('analisar_cmv', { ...grossCmv, cmvAmount: -1 }).errors.cmvAmount);
  assert.ok(execute('analisar_cmv', { ...grossCmv, cmvAmount: '35000' }).errors.cmvAmount);
  assert.equal(execute('analisar_cmv', { ...grossCmv, cmvAmount: 0 }).result.cmvAmount, 0);
});

test('não ignora valores contraditórios ou parâmetros de bruto em um cenário líquido', () => {
  assert.ok(execute('analisar_cmv', { ...grossCmv, cmvPercent: 35 }).errors.cmvPercent);
  assert.ok(execute('analisar_cmv', { ...grossCmv, cmvInputMode: 'gross_percent', cmvPercent: 35 }).errors.cmvAmount);
  for (const extra of [{ cmvInputMode: 'net_percent' }, { cmvAmount: 35000 }, { taxState: 'SP' }, { taxModelVersion: CMV_TAX_MODEL_VERSION }]) {
    assert.equal(execute('analisar_cmv', { ...cmv, ...extra }).status, 'invalid_input');
  }
});

test('confirmação do bruto preserva receita, custo, UF e referência, sem executar cálculo', () => {
  const candidate = Object.freeze({ ...grossCmv, referenceBasis: 'monthly_average_12m', taxState: 'DF', confirmed: false });
  const response = execute('analisar_cmv', candidate);
  assert.equal(response.status, 'needs_confirmation');
  assert.equal(response.referenceBasis, 'monthly_average_12m');
  assert.equal(response.inputs.referenceBasis, 'monthly_average_12m');
  assert.equal(response.inputs.revenueBasis, 'gross');
  assert.equal(response.inputs.revenue, 100000);
  assert.equal(response.inputs.cmvAmount, 35000);
  assert.equal(response.inputs.taxState, 'DF');
  assert.equal(response.inputs.taxModelVersion, CMV_TAX_MODEL_VERSION);
  for (const field of ['result', 'summary', 'period', 'assumptions']) assert.equal(Object.hasOwn(response, field), false);
  const confirmed = execute('analisar_cmv', { ...candidate, confirmed: true });
  assert.equal(confirmed.status, 'success');
  const corrected = execute('analisar_cmv', { ...candidate, referenceBasis: 'last_month', revenue: 120000 });
  assert.equal(corrected.status, 'needs_confirmation');
  assert.equal(corrected.inputs.revenue, 120000);
  assert.equal(corrected.referenceBasis, 'last_month');
});

test('exemplos entregues na OpenAPI podem ser usados pela integração sem perder base ou referência', () => {
  const document = JSON.parse(readFileSync(new URL('../docs/rook-ai-financial-tools.openapi.json', import.meta.url), 'utf8'));
  let examples = 0;
  for (const { post } of Object.values(document.paths)) {
    for (const { value } of Object.values(post.requestBody.content['application/json'].examples)) {
      const response = execute(post.operationId, value);
      assert.equal(response.status, value.confirmed ? 'success' : 'needs_confirmation');
      assert.equal(response.inputs.revenueBasis, value.revenueBasis);
      assert.equal(response.referenceBasis, value.referenceBasis);
      assert.equal(response.period, value.period);
      examples += 1;
    }
  }
  assert.equal(examples, 6);
});
