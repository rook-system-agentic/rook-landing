import test from 'node:test';
import assert from 'node:assert/strict';
import {createAsaflowAcquisition,buildLeadDescription} from '../src/lib/asaflow-acquisition.mjs';
const lead={submissionId:'example-uuid',name:'Pessoa Teste',company:'Casa Teste',email:'teste@example.com',phone:'+5511999999999',city:{id:'3550308',name:'São Paulo',uf:'SP'},segment:'pizzaria',segmentOther:null,revenueBand:'up_to_100k',usesErp:false,erp:null,erpOther:null,intent:'demo',simulation:null};
test('contrato oficial cria contato e negócio com chaves distintas e estáveis',async()=>{
 const calls=[];
 const fetchImpl=async(url,options)=>{calls.push({url,...options});return {ok:true,json:async()=>options.method==='GET'?{data:[],nextCursor:null}:{id:url.endsWith('/contacts')?'contact-id':'deal-id'}};};
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'pipeline',stageId:'stage',fetchImpl});
 await client.create(lead);await client.create(lead);
 assert.equal(calls[1].headers['Idempotency-Key'],calls[4].headers['Idempotency-Key']);
 assert.equal(calls[2].headers['Idempotency-Key'],calls[5].headers['Idempotency-Key']);
 const payload=JSON.parse(calls[2].body);assert.equal(payload.stageId,'stage');assert.deepEqual(payload.contactIds,['contact-id']);
 assert.match(payload.description,/Não utiliza/);assert.ok(!('amount' in payload));
});
test('contato existente é preservado; falha no CRM não confirma sucesso',async()=>{
 const methods=[];const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  methods.push(options.method);return options.method==='GET'?{ok:true,json:async()=>({data:[{id:'existing',email:lead.email,phone:lead.phone}],nextCursor:null})}:{ok:false,status:503};
 }});await assert.rejects(()=>client.create(lead),/503/);assert.deepEqual(methods,['GET','POST']);
});
test('configuração ausente não grava e card inclui localização canônica',()=>{
 assert.throws(()=>createAsaflowAcquisition({}),/not_configured/);
 assert.match(buildLeadDescription(lead),/IBGE 3550308/);
});
test('reenvio após resposta perdida reutiliza a solicitação sem criar outro negócio',async()=>{
 let count=0,lost=true;const deals=new Map();
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  if(options.method==='GET')return {ok:true,json:async()=>({data:[{id:'existing',email:lead.email,phone:lead.phone}],nextCursor:null})};
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

test('resposta incompleta ou malformada na busca não cria contato nem negócio',async()=>{
 const invalidResponses=[null,{}, {data:[]}, {data:{},nextCursor:null}, {data:[null],nextCursor:null},
  {data:[{id:'',email:lead.email,phone:lead.phone}],nextCursor:null},
  {data:[{id:'contact',email:12,phone:lead.phone}],nextCursor:null},
  {data:[{id:'contact',email:lead.email,phone:12}],nextCursor:null},
  {data:[],nextCursor:42}, {data:[],nextCursor:''}];
 for(const response of invalidResponses){
  const methods=[];
  const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
   methods.push(options.method);return {ok:true,json:async()=>response};
  }});
  await assert.rejects(()=>client.create(lead),/asaflow_invalid_contacts/);
  assert.deepEqual(methods,['GET']);
 }
});

test('contatos duplicados ou uma página parcial não permitem escolher nem criar contato',async()=>{
 const match={id:'one',email:lead.email,phone:lead.phone};
 for(const response of [
  {data:[match,{...match,id:'two'}],nextCursor:null},
  {data:[match],nextCursor:'next-page'},
  {data:[],nextCursor:'next-page'},
 ]){
  const methods=[];
  const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
   methods.push(options.method);return {ok:true,json:async()=>response};
  }});
  await assert.rejects(()=>client.create(lead),/asaflow_contact_ambiguous/);
  assert.deepEqual(methods,['GET']);
 }
});

test('busca respeita 200 caracteres e preserva a comparação exata de e-mail longo',async()=>{
 const longEmail=`${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(50)}.com`;
 const calls=[];
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  calls.push({url,...options});
  return {ok:true,json:async()=>options.method==='GET' ? {data:[
   {id:'prefix-only',email:longEmail.slice(0,200),phone:lead.phone},
   {id:'exact',email:longEmail.toUpperCase(),phone:lead.phone},
  ],nextCursor:null} : {id:'deal'}};
 }});
 await client.create({...lead,email:longEmail});
 assert.equal(new URL(calls[0].url).searchParams.get('search'),longEmail.slice(0,200));
 assert.deepEqual(calls.map(c=>c.method),['GET','POST']);
 assert.deepEqual(JSON.parse(calls[1].body).contactIds,['exact']);
});

test('criação de contato sem identificador válido interrompe antes do negócio',async()=>{
 for(const response of [null,{}, {id:''}, {id:' '}]){
  const calls=[];
  const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
   calls.push(url);return {ok:true,json:async()=>options.method==='GET'?{data:[],nextCursor:null}:response};
  }});
  await assert.rejects(()=>client.create(lead),/asaflow_invalid_contact/);
  assert.equal(calls.length,2);
  assert.ok(calls.every(url=>!url.endsWith('/deals')));
 }
});

test('contato existente com telefone brasileiro local e e-mail espaçado é reutilizado',async()=>{
 for(const phone of ['(11) 99999-9999','11999999999','+55 (11) 99999-9999']){
  const calls=[];
  const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
   calls.push({url,...options});
   return {ok:true,json:async()=>options.method==='GET'
    ? {data:[{id:'existing-local',email:` ${lead.email.toUpperCase()} `,phone}],nextCursor:null}
    : {id:url.endsWith('/contacts')?'unexpected-contact':'deal'}};
  }});
  const receipt=await client.create(lead);
  assert.equal(receipt.contactId,'existing-local');
  assert.deepEqual(calls.map(call=>call.method),['GET','POST']);
  assert.ok(calls[1].url.endsWith('/deals'));
  assert.deepEqual(JSON.parse(calls[1].body).contactIds,['existing-local']);
 }
});

test('duas identidades equivalentes após normalizar telefone continuam ambíguas',async()=>{
 const methods=[];
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  methods.push(options.method);
  return {ok:true,json:async()=>({data:[
   {id:'local-format',email:lead.email,phone:'(11) 99999-9999'},
   {id:'international-format',email:lead.email.toUpperCase(),phone:lead.phone},
  ],nextCursor:null})};
 }});
 await assert.rejects(()=>client.create(lead),/asaflow_contact_ambiguous/);
 assert.deepEqual(methods,['GET']);
});
