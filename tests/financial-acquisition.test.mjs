import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFinancialAcquisition } from '../src/lib/financial-acquisition.mjs';
import { financialInput, financialLead } from './helpers/financial-acquisition-route.mjs';

test('captação canônica usa apenas cadastro, números recalculados e qualificação conhecida', () => {
  const parsed = validateFinancialAcquisition({ ...financialLead,
    name: ' Pessoa Teste ', email: ' TESTE@EXAMPLE.INVALID ', phone: '+55 (11) 99999-9999',
    captureKind: 'demo', intent: 'demo', demonstrationRequested: true, consent: true,
    company: 'Não coletado', city: { name: 'Não coletado', uf: 'RJ' }, usesErp: false,
    revenueBand: 'above_300k', segment: 'pizzaria', taxState: 'RJ',
    simulation: { ...financialInput, summary: 'Lucro garantido', result: { estimatedTaxAmount: 0 } },
  });
  assert.equal(parsed.ok, true);
  const lead = parsed.value;
  assert.equal(lead.name, 'Pessoa Teste');
  assert.equal(lead.email, 'teste@example.invalid');
  assert.equal(lead.phone, '+5511999999999');
  assert.equal(lead.captureKind, 'financial_tool');
  assert.equal(lead.intent, 'cmv');
  assert.equal(lead.demonstrationRequested, false);
  assert.equal(lead.commercialContactRequested, false);
  assert.equal(lead.segment, 'hamburgueria');
  assert.equal(lead.taxState, 'SP');
  assert.equal(lead.revenueBand, 'up_to_100k');
  assert.equal(lead.simulation.result.estimatedTaxAmount, 8825);
  assert.notEqual(lead.simulation.summary, 'Lucro garantido');
  for (const field of ['company', 'city', 'usesErp', 'erp', 'erpOther', 'consent', 'antiBot']) assert.equal(Object.hasOwn(lead, field), false, field);
});

test('contato comercial é opcional e só um booleano explícito pode solicitá-lo', () => {
  for (const value of [undefined, false, true]) {
    const parsed = validateFinancialAcquisition({ ...financialLead, commercialContactRequested: value });
    assert.equal(parsed.ok, true);
    assert.equal(parsed.value.commercialContactRequested, value === true);
  }
  for (const value of ['true', 'false', 1, null, {}]) {
    const parsed = validateFinancialAcquisition({ ...financialLead, commercialContactRequested: value });
    assert.equal(parsed.ok, false);
    assert.ok(parsed.errors.commercialContactRequested);
  }
});

test('identidade incompleta, longa ou sem UUIDv4 falha sem produzir lead', () => {
  for (const [field, invalid] of [
    ['name', ''], ['name', 'x'.repeat(121)], ['name', 'Nome\nInjetado'],
    ['email', 'sem-arroba'], ['email', `${'a'.repeat(250)}@example.invalid`],
    ['phone', '123'], ['phone', null], ['phone', 11999999999],
    ['submissionId', 'bb189bc0-1c1d-1cca-8400-44acb47fbda8'],
  ]) {
    const parsed = validateFinancialAcquisition({ ...financialLead, [field]: invalid });
    assert.equal(parsed.ok, false, field);
    assert.ok(parsed.errors[field === 'submissionId' ? 'form' : field], field);
    assert.equal(Object.hasOwn(parsed, 'value'), false);
  }
});

test('cenário e referência completos são obrigatórios antes da captação', () => {
  for (const simulation of [undefined, null, {}, [], 'inválido',
    { ...financialInput, revenue: undefined }, { ...financialInput, cmvAmount: undefined },
    { ...financialInput, referenceBasis: undefined }, { ...financialInput, revenue: -1 },
    { ...financialInput, taxState: undefined }, { ...financialInput, taxModelVersion: undefined },
  ]) {
    const parsed = validateFinancialAcquisition({ ...financialLead, simulation });
    assert.equal(parsed.ok, false, JSON.stringify(simulation));
    assert.ok(Object.keys(parsed.errors).some(key => key.startsWith('simulation')));
    assert.equal(Object.hasOwn(parsed, 'value'), false);
  }
  for (const candidate of [null, [], 'inválido']) assert.equal(validateFinancialAcquisition(candidate).ok, false);
});

test('ponto de equilíbrio não inventa segmento/UF e CMV líquido não inventa faturamento bruto', () => {
  const simulation = { tool: 'breakeven', referenceBasis: 'monthly_average_12m', revenueBasis: 'gross', revenue: 150000,
    cmvPercent: 35, fixedCosts: 60000, taxInputMode: 'amount', taxAmount: 12000, feesPercent: 2, otherVariablePercent: 5 };
  const pe = validateFinancialAcquisition({ ...financialLead, simulation });
  assert.equal(pe.ok, true);
  assert.equal(pe.value.revenueBand, '100k_to_200k');
  assert.equal(pe.value.simulation.result.breakEvenRevenue, 120000);
  assert.equal(Object.hasOwn(pe.value, 'segment'), false);
  assert.equal(Object.hasOwn(pe.value, 'taxState'), false);
  const cmv = validateFinancialAcquisition({ ...financialLead, simulation: {
    tool: 'cmv', referenceBasis: 'last_month', revenueBasis: 'net', revenue: 90000, cmvPercent: 35, segment: 'other',
  } });
  assert.equal(cmv.ok, true);
  assert.equal(Object.hasOwn(cmv.value, 'revenueBand'), false);
});
