import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CMV_TAX_MODEL_VERSION,
  CMV_TAX_MODEL_SOURCE,
  TAX_STATES,
  estimateCmvRevenue,
} from '../src/lib/cmv-tax-estimate.mjs';
import { calculateTax } from '../src/lib/vendor/rook-tax-calculator-4b6c69ee.mjs';

// Vetores do diagnóstico Rook no commit 4b6c69ee. As quedas nos limites de
// sublimite/regime são da origem: este adaptador não inventa interpolação.
const boundaryScenarios = [
  [15000, 600, 14400, 'simples_nacional', false],
  [15000.01, 600, 14400.01, 'simples_nacional', false],
  [30000, 1695, 28305, 'simples_nacional', false],
  [30000.01, 1695, 28305.01, 'simples_nacional', false],
  [60000, 4545, 55455, 'simples_nacional', false],
  [60000.01, 4545, 55455.01, 'simples_nacional', false],
  [150000, 14175, 135825, 'simples_nacional', false],
  [150000.01, 14175, 135825.01, 'simples_nacional', false],
  [300000, 35625, 264375, 'simples_nacional', false],
  [300000.01, 26557.5, 273442.51, 'simples_nacional', true],
  [400000, 42392.5, 357607.5, 'simples_nacional', true],
  [400000.01, 27400, 372600.01, 'lucro_presumido', false],
];

test('reproduz as faixas inclusivas e as transições do diagnóstico de origem', () => {
  for (const [gross, taxAmount, netRevenue, regime, sublimitApplied] of boundaryScenarios) {
    const result = estimateCmvRevenue(gross, 'SP');
    assert.deepEqual({
      grossRevenue: result.grossRevenue,
      taxAmount: result.taxAmount,
      netRevenue: result.netRevenue,
      regime: result.regime,
      sublimitApplied: result.sublimitApplied,
    }, { grossRevenue: gross, taxAmount, netRevenue, regime, sublimitApplied });
  }
});

test('deduz apenas tributos sobre vendas no Presumido e preserva IRPJ/CSLL fora do líquido', () => {
  const original = calculateTax(500000, undefined, 'SP');
  const result = estimateCmvRevenue(500000, 'SP');
  assert.ok(original.taxAmount > original.taxOnRevenue);
  assert.equal(result.taxAmount, 34250);
  assert.equal(result.netRevenue, 465750);
  assert.notEqual(result.netRevenue, 500000 - original.taxAmount);
  assert.match(result.assumptions.join(' '), /IRPJ e CSLL não reduzem/);
});

test('UF muda a hipótese de ICMS no sublimite e no Presumido, não cria taxa fixa nacional', () => {
  const scenarios = [
    [350000, 'SP', 34475, 315525],
    [350000, 'DF', 30450, 319550],
    [350000, 'AC', 82775, 267225],
    [500000, 'SP', 34250, 465750],
    [500000, 'DF', 28500, 471500],
  ];
  for (const [gross, state, taxAmount, netRevenue] of scenarios) {
    const result = estimateCmvRevenue(gross, state);
    assert.equal(result.taxAmount, taxAmount);
    assert.equal(result.netRevenue, netRevenue);
    assert.match(result.assumptions.join(' '), new RegExp(`\\(${state}\\)`));
  }
  assert.equal(estimateCmvRevenue(100000, 'SP').taxAmount, 8825);
  assert.equal(estimateCmvRevenue(100000, 'DF').taxAmount, 8825);
});

test('mantém paridade com calculateTax sem regime explícito em todas as UFs', () => {
  assert.equal(TAX_STATES.length, 27);
  assert.equal(new Set(TAX_STATES.map(item => item.code)).size, 27);
  for (const { code } of TAX_STATES) {
    for (const gross of [0.01, 10000.57, 300000, 300000.01, 350000, 400000, 400000.01, 500000, 1_000_000_000]) {
      const original = calculateTax(gross, undefined, code);
      const result = estimateCmvRevenue(gross, code);
      assert.equal(result.taxAmount, Math.round((original.taxOnRevenue + Number.EPSILON) * 100) / 100);
      assert.equal(result.taxPercent, original.taxOnRevenueRate);
      assert.equal(result.regime, original.regime);
      assert.ok(result.netRevenue > 0 && Number.isFinite(result.netRevenue));
    }
  }
});

test('arredonda entrada e imposto em centavos e preserva a identidade bruto menos imposto', () => {
  const result = estimateCmvRevenue(123456.785);
  assert.equal(result.grossRevenue, 123456.79);
  assert.equal(result.taxAmount, 11334.88);
  assert.equal(result.netRevenue, 112121.91);
  assert.equal(Math.round(result.netRevenue * 100), Math.round(result.grossRevenue * 100) - Math.round(result.taxAmount * 100));
  assert.equal(estimateCmvRevenue(300000.004).sublimitApplied, false);
  assert.equal(estimateCmvRevenue(300000.006).sublimitApplied, true);
  assert.equal(estimateCmvRevenue(0.01).netRevenue, 0.01);
});

test('rejeita ausência, valores fora do limite e UF desconhecida sem fallback silencioso', () => {
  for (const gross of [undefined, null, '', '100000', true, {}, [], NaN, Infinity, -Infinity, -1, 0, 0.001, 1_000_000_000.01]) {
    assert.throws(() => estimateCmvRevenue(gross), RangeError);
  }
  for (const state of [null, '', 'sp', 'ZZ', 'BR', 'São Paulo', 1, {}, []]) {
    assert.throws(() => estimateCmvRevenue(100000, state), RangeError);
  }
  assert.equal(estimateCmvRevenue(1_000_000_000).grossRevenue, 1_000_000_000);
});

test('expõe versão, anualização e premissas compactas sem afirmar histórico ou enquadramento real', () => {
  assert.equal(CMV_TAX_MODEL_SOURCE.commit, '4b6c69ee6d20c16c4e21099f2315ab6f0d7abdcf');
  assert.equal(CMV_TAX_MODEL_SOURCE.calculatorVersion, '2.2.0');
  for (const gross of [100000, 350000, 500000]) {
    const result = estimateCmvRevenue(gross);
    const assumptions = result.assumptions.join(' ');
    assert.equal(result.taxModelVersion, CMV_TAX_MODEL_VERSION);
    assert.equal(result.annualRevenue, gross * 12);
    assert.equal(result.state, 'SP');
    assert.match(assumptions, /São Paulo \(SP\)/);
    assert.match(assumptions, /hipótese anual deste modelo, sem consultar histórico fiscal/);
    assert.match(assumptions, /não é apuração fiscal/);
    assert.match(assumptions, /Não comprova enquadramento tributário/);
    assert.match(assumptions, /sem consulta fiscal em tempo real/);
    assert.ok(assumptions.length <= 600);
  }
});
