import test from 'node:test';
import assert from 'node:assert/strict';
import { readDiagnosticContext } from '../src/lib/diagnostic-context.mjs';
import { buildSimulationInput, validateAcquisition } from '../src/lib/acquisition.mjs';
import { buildLeadDescription } from '../src/lib/asaflow-acquisition.mjs';

const answers = { period: '2026-08', segment: 'pizzaria', revenue: '100000.50', cmvPercent: '32.5' };
const scenario = { sourceId: 'calculadora-cmv', intent: 'cmv', answers, simulation: buildSimulationInput(answers, 'cmv') };
const lead = {
  submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8', name: 'Pessoa Teste', company: 'Casa Teste',
  email: 'teste@example.invalid', phone: '11999999999', cityId: '3550308', segment: 'pizzaria',
  revenueBand: '100k_to_200k', usesErp: 'no', consent: true,
};
const cities = [{ id: '3550308', name: 'São Paulo', uf: 'SP' }];

function capture(context) {
  const parsed = validateAcquisition({
    ...context.answers, ...lead, intent: context.intent, simulation: context.result?.inputs || null,
  }, cities);
  assert.equal(parsed.ok, true);
  return parsed.value;
}

test('cenário recebido preserva mês, base, centavos e resultado até a descrição comercial', () => {
  const context = readDiagnosticContext(scenario);
  assert.equal(context.result.result.monthlyDifference, 4100.02);
  const captured = capture(context);
  assert.equal(captured.intent, 'cmv');
  assert.equal(captured.period, '2026-08');
  assert.equal(captured.simulation.inputs.revenue, 100000.5);
  assert.equal(captured.simulation.inputs.cmvPercent, 32.5);
  assert.equal(captured.simulation.inputs.revenueBasis, 'net');
  assert.match(buildLeadDescription(captured), /Cenário financeiro informado pelo visitante — mês 2026-08:/);
});

test('contexto aceita somente campos financeiros, sem transportar perfil ou contato', () => {
  const context = readDiagnosticContext({ ...scenario, answers: { ...answers, name: 'Não transportar', email: 'privado@example.invalid', fixedCosts: '100' } });
  assert.deepEqual(context.answers, answers);
});

test('não sei retira número anterior e conserva os dados conhecidos no cenário parcial', () => {
  const context = readDiagnosticContext({ ...scenario, simulation: null, unknown: { cmvPercent: true } });
  assert.equal(context.answers.cmvPercent, undefined);
  assert.equal(context.result, null);
  const captured = capture(context);
  assert.match(captured.diagnosticNotes.join('\n'), /Receita mensal \(R\$\): 100000\.5/);
  assert.match(captured.diagnosticNotes.join('\n'), /Dados ainda não informados: CMV \(%\)/);
  assert.doesNotMatch(captured.diagnosticNotes.join('\n'), /32\.5|CMV \(%\): 0/);
});

test('todos desconhecidos conservam período e ausências na descrição, sem resultado inventado', () => {
  const context = readDiagnosticContext({ ...scenario, simulation: null, unknown: { revenue: true, cmvPercent: true } });
  const captured = capture(context);
  assert.equal(captured.simulation, null);
  assert.deepEqual(captured.diagnosticNotes, [
    'Diagnóstico interrompido ou incompleto: não foi emitido resultado financeiro.',
    'Base: receita líquida. Mês: 2026-08.',
    'Dados informados: nenhum valor financeiro informado.',
    'Dados ainda não informados: Receita mensal (R$), CMV (%).',
  ]);
  assert.match(buildLeadDescription(captured), /nenhum valor financeiro informado/);
});

test('ponto de equilíbrio parcial distingue custo zero de valor desconhecido', () => {
  const context = readDiagnosticContext({
    sourceId: 'calculadora-pe', intent: 'breakeven', simulation: null,
    answers: { period: '2026-08', revenue: '150000', cmvPercent: '35', fixedCosts: '0', taxPercent: '8', feesPercent: '2', otherVariablePercent: '3' },
    unknown: { feesPercent: true },
  });
  const captured = capture(context);
  assert.match(captured.diagnosticNotes.join('\n'), /Custos fixos \(R\$\): 0/);
  assert.match(captured.diagnosticNotes.join('\n'), /Dados ainda não informados: Taxas \(%\)/);
  assert.doesNotMatch(captured.diagnosticNotes.join('\n'), /Taxas \(%\): 2/);
});

test('contextos sem origem, mês válido ou ferramenta coerente não entram no formulário', () => {
  for (const invalid of [null, {}, { ...scenario, sourceId: '' }, { ...scenario, intent: 'demo' },
    { ...scenario, answers: { ...answers, period: '2026-13' } },
    { ...scenario, intent: 'breakeven' },
    { ...scenario, unknown: { revenue: true } },
    { ...scenario, simulation: { ...scenario.simulation, revenue: -1 } },
  ]) assert.equal(readDiagnosticContext(invalid), null);
});
