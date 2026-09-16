import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateFinancialSimulation as calculate, parseBrazilianNumber as parse} from '../src/lib/financial-simulation.mjs';

const cmv = {tool:'cmv',revenueBasis:'net',revenue:100000,cmvPercent:38,segment:'a_la_carte'};
const pe = {tool:'breakeven',revenueBasis:'gross',revenue:150000,cmvPercent:35,fixedCosts:60000,taxPercent:8,feesPercent:2,otherVariablePercent:5};
test('leitura brasileira preserva centavos e percentuais',()=>{
  assert.equal(parse('R$ 1.500,50'),1500.50); assert.equal(parse('8,5%'),8.5);
  for(const value of ['',null,'abc','1.5','1,2,3','Infinity']) assert.equal(parse(value),null);
  assert.equal(parse('-2'),-2);
});
test('CMV compara mesma base com diferença estimada, não lucro',()=>{
  const response=calculate(cmv); assert.equal(response.ok,true);
  assert.equal(response.result.monthlyDifference,6000); assert.equal(response.result.differencePoints,6);
  assert.match(response.summary,/estimada/); assert.equal(response.inputs.revenueBasis,'net');
});
test('dados ausentes, negativos, infinitos ou bases divergentes não geram resultado',()=>{
  for(const revenue of [undefined,null,'100000',0,-1,Infinity,NaN]) assert.equal(calculate({...cmv,revenue}).ok,false);
  assert.equal(calculate({...cmv,revenueBasis:'gross'}).ok,false);
  assert.equal(calculate({...pe,taxPercent:undefined}).ok,false);
});
test('outro segmento não inventa referência',()=>{
  const response=calculate({...cmv,segment:'other'}); assert.equal(response.result.status,'no_reference');
  assert.equal(response.result.referencePercent,null); assert.equal(calculate({...cmv,segment:'inexistente'}).ok,false);
});
test('PE separa contribuição, folga de receita e resultado',()=>{
  const response=calculate(pe); assert.equal(response.ok,true);
  assert.equal(response.result.contributionPercent,50); assert.equal(response.result.breakEvenRevenue,120000);
  assert.equal(response.result.revenueGap,30000); assert.equal(response.result.operationalResult,15000);
});
test('margem zero e negativa não resultam em PE zero ou saúde',()=>{
  for(const taxPercent of [58,60]) {
    const response=calculate({...pe,taxPercent}); assert.equal(response.ok,true);
    assert.equal(response.result.status,'non_positive_margin'); assert.equal(response.result.breakEvenRevenue,null);
    assert.equal(response.result.revenueGap,null);
  }
});
test('zero explícito é diferente de custo fixo ausente',()=>{
  assert.equal(calculate({...pe,fixedCosts:0}).result.breakEvenRevenue,0);
  assert.equal(calculate({...pe,fixedCosts:null}).ok,false);
});
test('entrada não é alterada e recálculo usa novos valores',()=>{
  const frozen=Object.freeze({...cmv}); calculate(frozen);
  assert.equal(calculate({...frozen,revenue:200000}).result.monthlyDifference,12000);
});
test('receita arredondada a zero não gera cenário válido',()=>{
 assert.equal(calculate({tool:'cmv',revenueBasis:'net',revenue:0.001,cmvPercent:38,segment:'a_la_carte'}).ok,false);
});
