import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFinancialInput } from '../src/lib/financial-input.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-input-options.mjs';
import { calculateFinancialSimulation as calculate, PURCHASES_FORMULA_VERSION } from '../src/lib/financial-simulation.mjs';

const scenario = Object.freeze({
  tool: 'breakeven', revenueBasis: 'gross', referenceBasis: 'last_month',
  costInputMode: 'purchases_amount', taxInputMode: 'amount',
  revenue: 150000, purchasesAmount: 52500, fixedCosts: 60000,
  taxAmount: 12000, feesPercent: 2, otherVariableAmount: 7500,
});

test('compras em reais preservam origem, versão e cenário de R$ 120 mil de equilíbrio', () => {
  const response = calculate(scenario);
  assert.equal(response.ok, true);
  assert.equal(response.formulaVersion, 'rook-breakeven-purchases-1');
  assert.equal(response.formulaVersion, PURCHASES_FORMULA_VERSION);
  assert.deepEqual(response.inputs, scenario);
  assert.deepEqual(response.result, {
    status: 'valid', contributionPercent: 50, breakEvenRevenue: 120000,
    revenueGap: 30000, operationalResult: 15000,
  });
  assert.deepEqual(calculate(response.inputs), response);
  assert.equal(Object.hasOwn(response.inputs, 'cmvPercent'), false);
  assert.equal(Object.hasOwn(response.inputs, 'otherVariablePercent'), false);
  assert.match(response.assumptions.join('\n'), /não como CMV apurado/);
  assert.match(response.assumptions.join('\n'), /estoque pode distorcer/);
  assert.match(response.assumptions.join('\n'), /mesma proporção das vendas do último mês/);
  assert.match(response.assumptions.join('\n'), /não uma alíquota fiscal confirmada/);
});

test('valores em reais são normalizados em centavos sem criar percentuais intermediários', () => {
  const response = calculate({ ...scenario, revenue: 100.014, purchasesAmount: 33.334,
    taxAmount: 10.001, otherVariableAmount: 6.669, fixedCosts: 50.004, feesPercent: 2.149 });
  assert.equal(response.ok, true);
  assert.deepEqual(response.inputs, { ...scenario, revenue: 100.01, purchasesAmount: 33.33,
    taxAmount: 10, otherVariableAmount: 6.67, fixedCosts: 50, feesPercent: 2.15 });
  assert.deepEqual(response.result, { status: 'valid', contributionPercent: 47.85,
    breakEvenRevenue: 104.48, revenueGap: -4.47, operationalResult: -2.14 });
  const recurringRatio = calculate({ ...scenario, revenue: 367000, purchasesAmount: 139460,
    fixedCosts: 180000, taxAmount: 45000, feesPercent: 27, otherVariableAmount: 44040 });
  assert.equal(recurringRatio.result.breakEvenRevenue, 1676224.31);
  assert.notEqual(recurringRatio.result.breakEvenRevenue, 1675977.65); // Resultado se a guia virasse 12,26% antes da conta.
});

test('margem zero é exata; margem negativa não gera ponto de equilíbrio', () => {
  for (const otherVariableAmount of [82500, 82500.01, 1000000000]) {
    const response = calculate({ ...scenario, otherVariableAmount });
    assert.equal(response.ok, true);
    assert.equal(response.result.status, 'non_positive_margin');
    assert.equal(response.result.breakEvenRevenue, null);
    assert.equal(response.result.revenueGap, null);
  }
  const zero = calculate({ ...scenario, otherVariableAmount: 82500 });
  assert.equal(zero.result.contributionPercent, 0);
  assert.equal(zero.result.operationalResult, -60000);
  const oneCent = calculate({ ...scenario, otherVariableAmount: 82499.99 });
  assert.equal(oneCent.result.status, 'valid');
  assert.equal(oneCent.result.contributionPercent, 0);
  assert.equal(oneCent.result.breakEvenRevenue, 900000000000);
  assert.equal(oneCent.result.operationalResult, -59999.99);
});

