import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {
  buildMetaLeadDescription,
  fetchMetaLeads,
  metaLeadsConfig,
  normalizeMetaLead,
} from '../src/lib/meta-lead-ads.mjs';
import {syncMetaLeads} from '../src/lib/meta-lead-sync.mjs';
import {ASAFLOW_PIPELINE_ID,ASAFLOW_STAGE_ID} from '../src/lib/meta-lead-asaflow.mjs';

const TOKEN='meta-token-that-must-never-be-in-a-url';
const API_KEY='asaflow-test-key';
const CONTACT_ID='11111111-1111-4111-8111-111111111111';
const CONTACT_ID_2='33333333-3333-4333-8333-333333333333';
const DEAL_ID='22222222-2222-4222-8222-222222222222';
const DEAL_ID_2='44444444-4444-4444-8444-444444444444';
const NAME='Pessoa PII Teste';
const EMAIL='pessoa.pii@example.com';
const PHONE='+5561999999999';
const nodeRequire=createRequire(import.meta.url);

function loadCronRoute(sync) {
  const source=readFileSync(new URL('../src/app/api/cron/meta-leads/route.ts',import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const module={exports:{}};
  const context={
    require(specifier) {
      if(specifier==='@/lib/meta-lead-sync.mjs') return {syncMetaLeads:sync};
      if(specifier==='next/server') return {NextResponse:{json:(body,init={})=>({body,status:init.status||200})}};
      return nodeRequire(specifier);
    },module,exports:module.exports,process,Buffer,Headers,fetch,console,
  };
  vm.runInNewContext(compiled,context,{filename:'meta-lead-route.ts'});
  return module.exports;
}

function response(body,status=200) {
  return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
}
function fieldData(overrides={}) {
  return [
    {name:'full_name',values:[overrides.name||NAME]},
    {name:'email',values:[overrides.email||EMAIL]},
    {name:'phone_number',values:[overrides.phone||PHONE]},
    {name:'city',values:[overrides.city||'São Paulo']},
    {name:'Você é',values:[overrides.role||'Dono']},
    {name:'Faturamento mensal',values:[overrides.revenue||'acima_de_r$_100_mil_ate_r$_250_mil']},
    {name:'nome do restaurante',values:[overrides.restaurant||'Restaurante PII Teste']},
  ];
}
function lead(overrides={}) {
  return {
    id:overrides.id||'123456789012',created_time:overrides.created_time||'2026-11-19T16:00:00Z',
    ad_id:overrides.ad_id===undefined?'ad-123':overrides.ad_id,ad_name:'Anúncio PII',adset_id:'adset-1',adset_name:'Conjunto PII',
    campaign_id:'campaign-1',campaign_name:'Campanha PII',form_id:'12345',is_organic:false,platform:'instagram',
    field_data:overrides.field_data||fieldData(overrides),
    custom_disclaimer_responses:overrides.custom_disclaimer_responses===undefined ? [{checkbox_key:'whatsapp',is_checked:'1'}] : overrides.custom_disclaimer_responses,
  };
}
function env(extra={}) {
  return {META_LEADS_SYNC_ENABLED:'true',META_LEADS_ACCESS_TOKEN:TOKEN,META_LEAD_FORM_IDS:'12345',ASAFLOW_ACQUISITION_API_KEY:API_KEY,...extra};
}
function metaOnlyFetch(leads,requests=[]) {
  return async (url,init={}) => {
    requests.push({url,init});
    if(new URL(url).pathname.endsWith('/leads')) return response({data:leads,paging:{cursors:{after:null}}});
    throw new Error(`unexpected_${url}`);
  };
}

test('rota cron responde 503 sem segredo, 401 para segredo errado e 200 autorizado',async()=>{
  const original=process.env.CRON_SECRET;let calls=0;
  const route=loadCronRoute(async()=>{calls+=1;return {status:'disabled',mode:'dry_run',forms:0};});
  try {
    delete process.env.CRON_SECRET;
    const missing=await route.GET({headers:new Headers()});assert.equal(missing.status,503);assert.equal(calls,0);
    process.env.CRON_SECRET='cron-secret';
    const wrong=await route.GET({headers:new Headers({authorization:'Bearer errado'})});assert.equal(wrong.status,401);assert.equal(calls,0);
    const ok=await route.GET({headers:new Headers({authorization:'Bearer cron-secret'})});assert.equal(ok.status,200);assert.equal(ok.body.status,'disabled');assert.equal(calls,1);
  } finally {
    if(original===undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET=original;
  }
 });

test('sincronização disabled retorna 200 lógico sem fazer qualquer fetch',async()=>{
  let calls=0;
  const result=await syncMetaLeads({env:{META_LEADS_SYNC_ENABLED:'false',META_LEAD_FORM_IDS:'12345'},fetchImpl:async()=>{calls+=1;throw new Error('não deveria chamar');}});
  assert.equal(result.status,'disabled');assert.equal(calls,0);assert.equal(result.created,0);
 });

 test('configuração cobre disabled, misconfigured, dry_run/live, lookback e owner UUID sem expor token',()=>{
  assert.equal(metaLeadsConfig({}).status,'disabled');
  assert.equal(metaLeadsConfig({META_LEADS_SYNC_ENABLED:'true',META_LEADS_ACCESS_TOKEN:TOKEN,META_LEAD_FORM_IDS:'12x45'}).status,'misconfigured');
  const dry=metaLeadsConfig(env({META_LEADS_LOOKBACK_HOURS:'999',META_LEADS_OWNER_USER_ID:'bad'}));
  assert.equal(dry.mode,'dry_run');assert.equal(dry.lookbackHours,168);assert.equal(dry.ownerUserId,null);assert.equal(dry.ownerUserIdInvalid,true);
  const live=metaLeadsConfig(env({META_LEADS_SYNC_MODE:'live',META_LEADS_LOOKBACK_HOURS:'0',META_LEADS_OWNER_USER_ID:'11111111-1111-4111-8111-111111111111'}));
  assert.equal(live.mode,'live');assert.equal(live.lookbackHours,1);assert.equal(live.ownerUserId,'11111111-1111-4111-8111-111111111111');
  assert.doesNotMatch(JSON.stringify({status:dry.status,mode:dry.mode,forms:dry.formIds}),new RegExp(TOKEN));
 });

test('normalização cobre acentos, underscores, papel, receita e consentimento conservador',()=>{
  const normalized=normalizeMetaLead(lead({role:'Sócio proprietário',revenue:'Acima de R$ 100 mil até R$ 250 mil'}));
  assert.equal(normalized.name,NAME);assert.equal(normalized.restaurant,'Restaurante PII Teste');assert.equal(normalized.role,'Dono ou sócio');
  assert.equal(normalized.revenue,'Acima de R$ 100 mil até R$ 250 mil');assert.equal(normalized.consent,'sim');assert.equal(normalized.phone,PHONE);
  const fallback=normalizeMetaLead(lead({field_data:[{name:'first_name',values:['Ana']},{name:'last_name',values:['Teste']},{name:'email',values:[EMAIL]},{name:'phone_number',values:[PHONE]},{name:'função',values:['gestor']},{name:'faturamento',values:['sem opção']}],custom_disclaimer_responses:[]}));
  assert.equal(fallback.name,'Ana Teste');assert.equal(fallback.role,'Gerente ou responsável pela operação');assert.equal(fallback.revenue,'Não informado');assert.equal(fallback.consent,'não');assert.equal(fallback.consentShape,'absent');
  assert.equal(normalizeMetaLead(lead({custom_disclaimer_responses:[{checkbox_key:'a',is_checked:false},{checkbox_key:'b',is_checked:'0'}]})).consent,'não');
  assert.equal(normalizeMetaLead(lead({email:'not-an-email'})),null);assert.equal(normalizeMetaLead(lead({phone:'119999'})),null);
 });

test('descrição real segue regex das automações e sanitiza ponto e nova linha',()=>{
  const normalized=normalizeMetaLead(lead({name:'João.\nTeste',city:'St. André\nCentro',restaurant:'Casa.\nTeste'}));
  const description=buildMetaLeadDescription(normalized);
  const pattern=/^Lead Meta Ads recebido em [^.\n]{1,100}\.\s*Papel:\s*([^\.\n]{1,120})\.\s*Faturamento informado:\s*([^\.\n]{1,160})\.\s*Dor principal:\s*([^\.\n]{1,500})\.\s*Cidade:\s*([^\.\n]{1,160})\.(?:\s*Consentimento WhatsApp:\s*(sim|não)\.)?/iu;
  const match=description.match(pattern);assert.ok(match);assert.equal(match[1],'Dono ou sócio');assert.equal(match[2],'Acima de R$ 100 mil até R$ 250 mil');assert.equal(match[4],'St André Centro');
  assert.doesNotMatch(description,/João\.|Casa\.|\nTeste/);assert.ok(description.length<=5000);
  const testLead=normalizeMetaLead(lead({ad_id:null}));const testDescription=buildMetaLeadDescription(testLead);
  assert.match(testDescription,/^Teste de integração Meta \(sem anúncio\) recebido em/);assert.doesNotMatch(testDescription,/Lead Meta Ads recebido/);
 });

test('Meta pagina por after, não segue next e limita a dez páginas',async()=>{
  const requests=[];let calls=0;
  const result=await fetchMetaLeads({config:metaLeadsConfig(env()),now:'2026-11-19T16:00:00Z',fetchImpl:async(url,init)=>{
    requests.push({url,init});calls+=1;const page=Number(new URL(url).searchParams.get('after')||'0');
    return response({data:[lead({id:String(12345000000+page)})],paging:{cursors:{after:String(page+1)},next:`https://evil.invalid/should-not-be-followed/${page+1}`}});
  }});
  assert.equal(calls,10);assert.equal(result.errors.at(-1),'meta_pagination_limit');
  assert.equal(new URL(requests[1].url).searchParams.get('after'),'1');assert.ok(!requests.some(item=>item.url.startsWith('https://evil')));
  assert.ok(requests.every(item=>!item.url.includes(TOKEN)));assert.ok(requests.every(item=>item.init.headers.Authorization===`Bearer ${TOKEN}`));
 });

test('erro Meta mapeia status e código numérico sem vazar message',async()=>{
  const requests=[];const result=await fetchMetaLeads({config:metaLeadsConfig(env()),fetchImpl:metaOnlyFetch([],requests)});
  assert.equal(result.errors.length,0);
  const error=await fetchMetaLeads({config:metaLeadsConfig(env()),fetchImpl:async()=>response({error:{code:100,message:'NOME PII E MENSAGEM'}} ,400)});
  assert.deepEqual(error.errors,['meta_http_400','meta_error_100']);assert.doesNotMatch(JSON.stringify(error),/NOME PII|MENSAGEM/);assert.ok(requests[0].url.includes('filtering='));
 });

test('dry_run faz zero POST/PATCH e reporta contato ausente como elegível',async()=>{
  const requests=[];const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'dry_run'}),now:'2026-11-19T16:00:00Z',fetchImpl:async(url,init={})=>{
    requests.push({url,init});const path=new URL(url).pathname;
    if(path.endsWith('/leads')) return response({data:[lead()],paging:{cursors:{after:null}}});
    if(path.endsWith('/deals')) return response({data:[],nextCursor:null});
    if(path.endsWith('/contacts')) return response({data:[],nextCursor:null});
    throw new Error('unexpected');
  }});
  assert.equal(result.status,'ok');assert.equal(result.eligible,1);assert.equal(result.created,0);assert.equal(result.asaflow,'configured');assert.ok(requests.every(item=>(item.init.method||'GET')==='GET'));
  assert.doesNotMatch(JSON.stringify(result),new RegExp(NAME));assert.doesNotMatch(JSON.stringify(result),new RegExp(EMAIL));assert.doesNotMatch(JSON.stringify(result),new RegExp('\\+'+PHONE.slice(1)));
 });

