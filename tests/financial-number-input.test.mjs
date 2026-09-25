import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPastedFinancialNumber as format } from '../src/lib/financial-number-input.mjs';
import { buildSimulationInput } from '../src/lib/acquisition.mjs';
import { calculateFinancialSimulation as calculate } from '../src/lib/financial-simulation.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-tax-estimate.mjs';

const cmvAnswers = {
  referenceBasis: 'last_month', revenueBasis: 'gross', cmvInputMode: 'amount',
  taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION, segment: 'a_la_carte',
  revenue: '100.000,50', cmvAmount: '35.000,25',
};

test('máscara mantém reais inteiros e centavos nas formas de colagem aceitas', () => {
  for (const value of ['2500000', '2.500.000', '2.500.000,00', 'R$ 2.500.000,00']) {
    assert.equal(format(value), '2.500.000,00', value);
  }
  for (const value of ['2500000.50', '2500000,50', '2.500.000,50', ' R$ 2.500.000,50 ']) {
    assert.equal(format(value), '2.500.000,50', value);
  }
  assert.equal(format('1.234'), '1.234,00');
  assert.equal(format('1.5'), '1,50');
  assert.equal(format('8,25%'), '8,25');
  assert.equal(format('8.25%'), '8,25');
});

test('zero explícito continua distinto de ausência de informação', () => {
  for (const value of ['0', '0,00', '0.00', 'R$ 0,00']) assert.equal(format(value), '0,00');
  for (const value of ['', ' ', 'R$', '%']) assert.equal(format(value), null);

  const zeroCost = calculate(buildSimulationInput({ ...cmvAnswers, cmvAmount: format('0') }, 'cmv'));
  assert.equal(zeroCost.ok, true);
  assert.equal(zeroCost.inputs.cmvAmount, 0);
  assert.equal(zeroCost.result.comparisonCmvPercent, 0);

  for (const cmvAmount of [format(''), undefined]) {
    const missing = calculate(buildSimulationInput({ ...cmvAnswers, cmvAmount }, 'cmv'));
    assert.equal(missing.ok, false);
    assert.ok(missing.errors.cmvAmount);
  }
  const zeroRevenue = calculate(buildSimulationInput({ ...cmvAnswers, revenue: format('0') }, 'cmv'));
  assert.equal(zeroRevenue.ok, false);
  assert.ok(zeroRevenue.errors.revenue);
});

test('colagem negativa preserva o sinal para rejeição pelo motor financeiro', () => {
  assert.equal(format('-100'), '-100,00');
  assert.equal(format('R$ -1.500,50'), '-1.500,50');
  assert.equal(format('-8.25%'), '-8,25');
  for (const field of ['revenue', 'cmvAmount']) {
    const input = buildSimulationInput({ ...cmvAnswers, [field]: format('-1500.50') }, 'cmv');
    assert.equal(input[field], -1500.5);
    const rejected = calculate(input);
    assert.equal(rejected.ok, false);
    assert.ok(rejected.errors[field]);
  }
});

test('colagem inválida ou com precisão excessiva não é reinterpretada nem arredondada', () => {
  for (const value of ['abc', 'Infinity', 'NaN', '1e3', '1,2,3', '1,234.56', '1.234.5',
    '1..5', '1.', '1.234,567', '1234.567', '0,001', '12,345', '100 mil', '9'.repeat(41)]) {
    assert.equal(format(value), null, value);
  }
});

test('valor formatado chega ao CMV com a mesma quantia e centavos, sem reescala', () => {
  for (const [revenue, cmvAmount] of [
    ['100000.50', '35000.25'], ['100.000,50', '35.000,25'], ['R$ 100.000,50', 'R$ 35.000,25'],
  ]) {
    const input = buildSimulationInput({ ...cmvAnswers, revenue: format(revenue), cmvAmount: format(cmvAmount) }, 'cmv');
    assert.equal(input.revenue, 100000.5);
    assert.equal(input.cmvAmount, 35000.25);
    const result = calculate(input);
    assert.equal(result.ok, true);
    assert.equal(result.inputs.revenue, 100000.5);
    assert.equal(result.inputs.cmvAmount, 35000.25);
    assert.equal(result.result.estimatedTaxAmount, 8825.05);
    assert.equal(result.result.estimatedNetRevenue, 91175.45);
    assert.equal(result.result.monthlyDifference, 5824.11);
    assert.equal(result.result.comparisonCmvPercent, 35000.25 / 91175.45 * 100);
  }
});

test('percentuais e custos com máscara preservam o ponto de equilíbrio', () => {
  const answers = {
    referenceBasis: 'monthly_average_12m', revenue: format('150000.50'),
    fixedCosts: format('60.000,25'), cmvPercent: format('35.25%'),
    taxPercent: format('8,5%'), feesPercent: format('2.25'), otherVariablePercent: format('4'),
  };
  const input = buildSimulationInput(answers, 'breakeven');
  assert.equal(input.revenue, 150000.5);
  assert.equal(input.fixedCosts, 60000.25);
  assert.equal(input.cmvPercent, 35.25);
  assert.equal(input.taxPercent, 8.5);
  assert.equal(input.feesPercent, 2.25);
  assert.equal(input.otherVariablePercent, 4);
  const result = calculate(input);
  assert.equal(result.ok, true);
  assert.equal(result.result.contributionPercent, 50);
  assert.equal(result.result.breakEvenRevenue, 120000.5);
  assert.equal(result.result.revenueGap, 30000);
  assert.equal(result.result.operationalResult, 15000);

  for (const taxPercent of ['-8,25', '100,01']) {
    const rejected = calculate(buildSimulationInput({ ...answers, taxPercent: format(taxPercent) }, 'breakeven'));
    assert.equal(rejected.ok, false);
    assert.ok(rejected.errors.taxPercent);
  }
});

test('máscara não limita silenciosamente uma quantia fora do intervalo permitido', () => {
  const input = buildSimulationInput({ ...cmvAnswers, revenue: format('1.000.000.000,01') }, 'cmv');
  assert.equal(input.revenue, 1000000000.01);
  const result = calculate(input);
  assert.equal(result.ok, false);
  assert.ok(result.errors.revenue);
});
