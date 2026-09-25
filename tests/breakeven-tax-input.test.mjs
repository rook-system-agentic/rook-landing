import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialSimulation as calculate } from '../src/lib/financial-simulation.mjs';
import { validateFinancialInput } from '../src/lib/financial-input.mjs';

const legacy = { tool: 'breakeven', revenueBasis: 'gross', revenue: 367000,
  cmvPercent: 38, fixedCosts: 180000, taxPercent: 11.45, feesPercent: 27, otherVariablePercent: 12 };
const { taxPercent: _percent, ...withoutTax } = legacy;
const amount = { ...withoutTax, taxInputMode: 'amount', taxAmount: 45000 };

test('legado sem modo preserva integralmente o cenário de 11,45% do print', () => {
  assert.deepEqual(calculate(legacy), {
    ok: true, tool: 'breakeven', formulaVersion: 'rook-consultivo-1', inputs: legacy,
    assumptions: [
      'Cenário mensal baseado nos valores informados. Não comprova lucro contábil, economia realizada ou fluxo de caixa.',
      'Custos fixos separados dos percentuais variáveis; informe cada despesa uma única vez. Não inclui dívidas, investimentos nem calendário de recebimentos.',
    ],
    result: { status: 'valid', contributionPercent: 11.55, breakEvenRevenue: 1558441.56,
      revenueGap: -1191441.56, operationalResult: -137611.5 },
    summary: 'Neste cenário, a receita mensal estimada para cobrir os custos é R$\u00a01.558.441,56. Sua receita está R$\u00a01.191.441,56 abaixo desse ponto. Essa diferença de receita não é o valor do lucro ou prejuízo.',
  });
});

test('percentual explícito preserva o modo e usa a mesma conta do legado', () => {
  const result = calculate({ ...legacy, taxInputMode: 'percent' });
  assert.deepEqual(result, { ...calculate(legacy), inputs: { ...legacy, taxInputMode: 'percent' } });
});

test('guia de R$ 45 mil preserva a razão completa e não arredonda imposto para 12,26%', () => {
  const response = calculate(amount);
  assert.equal(response.ok, true);
  assert.equal(response.result.breakEvenRevenue, 1676224.31);
  assert.equal(response.result.operationalResult, -140590);
  assert.notEqual(response.result.breakEvenRevenue, calculate({ ...legacy, taxPercent: 12.26 }).result.breakEvenRevenue);
  assert.deepEqual(response.inputs, amount);
  assert.equal(Object.hasOwn(response.inputs, 'taxPercent'), false);
  assert.deepEqual(calculate(response.inputs), response);
  assert.match(response.assumptions.join('\n'), /mesma referência/);
  assert.match(response.assumptions.join('\n'), /hipótese gerencial/);
  assert.match(response.assumptions.join('\n'), /guia não é somada aos custos fixos/);
});

test('valor e percentual exatamente equivalentes geram os mesmos resultados', () => {
  assert.deepEqual(calculate({ ...withoutTax, taxInputMode: 'amount', taxAmount: 42021.5 }).result,
    calculate(legacy).result);
  const response = calculate({ ...amount, revenue: 100000.504, taxAmount: 8000.0099 });
  assert.equal(response.inputs.revenue, 100000.5);
  assert.equal(response.inputs.taxAmount, 8000.01);
});

test('zero declarado é preservado; valores desconhecidos não viram zero', () => {
  assert.deepEqual(calculate({ ...amount, taxAmount: 0 }).result,
    calculate({ ...legacy, taxPercent: 0 }).result);
  for (const taxInputMode of ['amount', 'percent']) {
    const field = taxInputMode === 'amount' ? 'taxAmount' : 'taxPercent';
    for (const value of [undefined, null, '', '0', NaN, Infinity, -Infinity]) {
      const response = calculate({ ...withoutTax, taxInputMode, [field]: value });
      assert.equal(response.ok, false);
      assert.equal(typeof response.errors[field], 'string', `${field}: ${String(value)}`);
    }
  }
});

test('guia usa a margem do cenário, inclusive zero exato ou imposto maior que a receita', () => {
  for (const taxAmount of [84410, 84410.01, 367001, 1000000000]) {
    const response = calculate({ ...amount, taxAmount });
    assert.equal(response.ok, true);
    assert.equal(response.result.status, 'non_positive_margin');
    assert.equal(response.result.breakEvenRevenue, null);
    assert.equal(response.result.revenueGap, null);
  }
  const zero = calculate({ ...amount, taxAmount: 84410 });
  assert.equal(zero.result.contributionPercent, 0);
  assert.equal(zero.result.operationalResult, -180000);
  // O arredondamento de exibição não pode apagar uma margem positiva pequena.
  const positive = calculate({ ...amount, taxAmount: 84409.99 });
  assert.equal(positive.result.status, 'valid');
  assert.ok(positive.result.breakEvenRevenue > 1e12);
});

test('rejeita modos inválidos, guia sem modo e ambas as formas mesmo quando zero', () => {
  for (const taxInputMode of [null, '', 'gross_percent', 'unknown', false, 0]) {
    const response = calculate({ ...legacy, taxInputMode });
    assert.equal(response.ok, false);
    assert.equal(typeof response.errors.taxInputMode, 'string');
  }
  for (const candidate of [
    { ...withoutTax, taxAmount: 45000 }, { ...withoutTax, taxAmount: 0 },
    { ...withoutTax, taxInputMode: 'percent', taxAmount: 45000 },
    { ...withoutTax, taxInputMode: 'amount', taxPercent: 11.45 },
    { ...legacy, taxAmount: 45000 }, { ...legacy, taxInputMode: 'percent', taxAmount: 0 },
    { ...amount, taxPercent: 0 }, { ...amount, taxAmount: 0, taxPercent: 0 },
  ]) {
    const response = calculate(candidate);
    assert.equal(response.ok, false);
    assert.equal(typeof response.errors.taxInputMode, 'string');
  }
});

test('reais têm limite próprio, e as demais entradas mantêm suas validações', () => {
  for (const taxAmount of [-1, -0.001, 1000000000.01]) {
    assert.equal(calculate({ ...amount, taxAmount }).errors.taxAmount, 'Informe o valor dos impostos em reais.');
  }
  for (const field of ['cmvPercent', 'feesPercent', 'otherVariablePercent']) {
    for (const value of [-1, 100.01, null]) assert.equal(calculate({ ...amount, [field]: value }).ok, false);
  }
  for (const revenue of [0, 0.001, -1, 1000000000.01]) assert.equal(calculate({ ...amount, revenue }).ok, false);
  assert.equal(calculate({ ...amount, fixedCosts: null }).ok, false);
  assert.equal(calculate({ ...amount, fixedCosts: 0 }).result.breakEvenRevenue, 0);
});

test('referência, guia e receita permanecem sem divisão ou dedução no contrato de entrada', () => {
  for (const referenceBasis of ['last_month', 'monthly_average_12m']) {
    const candidate = { ...amount, referenceBasis };
    const result = calculate(Object.freeze(candidate));
    assert.deepEqual(result.inputs, candidate);
    assert.deepEqual(validateFinancialInput(candidate), { ok: true, inputs: candidate });
    assert.equal(result.result.breakEvenRevenue, 1676224.31);
  }
  assert.equal(calculate({ ...amount, referenceBasis: 'last_month', period: '2026-08' }).ok, false);
});