test('dry_run sem chave AsaFlow não faz leitura do CRM',async()=>{
  const requests=[];const result=await syncMetaLeads({env:env({ASAFLOW_ACQUISITION_API_KEY:'',META_LEADS_SYNC_MODE:'dry_run'}),fetchImpl:async(url,init)=>{requests.push({url,init});return response({data:[lead()],paging:{cursors:{after:null}}});}});
  assert.equal(result.asaflow,'not_configured');assert.equal(result.eligible,1);assert.equal(requests.length,1);assert.equal(result.status,'ok');
 });

test('falha no dedupe aborta com zero escritas',async()=>{
  const methods=[];const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live'}),fetchImpl:async(url,init={})=>{methods.push(init.method||'GET');const path=new URL(url).pathname;if(path.endsWith('/leads'))return response({data:[lead()],paging:{cursors:{after:null}}});if(path.endsWith('/deals'))return response({error:{code:42}},503);throw new Error('unexpected');}});
  assert.equal(result.status,'aborted');assert.equal(result.errors.asaflow_dedupe_unavailable,1);assert.ok(methods.every(method=>method==='GET'));assert.equal(result.created,0);
 });

test('lead já sincronizado é ignorado antes da busca de contato',async()=>{
  const paths=[];const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live'}),fetchImpl:async(url,init={})=>{paths.push({path:new URL(url).pathname,method:init.method||'GET'});const path=new URL(url).pathname;if(path.endsWith('/leads'))return response({data:[lead()],paging:{cursors:{after:null}}});if(path.endsWith('/deals')&&!path.includes('222'))return response({data:[{properties:{meta_lead_id:'123456789012'}}],nextCursor:null});throw new Error('unexpected');}});
  assert.equal(result.alreadySynced,1);assert.equal(result.eligible,0);assert.equal(result.created,0);assert.equal(paths.filter(item=>item.path.endsWith('/contacts')).length,0);
 });

