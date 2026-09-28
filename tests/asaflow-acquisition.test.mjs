import test from 'node:test';
import assert from 'node:assert/strict';
import {createAsaflowAcquisition,buildContactProperties,buildDealProperties,buildLeadDescription} from '../src/lib/asaflow-acquisition.mjs';
import {validateFinancialAcquisition} from '../src/lib/financial-acquisition.mjs';
import {financialLead} from './helpers/financial-acquisition-route.mjs';
import { CONTACT_ID, DEAL_ID } from './helpers/acquisition-ledger.mjs';
const verified=()=>({ok:true,json:async()=>({id:DEAL_ID,contactIds:[CONTACT_ID]})});
const lead={submissionId:'example-uuid',name:'Pessoa Teste',company:'Casa Teste',email:'teste@example.com',phone:'+5511999999999',city:{id:'3550308',name:'São Paulo',uf:'SP'},segment:'pizzaria',segmentOther:null,revenueBand:'up_to_100k',usesErp:false,erp:null,erpOther:null,intent:'demo',simulation:null};
test('contrato oficial cria contato e negócio com chaves distintas e estáveis',async()=>{
 const calls=[];
 const fetchImpl=async(url,options)=>{calls.push({url,...options});if(url.includes('/deals/'))return verified();return {ok:true,json:async()=>options.method==='GET'?{data:[],nextCursor:null}:{id:url.endsWith('/contacts')?CONTACT_ID:DEAL_ID}};};
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'pipeline',stageId:'stage',fetchImpl});
 await client.create(lead);await client.create(lead);
 assert.equal(calls[1].headers['Idempotency-Key'],calls[5].headers['Idempotency-Key']);
 assert.equal(calls[2].headers['Idempotency-Key'],calls[6].headers['Idempotency-Key']);
 const payload=JSON.parse(calls[2].body);assert.equal(payload.stageId,'stage');assert.deepEqual(payload.contactIds,[CONTACT_ID]);
 assert.match(payload.description,/Não utiliza/);assert.ok(!('amount' in payload));
});

test('diagnóstico vindo da Meta grava origem, qualificação e UTMs em campos estruturados',async()=>{
 const paid={...lead,intent:'cmv',usesErp:true,erp:'other',erpOther:'Sistema Casa',attribution:{
  utm_source:'meta',utm_medium:'paid_social',utm_campaign:'[ES] - CMV 26/09',
  utm_term:'gestores_restaurante',utm_content:'video-cmv-a',landing_path:'/calculadora-cmv',
 }};
 assert.deepEqual(buildContactProperties(paid),{
  origem_lead:'Tráfego pago',empresa:'Casa Teste',nome_do_restaurante:'Casa Teste',
  cidade:'São Paulo',uf:'SP',segmento:'Pizzaria',
  faixa_faturamento:'Até R$ 100 mil',faturamento_informado_formulario:'Até R$ 100 mil',
  sistema_atual:'Sistema Casa',
 });
 assert.deepEqual(buildDealProperties(paid),{
  origem:'Tráfego pago',contato_comercial_solicitado:true,
  empresa_cliente:'Casa Teste',landing_page:'/calculadora-cmv',
  plataforma_de_midia:'Meta Ads',parceiro_de_aquisicao:'Escala SaaS',
  utm_source:'meta',utm_medium:'paid_social',utm_campaign:'[ES] - CMV 26/09',
  utm_term:'gestores_restaurante',utm_content:'video-cmv-a',
 });

 const calls=[];
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  calls.push({url,...options});if(url.includes('/deals/'))return verified();
  return {ok:true,json:async()=>options.method==='GET'?{data:[],nextCursor:null}:{id:url.endsWith('/contacts')?CONTACT_ID:DEAL_ID}};
 }});
 await client.create(paid);
 assert.deepEqual(JSON.parse(calls[1].body).properties,buildContactProperties(paid));
 assert.deepEqual(JSON.parse(calls[2].body).properties,buildDealProperties(paid));
});