test('zero declarado permanece zero; desconhecido não vira custo zero', () => {
  const zero = calculate({ ...scenario, purchasesAmount: 0, fixedCosts: 0,
    taxAmount: 0, feesPercent: 0, otherVariableAmount: 0 });
  assert.equal(zero.ok, true);
  assert.equal(zero.result.breakEvenRevenue, 0);
  assert.equal(zero.result.contributionPercent, 100);
  assert.equal(zero.result.operationalResult, 150000);
  for (const field of ['revenue', 'purchasesAmount', 'fixedCosts', 'taxAmount', 'feesPercent', 'otherVariableAmount']) {
    for (const value of [undefined, null, '', '0', NaN, Infinity, -Infinity, -0.001]) {
      const response = validateFinancialInput({ ...scenario, [field]: value });
      assert.equal(response.ok, false, `${field}: ${String(value)}`);
      assert.equal(typeof response.errors[field], 'string');
    }
  }
});

test('limites monetários permitem custos maiores que as vendas e preservam limite de taxas', () => {
  for (const field of ['purchasesAmount', 'taxAmount', 'otherVariableAmount']) {
    assert.equal(calculate({ ...scenario, [field]: 1000000000 }).result.status, 'non_positive_margin');
    assert.equal(calculate({ ...scenario, [field]: 1000000000.01 }).ok, false);
  }
  for (const revenue of [0, 0.001, 1000000000.01]) assert.equal(calculate({ ...scenario, revenue }).ok, false);
  assert.equal(calculate({ ...scenario, feesPercent: 100 }).result.status, 'non_positive_margin');
  assert.equal(calculate({ ...scenario, feesPercent: 100.01 }).ok, false);
  assert.equal(calculate({ ...scenario, fixedCosts: 1000000000 }).ok, true);
  assert.equal(calculate({ ...scenario, fixedCosts: 1000000000.01 }).ok, false);
  const maximum = calculate({ ...scenario, revenue: 1000000000, purchasesAmount: 1000000000,
    taxAmount: 1000000000, otherVariableAmount: 1000000000, fixedCosts: 1000000000, feesPercent: 100 });
  assert.equal(maximum.result.contributionPercent, -300);
  assert.equal(maximum.result.operationalResult, -4000000000);
});

test('modo de compras exige último mês, base bruta e imposto em reais sem campos legados concorrentes', () => {
  for (const patch of [
    { referenceBasis: undefined }, { referenceBasis: 'monthly_average_12m' },
    { period: '2026-08' }, { period: null }, { revenueBasis: 'net' },
    { taxInputMode: undefined }, { taxInputMode: 'percent' },
    { cmvPercent: 0 }, { cmvPercent: null }, { otherVariablePercent: 0 },
    { taxPercent: 0 }, { cmvAmount: 0 }, { cmvInputMode: 'amount' },
  ]) assert.equal(calculate({ ...scenario, ...patch }).ok, false, JSON.stringify(patch));
  for (const costInputMode of [undefined, null, '', 'amount', 'percent', false, 0]) {
    assert.equal(calculate({ ...scenario, costInputMode }).ok, false);
  }
});

test('contratos legados continuam aceitos e recusam campos monetários novos sem o modo', () => {
  const legacyPe = { tool: 'breakeven', revenueBasis: 'gross', referenceBasis: 'monthly_average_12m',
    revenue: 150000, cmvPercent: 35, fixedCosts: 60000, taxPercent: 8, feesPercent: 2, otherVariablePercent: 5 };
  const legacyCmv = { tool: 'cmv', revenueBasis: 'net', revenue: 150000, cmvPercent: 35, segment: 'pizzaria' };
  const grossCmv = { tool: 'cmv', revenueBasis: 'gross', revenue: 150000, cmvInputMode: 'amount',
    cmvAmount: 52500, segment: 'pizzaria', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION };
  assert.equal(calculate(legacyPe).formulaVersion, 'rook-consultivo-1');
  assert.equal(calculate(legacyPe).result.breakEvenRevenue, 120000);
  assert.equal(calculate(legacyCmv).ok, true);
  assert.equal(calculate(grossCmv).ok, true);
  for (const legacy of [legacyPe, legacyCmv, grossCmv]) {
    for (const patch of [{ purchasesAmount: 0 }, { otherVariableAmount: 0 }, { costInputMode: 'invalid' }]) {
      const response = calculate({ ...legacy, ...patch });
      assert.equal(response.ok, false);
      assert.equal(typeof response.errors.costInputMode, 'string');
    }
  }
  assert.equal(calculate({ ...legacyCmv, costInputMode: 'purchases_amount' }).ok, false);
});
