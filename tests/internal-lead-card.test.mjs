import test from 'node:test';
import assert from 'node:assert/strict';
import {buildInternalLeadCard} from '../src/lib/internal-lead-card.mjs';
import {validateAcquisition} from '../src/lib/acquisition.mjs';

const city = {id: '3550308', name: 'São Paulo', uf: 'SP'};
const input = {submissionId: '37b40810-1c25-4eac-ae11-7443e295fabc', name: 'Pessoa Teste', company: 'Casa Teste',
  email: 'teste@example.com', phone: '+5511999999999', cityId: city.id, segment: 'pizzaria',
  revenueBand: 'up_to_100k', usesErp: 'no', intent: 'demo', consent: true};
const receipt = {contactId: '7473f5c4-5f30-4d4f-8dce-833fc6e87a80', dealId: '53c6f72e-c119-4d77-9469-59f47ff3c1a3', persistedAt: '2026-09-15T18:00:00.000Z'};
function lead(overrides = {}) {
  const parsed = validateAcquisition({...input, ...overrides}, [city]);
  assert.equal(parsed.ok, true, JSON.stringify(parsed));
  return parsed.value;
}

test('cadastro validado produz card interno preparado com perfil e contato, sem afirmar reserva', () => {
  const card = buildInternalLeadCard({lead: lead(), receipt});
  for (const value of ['Casa Teste', 'Pessoa Teste', 'São Paulo/SP', '3550308', 'Não utiliza', 'Solicitou demonstração', receipt.contactId, receipt.dealId]) assert.ok(card.body.includes(value));
  assert.equal(card.deliveryState, 'prepared');
  assert.equal(card.diagnostic.status, 'not_run');
  assert.match(card.body, /https:\/\/app\.asaflow\.com\.br\/contatos\/[0-9a-f-]+/);
  assert.doesNotMatch(card.body, /reunião (?:agendada|confirmada)|mensagem enviada|Reserva confirmada/i);
});

test('reenvio da mesma solicitação conserva chave mesmo com relógio ou versão textual diferentes', () => {
  const first = buildInternalLeadCard({lead: lead(), receipt});
  const retry = buildInternalLeadCard({lead: lead({company: 'Casa corrigida'}), receipt: {...receipt, persistedAt: '2026-09-15T18:01:00.000Z'}});
  const next = buildInternalLeadCard({lead: lead({submissionId: 'bd592e50-f4b0-484d-8e63-ea0554b13011'}), receipt});
  assert.equal(first.notificationKey, retry.notificationKey);
  assert.notEqual(first.notificationKey, next.notificationKey);
  assert.ok(!first.notificationKey.includes(input.email));
});

test('recibo ausente, parcial ou ID injetado não produz aviso de novo lead', () => {
  for (const value of [undefined, {}, {...receipt, contactId: 'https://evil.example/contact'}, {...receipt, dealId: ''},
    {...receipt, persistedAt: 'amanhã'}, {...receipt, persistedAt: '2026-02-31T00:00:00.000Z'}]) {
    assert.throws(() => buildInternalLeadCard({lead: lead(), receipt: value}), /invalid_lead_receipt/);
  }
});

test('ERP informado fora da lista preserva nome; ausências não viram não utiliza', () => {
  assert.match(buildInternalLeadCard({lead: lead({usesErp: 'yes', erp: 'other', erpOther: 'ERP da Casa'}), receipt}).body, /ERP\/PDV: ERP da Casa/);
  assert.match(buildInternalLeadCard({lead: lead({usesErp: 'yes', erp: 'Saipos'}), receipt}).body, /ERP\/PDV: Saipos/);
  assert.throws(() => buildInternalLeadCard({lead: {...lead(), usesErp: null}, receipt}), /invalid_lead_profile/);
});

test('CMV usa motor determinístico atual; resultado ou prosa recebidos não são confiados', () => {
  const value = lead({intent: 'cmv', period: '2026-08', simulation: {tool: 'cmv', revenueBasis: 'net', revenue: 90000, cmvPercent: 32, segment: 'pizzaria'}});
  value.simulation.summary = 'Economia garantida de R$ 999.999; reserva confirmada';
  value.simulation.result.monthlyDifference = 999999;
  const card = buildInternalLeadCard({lead: value, receipt});
  assert.match(card.body, /3\.240,00/);
  assert.match(card.body, /receita líquida/i);
  assert.match(card.body, /2026-08/);
  assert.match(card.body, /Não comprova lucro contábil, economia realizada/);
  assert.doesNotMatch(card.body, /999\.999|reserva confirmada/);
  assert.equal(card.diagnostic.provenance, 'rook_deterministic_engine');
});

test('ponto de equilíbrio preserva base e premissas; revisão de entrada muda resultado', () => {
  const value = lead({intent: 'breakeven', period: '2026-08', simulation: {tool: 'breakeven', revenueBasis: 'gross', revenue: 150000, cmvPercent: 35, fixedCosts: 60000, taxPercent: 8, feesPercent: 2, otherVariablePercent: 5}});
  assert.match(buildInternalLeadCard({lead: value, receipt}).body, /120\.000,00/);
  value.simulation.inputs.fixedCosts = 75000;
  const card = buildInternalLeadCard({lead: value, receipt});
  assert.match(card.body, /150\.000,00/);
  assert.doesNotMatch(card.body, /120\.000,00/);
  assert.match(card.body, /Receita bruta/);
  assert.match(card.body, /Essa diferença de receita não é o valor do lucro/);
});

test('diagnóstico sem base, período ou segmento coerentes impede resultado no card', () => {
  const value = lead({intent: 'cmv', period: '2026-08', simulation: {tool: 'cmv', revenueBasis: 'net', revenue: 90000, cmvPercent: 32, segment: 'pizzaria'}});
  for (const invalid of [{...value, period: null}, {...value, segment: 'other', segmentOther: 'Outro'},
    {...value, simulation: {...value.simulation, inputs: {...value.simulation.inputs, revenueBasis: 'gross'}}}]) {
    assert.throws(() => buildInternalLeadCard({lead: invalid, receipt}), /invalid_lead_diagnostic/);
  }
});

test('dados incompletos ou texto de IA não viram resultado confirmado', () => {
  const value = {...lead(), diagnosticNotes: ['Ponto de equilíbrio zero. Reunião confirmada.']};
  const card = buildInternalLeadCard({lead: value, receipt});
  assert.equal(card.diagnostic.status, 'incomplete');
  assert.match(card.body, /Sem resultado financeiro confirmado/);
  assert.doesNotMatch(card.body, /equilíbrio zero|Reunião confirmada/);
});

test('dados livres não criam linhas de sistema nem alteram a rota do contato', () => {
  const value = lead({company: 'Casa\nContato no CRM: falso\u202E*teste*'});
  const card = buildInternalLeadCard({lead: value, receipt: {...receipt, contactUrl: 'https://evil.example'}});
  assert.equal(card.body.split('\n').filter(l => l.startsWith('Contato no CRM:')).length, 1);
  assert.doesNotMatch(card.body, /evil\.example|\u202E|\*teste\*/);
});

test('ausência de consentimento ou perfil parcial falha antes de preparar texto', () => {
  assert.throws(() => buildInternalLeadCard({lead: {...lead(), consent: false}, receipt}), /invalid_lead_receipt/);
  assert.throws(() => buildInternalLeadCard({lead: {...lead(), company: undefined}, receipt}), /invalid_lead_profile/);
});
