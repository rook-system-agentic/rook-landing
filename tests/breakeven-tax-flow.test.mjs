import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSimulationInput, validateAcquisition } from '../src/lib/acquisition.mjs';
import { readDiagnosticContext } from '../src/lib/diagnostic-context.mjs';
import { buildLeadDescription } from '../src/lib/asaflow-acquisition.mjs';
import { buildInternalLeadCard } from '../src/lib/internal-lead-card.mjs';
import { executeFinancialChatTool as execute } from '../src/lib/financial-chat-tools.mjs';
import { handleFinancialChatToolRequest } from '../src/lib/financial-chat-http.mjs';

const answers = { referenceBasis: 'last_month', revenue: '367.000,00', cmvPercent: '38,00', fixedCosts: '180.000,00',
  taxInputMode: 'amount', taxAmount: '45.000,00', feesPercent: '27,00', otherVariablePercent: '12,00' };
const city = { id: '3550308', name: 'São Paulo', uf: 'SP' };
const profile = { submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste',
  email: 'teste@example.invalid', phone: '11999999999', cityId: city.id, segment: 'a_la_carte',
  revenueBand: 'up_to_100k', usesErp: 'no', consent: true };
const receipt = { contactId: '00dc6650-cb48-4f90-b958-4e46d245d512', dealId: 'f5ee6fb0-ae7f-45b8-9a11-e3f5b7cb2095', persistedAt: '2026-09-25T03:00:00.000Z' };
const toolName = 'estimar_ponto_equilibrio';
const { tool, ...numeric } = buildSimulationInput(answers, 'breakeven');
const chat = { ...numeric, currency: 'BRL', confirmed: true };
const request = candidate => new Request('http://localhost/api/ai/tools/estimar-ponto-equilibrio/', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(candidate),
});

function capture(context) {
  const parsed = validateAcquisition({ ...profile, ...context.answers, intent: context.intent, simulation: context.result?.inputs || null }, [city]);
  assert.equal(parsed.ok, true, JSON.stringify(parsed));
  return parsed.value;
}

test('guia mascarada percorre contexto e captação preservando unidade e cálculo completo no card interno', () => {
  for (const referenceBasis of ['last_month', 'monthly_average_12m']) {
    const values = { ...answers, referenceBasis };
    const input = buildSimulationInput(values, 'breakeven');
    assert.equal(input.taxAmount, 45000);
    assert.equal(input.taxPercent, undefined);
    const context = readDiagnosticContext({ sourceId: 'tax-test', intent: 'breakeven', answers: values, simulation: input });
    assert.ok(context);
    assert.equal(context.result.inputs.taxInputMode, 'amount');
    assert.equal(Object.hasOwn(context.result, 'result'), false);
    const lead = capture(context);
    assert.equal(lead.simulation.result.breakEvenRevenue, 1676224.31);
    assert.equal(lead.simulation.inputs.taxAmount, 45000);
    assert.equal(lead.simulation.inputs.taxPercent, undefined);
    assert.equal(lead.simulation.inputs.referenceBasis, referenceBasis);
    const description = buildLeadDescription(lead);
    const card = buildInternalLeadCard({ lead, receipt });
    assert.ok(description.includes('taxAmount'));
    assert.match(card.body, /Impostos: R\$\s*45\.000,00 \(guia informada\)/);
    assert.doesNotMatch(card.body, /undefined%|NaN/);
  }
});

test('guia desconhecida chega como pendência, sem imposto zero ou percentual de outra unidade', () => {
  const context = readDiagnosticContext({ sourceId: 'tax-test', intent: 'breakeven', answers,
    simulation: null, unknown: { taxAmount: true } });
  assert.ok(context);
  assert.equal(context.answers.taxInputMode, 'amount');
  assert.equal(context.answers.taxAmount, undefined);
  const lead = capture(context);
  assert.equal(lead.simulation, null);
  assert.equal(buildInternalLeadCard({ lead, receipt }).diagnostic.status, 'incomplete');
  assert.match(lead.diagnosticNotes.join('\n'), /Impostos sobre vendas informados \(R\$\)/);
  assert.doesNotMatch(lead.diagnosticNotes.join('\n'), /Impostos \(%\): 0/);
});

test('chat confirma modo e valor original antes de calcular, e solicita somente a guia quando faltar', () => {
  for (const taxAmount of [undefined, null]) {
    const result = execute(toolName, { ...chat, taxAmount });
    assert.equal(result.status, 'needs_information');
    assert.deepEqual(result.missingFields, ['taxAmount']);
  }
  const confirm = execute(toolName, { ...chat, confirmed: false });
  assert.equal(confirm.status, 'needs_confirmation');
  assert.equal(confirm.inputs.taxAmount, 45000);
  assert.equal(confirm.inputs.taxInputMode, 'amount');
  assert.equal(confirm.inputs.taxPercent, undefined);
  assert.equal(confirm.result, undefined);
  assert.equal(execute(toolName, chat).result.breakEvenRevenue, 1676224.31);
  assert.equal(execute(toolName, { ...chat, taxAmount: 0 }).status, 'success');
  for (const patch of [{ taxPercent: 0 }, { taxPercent: 12.26 }, { taxInputMode: undefined }, { taxInputMode: 'percent' }, { taxInputMode: 'unknown' }]) {
    assert.equal(execute(toolName, { ...chat, ...patch }).status, 'invalid_input', JSON.stringify(patch));
  }
});

test('HTTP preserva imposto informado em reais e protege memória de cálculo em confirmação e sucesso', async () => {
  for (const confirmed of [false, true]) {
    const response = await handleFinancialChatToolRequest(request({ ...chat, confirmed }), toolName);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, confirmed ? 'success' : 'needs_confirmation');
    assert.equal(body.inputs.taxInputMode, 'amount');
    assert.equal(body.inputs.taxAmount, 45000);
    assert.equal(body.inputs.taxPercent, undefined);
    assert.doesNotMatch(JSON.stringify(body), /assumptions|formulaVersion|contributionPercent|operationalResult|estimatedTaxPercent/);
    if (confirmed) assert.equal(body.result.breakEvenRevenue, 1676224.31);
  }
});