test('tráfego orgânico das calculadoras permanece Diagnóstico (site), sem inventar Meta',()=>{
 const organic={...lead,intent:'breakeven',segment:'a_la_carte',attribution:{landing_path:'/diagnostico'}};
 assert.equal(buildContactProperties(organic).origem_lead,'Diagnóstico (site)');
 assert.equal(buildContactProperties(organic).segmento,'Restaurante à la carte');
 assert.deepEqual(buildDealProperties(organic),{
  origem:'Diagnóstico (site)',contato_comercial_solicitado:true,
  empresa_cliente:'Casa Teste',landing_page:'/diagnostico',
 });
});
test('contato existente é preservado; falha no CRM não confirma sucesso',async()=>{
 const methods=[];const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  methods.push(options.method);return options.method==='GET'?{ok:true,json:async()=>({data:[{id:CONTACT_ID,email:lead.email,phone:lead.phone}],nextCursor:null})}:{ok:false,status:503};
 }});await assert.rejects(()=>client.create(lead),/503/);assert.deepEqual(methods,['GET','POST']);
});
test('configuração ausente não grava e card inclui localização canônica',()=>{
 assert.throws(()=>createAsaflowAcquisition({}),/not_configured/);
 assert.match(buildLeadDescription(lead),/IBGE 3550308/);
});
test('link do histórico aponta ao ADM do ambiente e não aceita host informado pelo visitante',async()=>{
 const analysisId='6a433339-7c62-4edf-a6ef-f22791875ae3';
 for(const [environment,origin] of [
  ['homolog','https://adm-homolog.rooksystem.com.br'],
  ['production','https://adm.rook.com.br'],
  [undefined,'https://adm.rook.com.br'],
 ]){
  let created;
  const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',environment,fetchImpl:async(url,options)=>{
   if(url.includes('/deals/')) return verified();
   if(options.method==='GET') return {ok:true,json:async()=>({data:[{id:CONTACT_ID,email:lead.email,phone:lead.phone}],nextCursor:null})};
   created=JSON.parse(options.body);
   return {ok:true,json:async()=>({id:DEAL_ID})};
  }});
  await client.create({...lead,analysisId,environment:'https://untrusted.invalid',adminOrigin:'https://untrusted.invalid'});
  const expected=`Histórico interno (acesso restrito): ${origin}/onboarding-diagnosticos?analysis=${analysisId}`;
  assert.ok(created.description.split('\n').includes(expected));
  assert.doesNotMatch(created.description,/untrusted/);
 }
});
test('reenvio após resposta perdida reutiliza a solicitação sem criar outro negócio',async()=>{
 let count=0,lost=true;const deals=new Map();
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  if(url.includes('/deals/'))return verified();
  if(options.method==='GET')return {ok:true,json:async()=>({data:[{id:CONTACT_ID,email:lead.email,phone:lead.phone}],nextCursor:null})};
  const key=options.headers['Idempotency-Key'];
  if(!deals.has(key)){count++;deals.set(key,{id:DEAL_ID,body:options.body});}
  assert.equal(options.body,deals.get(key).body);
  if(lost){lost=false;throw new Error('resposta perdida depois de persistir');}
  return {ok:true,json:async()=>({id:deals.get(key).id})};
 }});
 await assert.rejects(()=>client.create(lead));
 assert.equal((await client.create(lead)).dealId,DEAL_ID);
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
  {data:[{id:CONTACT_ID,email:12,phone:lead.phone}],nextCursor:null},
  {data:[{id:CONTACT_ID,email:lead.email,phone:12}],nextCursor:null},
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
  calls.push({url,...options});if(url.includes('/deals/'))return verified();
  return {ok:true,json:async()=>options.method==='GET' ? {data:[
   {id:'prefix-only',email:longEmail.slice(0,200),phone:lead.phone},
   {id:CONTACT_ID,email:longEmail.toUpperCase(),phone:lead.phone},
  ],nextCursor:null} : {id:DEAL_ID}};
 }});
 await client.create({...lead,email:longEmail});
 assert.equal(new URL(calls[0].url).searchParams.get('search'),longEmail.slice(0,200));
 assert.deepEqual(calls.map(c=>c.method),['GET','POST','GET']);
 assert.deepEqual(JSON.parse(calls[1].body).contactIds,[CONTACT_ID]);
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
   calls.push({url,...options});if(url.includes('/deals/'))return verified();
   return {ok:true,json:async()=>options.method==='GET'
    ? {data:[{id:CONTACT_ID,email:` ${lead.email.toUpperCase()} `,phone}],nextCursor:null}
    : {id:url.endsWith('/contacts')?'unexpected-contact':DEAL_ID}};
  }});
  const receipt=await client.create(lead);
  assert.equal(receipt.contactId,CONTACT_ID);
  assert.deepEqual(calls.map(call=>call.method),['GET','POST','GET']);
  assert.ok(calls[1].url.endsWith('/deals'));
  assert.deepEqual(JSON.parse(calls[1].body).contactIds,[CONTACT_ID]);
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

