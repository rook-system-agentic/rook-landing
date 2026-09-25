import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialSimulation as calculate } from '../src/lib/financial-simulation.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-tax-estimate.mjs';
import { buildSimulationInput, validateAcquisition } from '../src/lib/acquisition.mjs';
import { readDiagnosticContext } from '../src/lib/diagnostic-context.mjs';
import { buildLeadDescription } from '../src/lib/asaflow-acquisition.mjs';
import { buildInternalLeadCard } from '../src/lib/internal-lead-card.mjs';

const input = { tool: 'cmv', revenueBasis: 'gross', revenue: 100000, cmvInputMode: 'amount', cmvAmount: 35000,
  segment: 'a_la_carte', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION };
const lead = { submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste', email: 'teste@example.invalid',
  phone: '11999999999', cityId: '3550308', segment: 'a_la_carte', revenueBand: 'up_to_100k', usesErp: 'no', consent: true };
const cities = [{ id: '3550308', name: 'São Paulo', uf: 'SP' }];
const receipt = { contactId: '00dc6650-cb48-4f90-b958-4e46d245d512', dealId: 'f5ee6fb0-ae7f-45b8-9a11-e3f5b7cb2095', persistedAt: '2026-09-24T12:00:00.000Z' };

test('bruto menos impostos do modelo produz líquido e CMV sobre a base correta', () => {
  const calculated = calculate(input);
  assert.equal(calculated.ok, true);
  assert.equal(calculated.result.estimatedTaxAmount, 8825);
  assert.equal(calculated.result.estimatedNetRevenue, 91175);
  assert.equal(calculated.result.cmvAmount, 35000);
  assert.equal(calculated.result.comparisonCmvPercent, 35000 / 91175 * 100);
  assert.equal(calculated.result.monthlyDifference, 5824);
  assert.equal(calculated.inputs.revenue, 100000);
  assert.equal(calculated.inputs.cmvPercent, undefined);
  assert.equal(calculated.formulaVersion, 'rook-cmv-gross-1');
  assert.deepEqual(calculate(calculated.inputs), calculated);
});

test('percentual sobre bruto preserva o custo e não arredonda percentual antes da diferença em reais', () => {
  const calculated = calculate({ ...input, cmvInputMode: 'gross_percent', cmvPercent: 35 });
  assert.equal(calculated.result.cmvAmount, 35000);
  assert.equal(calculated.result.monthlyDifference, 5824);
  assert.equal(calculated.inputs.cmvPercent, 35);
  assert.equal(calculated.inputs.cmvAmount, undefined);
});

test('percentual já líquido não sofre segunda conversão e legado mantém a mesma conta', () => {
  const gross = calculate({ ...input, cmvInputMode: 'net_percent', cmvPercent: 40 });
  assert.equal(gross.result.cmvAmount, 36470);
  assert.equal(gross.result.comparisonCmvPercent, 40);
  assert.equal(gross.result.monthlyDifference, 7294);
  const legacy = calculate({ tool: 'cmv', revenueBasis: 'net', revenue: 100000, cmvPercent: 38, segment: 'a_la_carte' });
  assert.equal(legacy.result.monthlyDifference, 6000);
  assert.equal(legacy.formulaVersion, 'rook-consultivo-1');
});

test('derivado acima de 100% e custo zero explícito são preservados', () => {
  const high = calculate({ ...input, cmvInputMode: 'gross_percent', cmvPercent: 100 });
  assert.ok(high.result.comparisonCmvPercent > 100);
  assert.equal(high.result.cmvAmount, 100000);
  assert.equal(calculate({ ...input, cmvAmount: 0 }).result.comparisonCmvPercent, 0);
  for (const cmvAmount of [null, undefined, NaN, Infinity, -1, '35000']) assert.equal(calculate({ ...input, cmvAmount }).ok, false);
});

test('bruto não pode ser reinterpretado sem modo, versão e UF confirmáveis', () => {
  for (const patch of [{ cmvInputMode: undefined }, { cmvInputMode: 'unknown' }, { taxModelVersion: undefined },
    { taxModelVersion: 'future' }, { taxState: undefined }, { taxState: 'ZZ' }, { revenue: 0.001 },
    { revenue: 0 }, { revenue: -1 }, { revenue: Infinity }, { revenue: '100000' }]) {
    assert.equal(calculate({ ...input, ...patch }).ok, false, JSON.stringify(patch));
  }
  const unknownSegment = calculate({ ...input, segment: 'other' });
  assert.equal(unknownSegment.result.status, 'no_reference');
  assert.equal(unknownSegment.result.estimatedNetRevenue, 91175);
  assert.equal(unknownSegment.result.monthlyDifference, null);
});

test('valores de impostos, líquido e resultados recebidos não são autoridade', () => {
  assert.deepEqual(calculate({ ...input, taxPercent: 0, estimatedTaxAmount: 0, estimatedNetRevenue: 1,
    result: { monthlyDifference: 999999 }, summary: 'lucro garantido' }), calculate(input));
});

