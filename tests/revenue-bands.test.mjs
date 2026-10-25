// Faixas de faturamento do formulário comercial (ROO-1592).
// Fonte da verdade do limite Knight/Rook: classification.knightMaxMonthlyRevenueCents
// do catálogo de billing (snapshot em src/data). Se o catálogo mudar, este teste
// quebra antes de a faixa passar a indicar o plano errado.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  REVENUE_BANDS, LEGACY_REVENUE_BANDS, REVENUE_BAND_PLAN_LABELS, revenueBandInfo,
  deriveRevenueBand, validateAcquisition,
} from '../src/lib/acquisition.mjs';
import {buildContactProperties, buildLeadDescription} from '../src/lib/asaflow-acquisition.mjs';
import {LIMIAR_KNIGHT_CENTAVOS_ESPERADO} from '../src/lib/planos-copy.mjs';

const snapshot = JSON.parse(readFileSync(new URL('../src/data/billing-catalog-v2.snapshot.json', import.meta.url)));
const knightMaxReais = snapshot.catalog.classification.knightMaxMonthlyRevenueCents / 100;
const cities = JSON.parse(readFileSync(new URL('../src/data/municipalities.json', import.meta.url)));
const lead = {submissionId:'bb189bc0-1c1d-4cca-8400-44acb47fbda8',name:'Pessoa Teste',company:'Casa Teste',
  email:'teste@example.com',phone:'11999999999',cityId:'3550308',segment:'pizzaria',usesErp:'no',consent:true};
const contactLead = band => ({submissionId:'example-uuid',name:'Pessoa Teste',company:'Casa Teste',email:'teste@example.com',
  phone:'+5511999999999',city:{id:'3550308',name:'São Paulo',uf:'SP'},segment:'pizzaria',segmentOther:null,
  revenueBand:band,usesErp:false,erp:null,erpOther:null,intent:'demo',consent:true,simulation:null,diagnosticNotes:[]});

test('formulário exibe as cinco faixas atuais, com os mesmos textos da propriedade do AsaFlow', () => {
  assert.deepEqual(REVENUE_BANDS.map(b => b.label), [
    'Até R$ 50 mil',
    'Acima de R$ 50 mil até R$ 100 mil',
    'Acima de R$ 100 mil até R$ 250 mil',
    'Acima de R$ 250 mil até R$ 500 mil',
    'Acima de R$ 500 mil',
  ]);
  const legacy = new Set(LEGACY_REVENUE_BANDS.map(b => b.value));
  for (const band of REVENUE_BANDS) assert.equal(legacy.has(band.value), false, band.value);
});

test('corte Knight/Rook das faixas é o limite oficial do catálogo', () => {
  assert.equal(knightMaxReais, LIMIAR_KNIGHT_CENTAVOS_ESPERADO / 100);
  for (const band of REVENUE_BANDS) {
    const knight = band.upTo !== null && band.upTo <= knightMaxReais;
    assert.equal(band.plan, knight ? 'knight' : 'rook', band.value);
  }
  assert.ok(REVENUE_BANDS.some(b => b.upTo === knightMaxReais), 'uma faixa termina exatamente no limite do Knight');
  assert.deepEqual(Object.keys(REVENUE_BAND_PLAN_LABELS), ['knight', 'rook']);
});

test('faixa derivada do faturamento respeita os limites inclusivos', () => {
  const cases = [['', ''], ['0', ''], ['50.000', 'up_to_50k'], ['50.000,01', '50k_to_100k'],
    ['100.000', '50k_to_100k'], ['100.000,01', '100k_to_250k'], ['250.000', '100k_to_250k'],
    ['250.000,01', '250k_to_500k'], ['500.000', '250k_to_500k'], ['500.000,01', 'above_500k']];
  for (const [input, expected] of cases) assert.equal(deriveRevenueBand(input), expected, input);
});

test('servidor aceita faixas atuais e anteriores e recusa valor desconhecido', () => {
  for (const band of [...REVENUE_BANDS, ...LEGACY_REVENUE_BANDS]) {
    const parsed = validateAcquisition({...lead, revenueBand:band.value}, cities);
    assert.equal(parsed.ok, true, band.value);
    assert.equal(parsed.value.revenueBand, band.value);
  }
  for (const value of ['', 'knight', 'up_to_1m', 'Até R$ 50 mil']) {
    const parsed = validateAcquisition({...lead, revenueBand:value}, cities);
    assert.equal(parsed.ok, false, value);
    assert.ok(parsed.errors.revenueBand, value);
  }
  assert.equal(revenueBandInfo('nao_existe'), null);
});

test('contato novo recebe o plano indicado pela faixa; faixa antiga ambígua não indica plano', () => {
  assert.equal(buildContactProperties(contactLead('up_to_50k')).plano_sugerido, 'Knight');
  assert.equal(buildContactProperties(contactLead('100k_to_250k')).plano_sugerido, 'Knight');
  assert.equal(buildContactProperties(contactLead('250k_to_500k')).plano_sugerido, 'Rook');
  assert.equal(buildContactProperties(contactLead('above_300k')).plano_sugerido, 'Rook');
  const ambiguous = buildContactProperties(contactLead('200k_to_300k'));
  assert.equal(ambiguous.faixa_faturamento, 'Acima de R$ 200 mil até R$ 300 mil');
  assert.equal(Object.hasOwn(ambiguous, 'plano_sugerido'), false);
});

test('descrição do negócio traz a faixa e o plano indicado logo abaixo', () => {
  const lines = buildLeadDescription(contactLead('250k_to_500k')).split('\n');
  const i = lines.indexOf('Faturamento bruto mensal: Acima de R$ 250 mil até R$ 500 mil');
  assert.ok(i > 0);
  assert.equal(lines[i + 1], 'Plano indicado pela faixa: Rook');
  const ambiguous = buildLeadDescription(contactLead('200k_to_300k'));
  assert.match(ambiguous, /Faturamento bruto mensal: Acima de R\$ 200 mil até R\$ 300 mil/);
  assert.doesNotMatch(ambiguous, /Plano indicado pela faixa/);
});
