import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSimulationInput, validateAcquisition } from '../src/lib/acquisition.mjs';
import { calculateFinancialSimulation } from '../src/lib/financial-simulation.mjs';
import { readDiagnosticContext } from '../src/lib/diagnostic-context.mjs';
import { toPublicFinancialSimulation } from '../src/lib/public-financial-simulation.mjs';
import { buildLeadDescription } from '../src/lib/asaflow-acquisition.mjs';
import { buildInternalLeadCard } from '../src/lib/internal-lead-card.mjs';
import { financialRequest, loadFinancialRoute } from './helpers/financial-acquisition-route.mjs';

const answers = {
  referenceBasis: 'last_month', revenueBasis: 'gross', costInputMode: 'purchases_amount',
  revenue: '150.000,00', purchasesAmount: '52.500,00', fixedCosts: '60.000,00',
  taxInputMode: 'amount', taxAmount: '12.000,00', feesPercent: '2,00', otherVariableAmount: '7.500,00',
};
const city = { id: '3550308', name: 'São Paulo', uf: 'SP' };
const profile = {
  submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste',
  email: 'teste@example.invalid', phone: '11999999999', cityId: city.id, segment: 'a_la_carte',
  revenueBand: '100k_to_200k', usesErp: 'no', consent: true,
};
const receipt = { contactId: '00dc6650-cb48-4f90-b958-4e46d245d512', dealId: 'f5ee6fb0-ae7f-45b8-9a11-e3f5b7cb2095', persistedAt: '2026-09-27T03:00:00.000Z' };
const input = buildSimulationInput(answers, 'breakeven');

function capture(context) {
  const validated = validateAcquisition({ ...profile, ...context.answers,
    intent: context.intent, simulation: context.result?.inputs || null }, [city]);
  assert.equal(validated.ok, true, JSON.stringify(validated));
  return validated.value;
}

test('adaptador preserva reais, centavos e proveniência sem transformar compras em CMV percentual', () => {
  const value = buildSimulationInput({ ...answers, purchasesAmount: '52.500,19', otherVariableAmount: '7.500,37' }, 'breakeven');
  assert.deepEqual(value, {
    tool: 'breakeven', referenceBasis: 'last_month', revenueBasis: 'gross', costInputMode: 'purchases_amount',
    revenue: 150000, purchasesAmount: 52500.19, fixedCosts: 60000, taxInputMode: 'amount',
    taxAmount: 12000, feesPercent: 2, otherVariableAmount: 7500.37,
  });
});

test('contexto da demonstração transporta compras e captação recalcula o cenário com as unidades originais', () => {
  const context = readDiagnosticContext({ sourceId: 'diagnostico', intent: 'breakeven', answers, simulation: input });
  assert.ok(context);
  assert.deepEqual(context.answers, answers);
  assert.equal(Object.hasOwn(context.result, 'result'), false);
  const lead = capture(context);
  assert.equal(lead.simulation.result.breakEvenRevenue, 120000);
  assert.deepEqual(lead.simulation.inputs, input);
  const description = buildLeadDescription(lead);
  for (const field of ['costInputMode', 'purchasesAmount', 'taxAmount', 'otherVariableAmount']) assert.ok(description.includes(field));
  assert.doesNotMatch(description, /"cmvPercent"|"otherVariablePercent"|undefined%|NaN/);
  const card = buildInternalLeadCard({ lead, receipt });
  assert.match(card.body, /Compras de ingredientes e bebidas: R\$\s*52\.500,00/);
  assert.match(card.body, /Outros variáveis: R\$\s*7\.500,00/);
  assert.match(card.body, /não CMV apurado/);
  assert.match(card.body, /Variações de estoque/);
  assert.doesNotMatch(card.body, /CMV:|undefined%|NaN/);
  assert.equal(card.diagnostic.provenance, 'rook_deterministic_engine');
});