test('contexto → cadastro → CRM e card mantêm bruto, imposto estimado e líquido sem dupla dedução', () => {
  const answers = { period: '2026-08', segment: 'a_la_carte', revenue: '100.000,00', cmvAmount: '35.000,00',
    cmvInputMode: 'amount', revenueBasis: 'gross', taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION };
  const context = readDiagnosticContext({ sourceId: 'cmv', intent: 'cmv', answers, simulation: buildSimulationInput(answers, 'cmv') });
  assert.equal(context.result.result, undefined);
  assert.equal(context.result.assumptions, undefined);
  const parsed = validateAcquisition({ ...lead, ...context.answers, intent: 'cmv', simulation: context.result.inputs }, cities);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.simulation.result.estimatedNetRevenue, 91175);
  assert.deepEqual(parsed.value.simulation, calculate(context.result.inputs));
  const description = buildLeadDescription(parsed.value);
  assert.match(description, /100\.000,00.*8\.825,00.*91\.175,00/);
  assert.match(description, /impostos estimados/);
  assert.match(description, /35\.000,00 de ingredientes consumidos/);
  const card = buildInternalLeadCard({ lead: parsed.value, receipt });
  assert.match(card.body, /100\.000,00.*8\.825,00.*91\.175,00/);
  assert.doesNotMatch(card.body, /undefined|NaN/);
  assert.ok(card.body.length <= 3500);
  const tampered = { ...parsed.value, simulation: { ...parsed.value.simulation, result: { estimatedNetRevenue: 1 }, summary: 'inventado' } };
  assert.deepEqual(buildInternalLeadCard({ lead: tampered, receipt }), card);
});

test('CMV não informado conserva o faturamento bruto e não estima um consumo', () => {
  const answers = { period: '2026-08', segment: 'a_la_carte', revenue: '100000', cmvAmount: '35000',
    cmvInputMode: 'amount', revenueBasis: 'gross', taxState: 'DF', taxModelVersion: CMV_TAX_MODEL_VERSION };
  const context = readDiagnosticContext({ sourceId: 'cmv', intent: 'cmv', answers, simulation: null, unknown: { cmvAmount: true } });
  assert.equal(context.answers.cmvAmount, undefined);
  const parsed = validateAcquisition({ ...lead, ...context.answers, intent: 'cmv' }, cities);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.simulation, null);
  assert.match(parsed.value.diagnosticNotes.join('\n'), /Base: receita bruta/);
  assert.match(parsed.value.diagnosticNotes.join('\n'), /Faturamento bruto mensal \(R\$\): 100000/);
  assert.match(parsed.value.diagnosticNotes.join('\n'), /Ingredientes consumidos \(R\$\)/);
  assert.match(parsed.value.diagnosticNotes.join('\n'), /Distrito Federal \(DF\)/);
  assert.ok(parsed.value.diagnosticNotes.join('\n').includes(CMV_TAX_MODEL_VERSION));
  assert.doesNotMatch(parsed.value.diagnosticNotes.join('\n'), /35000|receita líquida\./);
  const invalid = validateAcquisition({ ...lead, ...context.answers, intent: 'cmv', taxState: 'injetado', taxModelVersion: 'injetado' }, cities);
  assert.doesNotMatch(invalid.value.diagnosticNotes.join('\n'), /injetado/);
});

test('perfil e atribuição nos limites não truncam a conta nem excedem os cards do CRM', () => {
  const attribution = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    .map(key => [key, 'Campanha Rook '.repeat(16).slice(0, 200)]));
  for (const cmvInputMode of ['amount', 'gross_percent', 'net_percent']) {
    const parsed = validateAcquisition({ ...lead, name: 'N'.repeat(120), company: 'E'.repeat(160),
      email: `${'a'.repeat(240)}@example.test`, usesErp: 'yes', erp: 'other', erpOther: 'E'.repeat(100),
      intent: 'cmv', period: '2026-08', attribution,
      simulation: { ...input, revenue: 1000000000, cmvAmount: 1000000000, cmvPercent: 100, cmvInputMode, taxState: 'DF' },
    }, cities);
    assert.equal(parsed.ok, true);
    const description = buildLeadDescription(parsed.value);
    assert.ok(description.length <= 5000);
    assert.ok(description.includes(attribution.utm_content));
    assert.ok(description.includes(CMV_TAX_MODEL_VERSION));
    assert.match(description, /Conta:.*faturamento bruto.*impostos estimados.*receita líquida estimada/);
    const card = buildInternalLeadCard({ lead: parsed.value, receipt });
    assert.ok(card.body.length <= 3500);
    assert.match(card.body, /Conta:.*faturamento bruto.*impostos estimados.*receita líquida estimada/);
  }
});