test('contato existente é reutilizado sem PATCH e chaves do negócio são exatas',async()=>{
  const calls=[];const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live',META_LEADS_OWNER_USER_ID:'11111111-1111-4111-8111-111111111111'}),fetchImpl:async(url,init={})=>{
    calls.push({url,init});const path=new URL(url).pathname;
    if(path.endsWith('/leads'))return response({data:[lead()],paging:{cursors:{after:null}}});
    if(path.endsWith('/deals')&&init.method!=='POST')return response({data:[],nextCursor:null});
    if(path.endsWith('/contacts'))return response({data:[{id:CONTACT_ID,email:` ${EMAIL.toUpperCase()} `,phone:'(61) 99999-9999'}],nextCursor:null});
    if(path.endsWith('/deals')&&init.method==='POST')return response({id:DEAL_ID});
    if(path.endsWith(`/deals/${DEAL_ID}`))return response({id:DEAL_ID,contactIds:[CONTACT_ID]});
    throw new Error('unexpected');
  }});
  assert.equal(result.created,1);assert.equal(calls.filter(call=>call.init.method==='PATCH').length,0);assert.equal(calls.filter(call=>new URL(call.url).pathname.endsWith('/contacts')).length,1);
  const dealCall=calls.find(call=>call.url.endsWith('/deals')&&call.init.method==='POST');const body=JSON.parse(dealCall.init.body);
  assert.equal(dealCall.init.headers['Idempotency-Key'],`rook-meta-lead-${lead().id}`);assert.equal(body.pipelineId,ASAFLOW_PIPELINE_ID);assert.equal(body.stageId,ASAFLOW_STAGE_ID);assert.deepEqual(body.contactIds,[CONTACT_ID]);assert.equal(body.ownerUserId,'11111111-1111-4111-8111-111111111111');
  assert.equal(body.properties.meta_lead_id,'123456789012');assert.equal(body.properties.origem,'Tráfego pago');assert.equal(body.properties.plataforma_de_midia,'Meta Ads');assert.equal(body.properties.contato_comercial_solicitado,true);assert.equal(body.properties.empresa_cliente,'Restaurante PII Teste');assert.equal(body.properties.ad_set_id,'adset-1');assert.equal(body.properties.utm_content,'ad-123');
 });

