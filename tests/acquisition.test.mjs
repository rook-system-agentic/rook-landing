import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAcquisition,searchMunicipalities,normalizePhone,deriveRevenueBand} from '../src/lib/acquisition.mjs';
const cities=JSON.parse(readFileSync(new URL('../src/data/municipalities.json',import.meta.url)));
const lead={submissionId:'bb189bc0-1c1d-4cca-8400-44acb47fbda8',name:'Pessoa Teste',company:'Casa Teste',email:'teste@example.com',phone:'11999999999',cityId:'3550308',segment:'pizzaria',revenueBand:'up_to_100k',usesErp:'no',consent:true};
test('cidades oficiais preservam homônimos e busca sem acentos',()=>{
 assert.ok(cities.length>5500);assert.equal(searchMunicipalities(cities,'sao paulo SP')[0].id,'3550308');
 const matches=searchMunicipalities(cities,'bom jesus'); assert.ok(new Set(matches.map(c=>c.uf)).size>1);
 assert.equal(validateAcquisition({...lead,cityId:'9999999'},cities).ok,false);
});
test('cadastro valida ERP condicional e elimina valores ocultos',()=>{
 const no=validateAcquisition({...lead,erp:'Saipos',erpOther:'antigo'},cities);assert.equal(no.value.erp,null);
 assert.equal(validateAcquisition({...lead,usesErp:'yes'},cities).ok,false);
 assert.equal(validateAcquisition({...lead,usesErp:'yes',erp:'other'},cities).ok,false);
 assert.equal(validateAcquisition({...lead,usesErp:'yes',erp:'other',erpOther:'Sistema próprio'},cities).value.erpOther,'Sistema próprio');
});
test('resultado financeiro recebido do cliente é recalculado',()=>{
 const parsed=validateAcquisition({...lead,period:'2026-08',simulation:{tool:'cmv',revenueBasis:'net',revenue:100000,cmvPercent:38,segment:'a_la_carte',result:{monthlyDifference:999999}}},cities);
 assert.equal(parsed.value.simulation.result.monthlyDifference,6000);
});
test('consentimento, e-mail, telefone e segmento são validados',()=>{
 for(const patch of [{consent:false},{email:'a'},{phone:'00000000000'},{segment:'other',segmentOther:''}]) assert.equal(validateAcquisition({...lead,...patch},cities).ok,false);
 assert.equal(normalizePhone('(11) 99999-9999'),'+5511999999999'); assert.equal(deriveRevenueBand('100.000,01'),'100k_to_200k');
});

test('caminho não sei preserva números conhecidos sem completar os ausentes com zero',()=>{
 const parsed=validateAcquisition({...lead,intent:'breakeven',period:'2026-08',revenue:'150.000,00',cmvPercent:'35'},cities);
 assert.equal(parsed.ok,true);assert.equal(parsed.value.simulation,null);
 const notes=parsed.value.diagnosticNotes.join(' ');
 assert.match(notes,/Receita mensal \(R\$\): 150000/);assert.match(notes,/CMV \(%\): 35/);
 assert.match(notes,/Dados ainda não informados: Custos fixos/);
 assert.ok(!notes.includes('Custos fixos (R$): 0'));
});