test('relatório fora do teto falha antes de gravar contato e não corta diagnóstico',async()=>{
 const calls=[];
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(...args)=>{
  calls.push(args);throw new Error('não deve chamar o CRM');
 }});
 await assert.rejects(()=>client.create({...lead,diagnosticNotes:['x'.repeat(5000)]}),/asaflow_description_too_long/);
 assert.equal(calls.length,0);
});

test('captação das ferramentas omite estabelecimento, cidade e ERP desconhecidos do contato e card',()=>{
 const captured=validateFinancialAcquisition(financialLead);
 assert.equal(captured.ok,true);
 assert.deepEqual(buildContactProperties(captured.value),{
  origem_lead:'Diagnóstico (site)',uf:'SP',segmento:'Hamburgueria',
  faixa_faturamento:'Até R$ 100 mil',faturamento_informado_formulario:'Até R$ 100 mil',
 });
 assert.deepEqual(buildDealProperties(captured.value),{
  origem:'Diagnóstico (site)',contato_comercial_solicitado:false,
 });
 const description=buildLeadDescription(captured.value);
 assert.match(description,/Análise solicitada: CMV/);
 assert.match(description,/Demonstração solicitada: não/);
 assert.match(description,/Contato comercial solicitado: não/);
 assert.match(description,/Faturamento bruto mensal: Até R\$ 100 mil/);
 assert.match(description,/UF informada para a estimativa: SP/);
 assert.doesNotMatch(description,/Estabelecimento:|Cidade\/UF:|ERP\/PDV:|Não utiliza|undefined|null/);
});

test('ponto de equilíbrio conserva valores em reais sem inventar qualificação não coletada',async()=>{
 const captured=validateFinancialAcquisition({...financialLead,simulation:{
  tool:'breakeven',referenceBasis:'monthly_average_12m',revenueBasis:'gross',revenue:150000,
  cmvPercent:35,fixedCosts:60000,taxInputMode:'amount',taxAmount:12000,feesPercent:2,otherVariablePercent:5,
 }});
 assert.equal(captured.ok,true);
 assert.deepEqual(buildContactProperties(captured.value),{
  origem_lead:'Diagnóstico (site)',
  faixa_faturamento:'Acima de R$ 100 mil até R$ 200 mil',
  faturamento_informado_formulario:'Acima de R$ 100 mil até R$ 200 mil',
 });
 assert.equal(buildDealProperties(captured.value).contato_comercial_solicitado,false);
 const calls=[];
 const client=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'p',stageId:'s',fetchImpl:async(url,options)=>{
  calls.push({url,...options});if(url.includes('/deals/'))return verified();return {ok:true,json:async()=>options.method==='GET'?{data:[],nextCursor:null}:{id:url.endsWith('/contacts')?CONTACT_ID:DEAL_ID}};
 }});
 await client.create(captured.value);
 const deal=JSON.parse(calls[2].body);
 assert.equal(deal.name,'Ponto de equilíbrio — Pessoa Teste');
 assert.match(deal.description,/Análise solicitada: Ponto de equilíbrio/);
 assert.match(deal.description,/"taxAmount":12000/);
 assert.match(deal.description,/Média mensal dos últimos 12 meses/);
 assert.doesNotMatch(deal.description,/Segmento:|UF informada|Estabelecimento:|Cidade\/UF:|ERP\/PDV:|Não utiliza|undefined|null/);
});

test('consentimento comercial das ferramentas pertence à solicitação atual',()=>{
 const without=validateFinancialAcquisition(financialLead);
 const withContact=validateFinancialAcquisition({...financialLead,commercialContactRequested:true});
 assert.equal(without.ok,true);assert.equal(withContact.ok,true);
 assert.equal(buildDealProperties(without.value).contato_comercial_solicitado,false);
 assert.equal(buildDealProperties(withContact.value).contato_comercial_solicitado,true);
});