test('contato ambíguo é pulado e nenhum negócio é criado',async()=>{
  const methods=[];const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live'}),fetchImpl:async(url,init={})=>{methods.push(init.method||'GET');const path=new URL(url).pathname;if(path.endsWith('/leads'))return response({data:[lead()],paging:{cursors:{after:null}}});if(path.endsWith('/deals'))return response({data:[],nextCursor:null});if(path.endsWith('/contacts'))return response({data:[{id:CONTACT_ID,email:EMAIL,phone:PHONE},{id:CONTACT_ID_2,email:EMAIL,phone:PHONE}],nextCursor:null});throw new Error('unexpected');}});
  assert.equal(result.skipped.contact_ambiguous,1);assert.equal(result.created,0);assert.ok(!methods.includes('POST'));
 });

test('erros de um lead não interrompem o próximo e idempotência de contato é determinística',async()=>{
  const calls=[];let contactPostCount=0;const leads=[lead({id:'123456789012'}),lead({id:'123456789013',email:'segunda@example.com',name:'Segunda Pessoa'})];
  const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live'}),fetchImpl:async(url,init={})=>{
    calls.push({url,init});const path=new URL(url).pathname;
    if(path.endsWith('/leads'))return response({data:leads,paging:{cursors:{after:null}}});
    if(path.endsWith('/deals')&&init.method!=='POST')return response({data:[],nextCursor:null});
    if(path.endsWith('/contacts')&&init.method!=='POST')return response({data:[],nextCursor:null});
    if(path.endsWith('/contacts')&&init.method==='POST') {contactPostCount+=1;if(contactPostCount===1)return response({error:{code:'IDEMPOTENCY_IN_PROGRESS'}},409);return response({id:CONTACT_ID_2});}
    if(path.endsWith('/deals')&&init.method==='POST')return response({id:DEAL_ID_2});
    if(path.endsWith(`/deals/${DEAL_ID_2}`))return response({id:DEAL_ID_2,contactIds:[CONTACT_ID_2]});
    throw new Error('unexpected');
  }});
  assert.equal(result.errors.asaflow_idempotency_in_progress,1);assert.equal(result.created,1);assert.equal(result.eligible,1);
  const contactCreate=calls.find(call=>call.url.endsWith('/contacts')&&call.init.method==='POST');assert.match(contactCreate.init.headers['Idempotency-Key'],/^rook-contact-[a-f0-9]{64}$/);assert.equal(JSON.parse(contactCreate.init.body).properties.consentimento_whatsapp,true);
 });

