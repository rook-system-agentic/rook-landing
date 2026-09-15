import test from 'node:test';
import assert from 'node:assert/strict';
import {createAsaflowAcquisition,buildLeadDescription} from '../src/lib/asaflow-acquisition.mjs';
const lead={submissionId:'example-uuid',name:'Pessoa Teste',company:'Casa Teste',email:'teste@example.com',phone:'+5511999999999',city:{id:'3550308',name:'São Paulo',uf:'SP'},segment:'pizzaria',segmentOther:null,revenueBand:'up_to_100k',usesErp:false,erp:null,erpOther:null,intent:'demo',simulation:null};
test('contrato oficial cria contato e negócio com chaves distintas e estáveis',async()=>{
 const calls=[];
 const fetchImpl=async(url,options)=>{calls.push({url,...options});return {ok:true,json:async()=>options.method==='GET'?{data:[]}:{id:url.endsWith('/contacts')?'contact-id':'deal-id'}};};
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'pipeline',stageId:'stage',fetchImpl});
 await client.create(lead);await client.create(lead);
 assert.equal(calls[1].headers['Idempotency-Key'],calls[4].headers['Idempotency-Key']);
 assert.equal(calls[2].headers['Idempotency-Key'],calls[5].headers['Idempotency-Key']);
 const payload=JSON.parse(calls[2].body);assert.equal(payload.stageId,'stage');assert.deepEqual(payload.contactIds,['contact-id']);
 assert.match(payload.description,/Não utiliza/);assert.ok(!('amount' in payload));
});
test('contato existente é preservado; falha no CRM não confirma sucesso',async()=>{
 const methods=[];const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  methods.push(options.method);return options.method==='GET'?{ok:true,json:async()=>({data:[{id:'existing',email:lead.email,phone:lead.phone}]})}:{ok:false,status:503};
 }});await assert.rejects(()=>client.create(lead),/503/);assert.deepEqual(methods,['GET','POST']);
});
test('configuração ausente não grava e card inclui localização canônica',()=>{
 assert.throws(()=>createAsaflowAcquisition({}),/not_configured/);
 assert.match(buildLeadDescription(lead),/IBGE 3550308/);
});
test('reenvio após resposta perdida reutiliza a solicitação sem criar outro negócio',async()=>{
 let count=0,lost=true;const deals=new Map();
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  if(options.method==='GET')return {ok:true,json:async()=>({data:[{id:'existing',email:lead.email,phone:lead.phone}]})};
  const key=options.headers['Idempotency-Key'];
  if(!deals.has(key)){count++;deals.set(key,{id:'deal-one',body:options.body});}
  assert.equal(options.body,deals.get(key).body);
  if(lost){lost=false;throw new Error('resposta perdida depois de persistir');}
  return {ok:true,json:async()=>({id:deals.get(key).id})};
 }});
 await assert.rejects(()=>client.create(lead));
 assert.equal((await client.create(lead)).dealId,'deal-one');
 assert.equal(count,1);
});
test('resultado financeiro e premissas seguem no card',()=>{
 const simulation={summary:'Diferença indicativa de R$ 6.000,00.',inputs:{tool:'cmv',revenue:100000,cmvPercent:38},formulaVersion:'rook-consultivo-1',assumptions:['Não comprova economia realizada.']};
 const description=buildLeadDescription({...lead,period:'2026-08',simulation});
 for(const part of ['2026-08','100000','38','6.000','rook-consultivo-1','Não comprova'])assert.ok(description.includes(part));
});