test('API real recalcula e devolve compras em reais após a persistência simulada, preservando o contexto de ida e volta', async () => {
  const route = loadFinancialRoute();
  const response = await route.post(financialRequest({ simulation: {
    ...input, result: { breakEvenRevenue: 1 }, summary: 'Resultado não confiável do navegador',
  } }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.simulation.result.breakEvenRevenue, 120000);
  assert.deepEqual(body.simulation.inputs, input);
  assert.deepEqual(route.calls.crm[0].simulation.inputs, input);
  assert.equal(route.calls.crm[0].simulation.result.breakEvenRevenue, 120000);
  assert.equal(route.calls.crm[0].demonstrationRequested, false);
  assert.match(body.simulation.notice, /compras informadas, não no CMV apurado/);
  assert.match(body.simulation.notice, /Variações de estoque podem alterar o resultado/);
  assert.doesNotMatch(JSON.stringify(body), /assumptions|formulaVersion|contributionPercent|operationalResult|Resultado não confiável/);

  const context = readDiagnosticContext({ sourceId: 'diagnostico', intent: 'breakeven', answers,
    simulation: body.simulation.inputs });
  assert.ok(context);
  assert.equal(capture(context).simulation.result.breakEvenRevenue, 120000);
  assert.equal(route.calls.network, 0);
});

test('card recalcula compras atualizadas e desconsidera resultado financeiro anexado', () => {
  const context = readDiagnosticContext({ sourceId: 'diagnostico', intent: 'breakeven', answers, simulation: input });
  const lead = capture(context);
  lead.simulation.inputs.purchasesAmount = 67500;
  lead.simulation.result.breakEvenRevenue = 1;
  lead.simulation.summary = 'RESULTADO FORJADO';
  const card = buildInternalLeadCard({ lead, receipt });
  assert.match(card.body, /R\$\s*150\.000,00/);
  assert.match(card.body, /Compras de ingredientes e bebidas: R\$\s*67\.500,00/);
  assert.doesNotMatch(card.body, /RESULTADO FORJADO/);
});

test('compras ou outros custos desconhecidos ficam pendentes em reais, sem reutilizar resposta ou percentual antigo', () => {
  for (const field of ['purchasesAmount', 'otherVariableAmount']) {
    const context = readDiagnosticContext({ sourceId: 'diagnostico', intent: 'breakeven', answers,
      simulation: null, unknown: { [field]: true } });
    assert.ok(context);
    assert.equal(context.answers[field], undefined);
    assert.equal(context.answers.costInputMode, 'purchases_amount');
    const lead = capture(context);
    assert.equal(lead.simulation, null);
    const notes = lead.diagnosticNotes.join('\n');
    assert.match(notes, /Compras de ingredientes e bebidas \(R\$\)/);
    assert.match(notes, /Outros custos variáveis \(R\$\)/);
    assert.match(notes, /Dados ainda não informados:/);
    assert.match(notes, /não CMV apurado/);
    assert.doesNotMatch(notes, /CMV \(%\)|Outros variáveis \(%\)|undefined|NaN/);
    assert.equal(buildInternalLeadCard({ lead, receipt }).diagnostic.status, 'incomplete');
    assert.equal(readDiagnosticContext({ sourceId: 'diagnostico', intent: 'breakeven', answers,
      simulation: input, unknown: { [field]: true } }), null);
  }
});

test('cenário sem margem orienta revisar valores e mantém a ressalva de estoque na projeção pública', () => {
  const calculated = calculateFinancialSimulation({ ...input, purchasesAmount: 130500 });
  const value = toPublicFinancialSimulation(calculated);
  assert.equal(value.ok, true);
  assert.equal(value.result.status, 'non_positive_margin');
  assert.equal(value.result.breakEvenRevenue, null);
  assert.match(value.summary, /Revise os valores informados/);
  assert.doesNotMatch(value.summary, /Revise os percentuais/);
  assert.match(value.notice, /Variações de estoque/);
});
