import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSimulationInput, validateAcquisition } from '../src/lib/acquisition.mjs';
import { readDiagnosticContext } from '../src/lib/diagnostic-context.mjs';
import { buildLeadDescription } from '../src/lib/asaflow-acquisition.mjs';
import { buildInternalLeadCard } from '../src/lib/internal-lead-card.mjs';
import { CMV_TAX_MODEL_VERSION } from '../src/lib/cmv-tax-estimate.mjs';
import { validateFinancialReference } from '../src/lib/financial-reference.mjs';

const city = { id: '3550308', name: 'São Paulo', uf: 'SP' };
const profile = {
  submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste',
  email: 'teste@example.invalid', phone: '11999999999', cityId: city.id, segment: 'a_la_carte',
  revenueBand: 'up_to_100k', usesErp: 'no', consent: true,
};
const receipt = { contactId: '00dc6650-cb48-4f90-b958-4e46d245d512', dealId: 'f5ee6fb0-ae7f-45b8-9a11-e3f5b7cb2095', persistedAt: '2026-09-24T12:00:00.000Z' };
const answersByTool = {
  cmv: { revenueBasis: 'gross', revenue: '100000', cmvInputMode: 'amount', cmvAmount: '35000', segment: profile.segment, taxState: 'SP', taxModelVersion: CMV_TAX_MODEL_VERSION },
  breakeven: { revenue: '150000', cmvPercent: '35', fixedCosts: '60000', taxPercent: '8', feesPercent: '2', otherVariablePercent: '5' },
};
const references = { last_month: 'Último mês informado', monthly_average_12m: 'Média mensal dos últimos 12 meses' };

test('referência de mês legado rejeita quebra de linha final sem normalizar uma data inválida', () => {
  assert.equal(validateFinancialReference({ period: '2026-08' }).ok, true);
  for (const period of ['2026-08\n', '2026-08\r\n']) {
    const validated = validateFinancialReference({ period });
    assert.equal(validated.ok, false);
    assert.ok(validated.errors.period);
    assert.equal(readDiagnosticContext({ sourceId: 'legacy', intent: 'cmv', answers: { period }, simulation: null }), null);
  }
});
function scenario(tool, referenceBasis) {
  const answers = { ...answersByTool[tool], referenceBasis };
  return { sourceId: `test-${tool}`, intent: tool, answers, simulation: buildSimulationInput(answers, tool) };
}
function capture(context) {
  const parsed = validateAcquisition({ ...profile, ...context.answers, intent: context.intent, simulation: context.result?.inputs || null }, [city]);
  assert.equal(parsed.ok, true, JSON.stringify(parsed));
  return parsed.value;
}

test('CMV e PE percorrem contexto, aquisição e cards com referência relativa e nenhuma data fabricada', () => {
  for (const tool of ['cmv', 'breakeven']) {
    for (const [referenceBasis, label] of Object.entries(references)) {
      const original = scenario(tool, referenceBasis);
      const context = readDiagnosticContext(original);
      assert.ok(context);
      assert.equal(context.result.inputs.referenceBasis, referenceBasis);
      assert.equal(Object.hasOwn(context.answers, 'period'), false);
      assert.equal(Object.hasOwn(context.result.inputs, 'period'), false);
      const captured = capture(context);
      assert.equal(captured.period, null);
      assert.equal(captured.referenceBasis, referenceBasis);
      assert.equal(captured.simulation.inputs.revenue, tool === 'cmv' ? 100000 : 150000);
      assert.equal(tool === 'cmv' ? captured.simulation.result.monthlyDifference : captured.simulation.result.breakEvenRevenue, tool === 'cmv' ? 5824 : 120000);
      const description = buildLeadDescription(captured);
      const card = buildInternalLeadCard({ lead: captured, receipt });
      assert.ok(description.includes(label));
      assert.ok(card.body.includes(label));
      assert.doesNotMatch(description, /mês (?:null|undefined)|"period"|Cenário financeiro.*2026-09/);
      assert.doesNotMatch(card.body, /Diagnóstico:.*(?:null|undefined|2026-09)/);
      assert.deepEqual(original, scenario(tool, referenceBasis));
    }
  }
});