test('lead de teste recebe prefixo sem frase da automação',()=>{
  const testLead=normalizeMetaLead(lead({ad_id:null}));const description=buildMetaLeadDescription(testLead);assert.doesNotMatch(description,/Lead Meta Ads recebido/);
 });

function liveFetchCreatingDeals(calls=[]) {
  let dealCount=0;
  return async (url,init={}) => {
    calls.push({url,init});
    const path=new URL(url).pathname;
    if(path.endsWith('/deals')&&init.method!=='POST') return response({data:[],nextCursor:null});
    if(path.endsWith('/contacts')&&init.method!=='POST') return response({data:[{id:CONTACT_ID,email:EMAIL,phone:PHONE}],nextCursor:null});
    if(path.endsWith('/deals')&&init.method==='POST') { dealCount+=1; return response({id:`22222222-2222-4222-8222-${String(dealCount).padStart(12,'0')}`}); }
    const match=path.match(/\/deals\/([0-9a-f-]{36})$/);
    if(match) return response({id:match[1],contactIds:[CONTACT_ID]});
    throw new Error(`unexpected_${path}`);
  };
}
function withLeads(leads,inner) {
  return async (url,init={}) => new URL(url).pathname.endsWith('/leads') ? response({data:leads,paging:{cursors:{after:null}}}) : inner(url,init);
}

test('orçamento de tempo impede iniciar novos leads sem interromper gravação em curso',async()=>{
  const leads=[lead({id:'123456789012'}),lead({id:'123456789013'})];
  let ticks=0;const clock=()=>{ticks+=1;return ticks<=2?0:50_000;};
  const calls=[];
  const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live'}),fetchImpl:withLeads(leads,liveFetchCreatingDeals(calls)),clock,timeBudgetMs:40_000});
  assert.equal(result.created,1);assert.equal(result.skipped.time_budget,1);assert.equal(result.status,'partial');
  assert.equal(calls.filter(call=>call.init.method==='POST').length,1);
});

test('modo live respeita o teto de 20 leads por rodada',async()=>{
  const leads=Array.from({length:21},(_,index)=>lead({id:String(123456789100+index)}));
  const result=await syncMetaLeads({env:env({META_LEADS_SYNC_MODE:'live'}),fetchImpl:withLeads(leads,liveFetchCreatingDeals())});
  assert.equal(result.created,20);assert.equal(result.skipped.max_leads_per_run,1);
});

test('contrato do formulário BF26 v1: chaves reais, papel Gestor e gatilho do WhatsApp só com consentimento',()=>{
  const formFields=[
    {name:'email',values:[EMAIL]},{name:'full_name',values:[NAME]},{name:'phone_number',values:[PHONE]},
    {name:'você_é…',values:['Gestor']},{name:'nome_do_restaurante',values:['Restaurante PII Teste']},
  ];
  const consented=normalizeMetaLead(lead({field_data:formFields}));
  assert.equal(consented.role,'Gerente ou responsável pela operação');assert.equal(consented.restaurant,'Restaurante PII Teste');assert.equal(consented.consent,'sim');
  const description=buildMetaLeadDescription(consented);
  assert.match(description,/^Lead Meta Ads recebido em /);assert.doesNotMatch(description,/Consentimento WhatsApp: não\./);
  const withoutConsent=normalizeMetaLead(lead({field_data:formFields,custom_disclaimer_responses:[]}));
  assert.equal(withoutConsent.consent,'não');assert.match(buildMetaLeadDescription(withoutConsent),/Consentimento WhatsApp: não\./);
  const owner=normalizeMetaLead(lead({field_data:formFields.map(item=>item.name==='você_é…'?{...item,values:['Dono ou sócio']}:item)}));
  assert.equal(owner.role,'Dono ou sócio');
});

test('cron da Vercel aponta para a rota com barra final (trailingSlash responde 308 e o cron não segue redirect)', () => {
  const nextConfig=readFileSync(new URL('../next.config.mjs',import.meta.url),'utf8');
  assert.match(nextConfig,/trailingSlash:\s*true/);
  const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  const metaCron=(vercel.crons||[]).filter(cron=>cron.path.startsWith('/api/cron/meta-leads'));
  assert.equal(metaCron.length,1);
  assert.equal(metaCron[0].path,'/api/cron/meta-leads/');
  assert.equal(metaCron[0].schedule,'*/10 * * * *');
});