test('referência e dados conhecidos sobrevivem ao diagnóstico incompleto sem estimar os ausentes', () => {
  for (const tool of ['cmv', 'breakeven']) {
    for (const [referenceBasis, label] of Object.entries(references)) {
      const original = scenario(tool, referenceBasis);
      const unknownField = tool === 'cmv' ? 'cmvAmount' : 'fixedCosts';
      const context = readDiagnosticContext({ ...original, simulation: null, unknown: { [unknownField]: true } });
      assert.ok(context);
      assert.equal(context.answers[unknownField], undefined);
      const captured = capture(context);
      assert.equal(captured.referenceBasis, referenceBasis);
      assert.equal(captured.period, null);
      assert.equal(captured.simulation, null);
      assert.ok(captured.diagnosticNotes.join('\n').includes(label));
      assert.match(captured.diagnosticNotes.join('\n'), /não foi emitido resultado financeiro/);
      assert.doesNotMatch(captured.diagnosticNotes.join('\n'), /Mês:|Referência:.*2026-09/);
      assert.equal(buildInternalLeadCard({ lead: captured, receipt }).diagnostic.status, 'incomplete');
    }
  }
});

test('referência inválida ou concorrente não desaparece na filtragem do contexto', () => {
  const original = scenario('cmv', 'last_month');
  for (const patch of [{ referenceBasis: 'invalid' }, { referenceBasis: null }, { referenceBasis: '' },
    { period: '2026-08' }, { period: null }, { period: 202608 }]) {
    assert.equal(readDiagnosticContext({ ...original, answers: { ...original.answers, ...patch } }), null, JSON.stringify(patch));
  }
  const legacy = { ...original.answers, period: '2026-08' };
  delete legacy.referenceBasis;
  assert.equal(readDiagnosticContext({ ...original, answers: { ...legacy, referenceBasis: null } }), null);
  assert.equal(readDiagnosticContext({ ...original, unknown: { referenceBasis: true } }), null);
});

test('referência conflitante entre respostas e números exige recálculo no contexto, servidor e card', () => {
  const original = scenario('cmv', 'last_month');
  const changed = { ...original.answers, referenceBasis: 'monthly_average_12m' };
  assert.equal(readDiagnosticContext({ ...original, answers: changed }), null);
  const incompatible = validateAcquisition({ ...profile, ...changed, intent: 'cmv', simulation: original.simulation }, [city]);
  assert.equal(incompatible.ok, false);
  assert.match(incompatible.errors.simulation, /referência/);
  const captured = capture(readDiagnosticContext(original));
  assert.throws(() => buildInternalLeadCard({ lead: { ...captured, referenceBasis: 'monthly_average_12m' }, receipt }), /invalid_lead_diagnostic/);
  assert.throws(() => buildInternalLeadCard({ lead: { ...captured, period: '2026-08' }, receipt }), /invalid_lead_diagnostic/);
});

test('aquisição rejeita duas referências sem escolher uma, inclusive antes de concluir o diagnóstico', () => {
  const original = scenario('cmv', 'last_month');
  for (const simulation of [null, original.simulation]) {
    const parsed = validateAcquisition({ ...profile, ...original.answers, period: '2026-08', intent: 'cmv', simulation }, [city]);
    assert.equal(parsed.ok, false);
    assert.ok(parsed.errors.referenceBasis);
  }
  const inputs = buildSimulationInput({ ...original.answers, period: '2026-08' }, 'cmv');
  assert.equal(inputs.period, '2026-08');
  assert.equal(inputs.referenceBasis, 'last_month');
});

test('média e perfil máximo preservam o cenário completo dentro do teto dos cards', () => {
  const context = readDiagnosticContext(scenario('cmv', 'monthly_average_12m'));
  const captured = capture(context);
  const expanded = { ...captured, name: 'N'.repeat(120), company: 'E'.repeat(160), email: `${'a'.repeat(240)}@example.test`,
    usesErp: true, erp: 'other', erpOther: 'E'.repeat(100),
    attribution: Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].map(key => [key, 'C'.repeat(200)])),
  };
  assert.ok(buildLeadDescription(expanded).length <= 5000);
  assert.ok(buildInternalLeadCard({ lead: expanded, receipt }).body.length <= 3500);
});
