import {createHash} from 'node:crypto';
import {normalizePhone} from './acquisition-input.mjs';
import {buildMetaLeadDescription} from './meta-lead-ads.mjs';

export const ASAFLOW_BASE_URL='https://app.asaflow.com.br/api/v1';
export const ASAFLOW_PIPELINE_ID='9f41600c-e4b1-42d6-b629-5c5d3e98ccd8';
export const ASAFLOW_STAGE_ID='0b3e252d-d708-4170-bd39-361b69eac8bd';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVENUE_LABELS=new Set(['Até R$ 50 mil','Acima de R$ 50 mil até R$ 100 mil','Acima de R$ 100 mil até R$ 250 mil','Acima de R$ 250 mil até R$ 500 mil','Acima de R$ 500 mil']);

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function text(value,max=500) {
  return typeof value==='string' ? value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g,' ').trim().slice(0,max) : '';
}

function validCursor(value) {
  return value===null || (typeof value==='string' && value.length>0 && value.length<=512);
}

function jsonErrorCode(body) {
  const nested=body && typeof body==='object' && body.error && typeof body.error==='object' ? body.error.code : null;
  return typeof nested==='string' ? nested : typeof body?.code==='string' ? body.code : null;
}

async function parseBody(response) {
  try { return await response.json(); } catch { return null; }
}

/** Cliente mínimo do OpenAPI público; nunca coloca a chave em URL ou payload. */
export async function asaflowRequest({apiKey,path,method='GET',body,fetchImpl=fetch,idempotencyKey}={}) {
  let response;
  let responseBody=null;
  try {
    response=await fetchImpl(`${ASAFLOW_BASE_URL}${path}`,{
      method,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json',...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},
      ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(8_000),cache:'no-store',
    });
    responseBody=await parseBody(response);
  } catch(error) {
    if(error?.name==='AbortError') throw new Error('asaflow_timeout');
    throw new Error('asaflow_network');
  }
  if(!response?.ok) {
    if(response.status===409) {
      const code=jsonErrorCode(responseBody);
      if(code==='IDEMPOTENCY_IN_PROGRESS') throw new Error('asaflow_idempotency_in_progress');
      if(code==='IDEMPOTENCY_UNREADABLE') throw new Error('asaflow_idempotency_unreadable');
    }
    throw new Error(`asaflow_${response?.status||0}`);
  }
  return responseBody;
}

function dealsFilter(lookbackHours) {
  return {groups:[{rules:[{field:'meta_lead_id',operator:'is_filled'},{field:'createdAt',operator:'last_x_days',value:Math.ceil(lookbackHours/24)+2}]}]};
}

function validateDealsPage(page) {
  if(!page || typeof page!=='object' || !Array.isArray(page.data) || !validCursor(page.nextCursor)) return false;
  return page.data.every(deal=>deal && typeof deal==='object' && deal.properties && typeof deal.properties==='object' && (deal.properties.meta_lead_id===undefined || typeof deal.properties.meta_lead_id==='string'));
}

/** Dedupe falha fechada: página inválida ou truncada nunca libera uma gravação. */
export async function listSyncedLeadIds({apiKey,lookbackHours,fetchImpl=fetch}={}) {
  const synced=new Set();
  const filter=JSON.stringify(dealsFilter(lookbackHours));
  let cursor=null;
  for(let pageNumber=0;pageNumber<10;pageNumber+=1) {
    const url=new URL(`${ASAFLOW_BASE_URL}/deals`);
    url.searchParams.set('pipelineId',ASAFLOW_PIPELINE_ID);
    url.searchParams.set('limit','100');
    url.searchParams.set('filter',filter);
    if(cursor) url.searchParams.set('cursor',cursor);
    const page=await asaflowRequest({apiKey,path:`/deals?${url.searchParams.toString()}`,fetchImpl});
    if(!validateDealsPage(page)) throw new Error('asaflow_dedupe_unavailable');
    for(const deal of page.data) if(typeof deal.properties.meta_lead_id==='string' && deal.properties.meta_lead_id) synced.add(deal.properties.meta_lead_id);
    if(page.nextCursor===null) return synced;
    cursor=page.nextCursor;
  }
  throw new Error('asaflow_dedupe_unavailable');
}

function validateContactsPage(page) {
  if(!page || typeof page!=='object' || !Array.isArray(page.data) || !validCursor(page.nextCursor)) return false;
  return page.data.every(contact=>contact && typeof contact==='object' && typeof contact.id==='string' && contact.id.trim() && (contact.email===null || typeof contact.email==='string') && (contact.phone===null || typeof contact.phone==='string'));
}

function contactBody(lead) {
  const properties={origem_lead:'Tráfego pago',status_cliente:'Lead',consentimento_whatsapp:lead.consent==='sim',utm_source:'meta',utm_medium:'paid_social',utm_campaign:'bf2026'};
  if(lead.restaurant) {
    properties.nome_do_restaurante=lead.restaurant;
    properties.empresa=lead.restaurant;
  }
  if(lead.city) properties.cidade=lead.city;
  if(REVENUE_LABELS.has(lead.revenue)) properties.faixa_faturamento=lead.revenue;
  const body={name:lead.name,email:lead.email,phone:lead.phone,properties};
  if(lead.role!=='Não informado') body.cargo=lead.role;
  return body;
}

/** Busca exata nos dois identificadores; contato existente jamais recebe PATCH. */
export async function resolveAsaflowContact({apiKey,lead,fetchImpl=fetch,create=true}={}) {
  const search=`/contacts?limit=100&search=${encodeURIComponent(lead.email)}`;
  const contacts=await asaflowRequest({apiKey,path:search,fetchImpl});
  if(!validateContactsPage(contacts)) throw new Error('asaflow_invalid_contacts');
  if(contacts.nextCursor!==null) throw new Error('contact_ambiguous');
  const matches=contacts.data.filter(contact=>contact.email?.trim().toLowerCase()===lead.email && normalizePhone(contact.phone)===lead.phone);
  if(new Set(matches.map(contact=>contact.id)).size>1) throw new Error('contact_ambiguous');
  if(matches[0]) return {contactId:matches[0].id,created:false};
  if(!create) return {contactId:null,created:false};
  const contact=await asaflowRequest({apiKey,path:'/contacts',method:'POST',body:contactBody(lead),idempotencyKey:`rook-contact-${hash(`${lead.email}:${lead.phone}`)}`,fetchImpl});
  if(!contact || !UUID.test(contact.id||'')) throw new Error('asaflow_invalid_contact');
  return {contactId:contact.id,created:true};
}

function dealName(lead) {
  const base=`${lead.restaurant||lead.name} · ${lead.name} (Meta)`;
  return `${lead.isTest?'[TESTE] ':''}${base}`.slice(0,200);
}

function dealBody(lead,contactId,ownerUserId) {
  const properties={
    meta_lead_id:lead.id,origem:'Tráfego pago',plataforma_de_midia:'Meta Ads',contato_comercial_solicitado:true,
    utm_source:'meta',utm_medium:'paid_social',utm_campaign:'bf2026',
  };
  if(lead.restaurant) properties.empresa_cliente=lead.restaurant;
  if(lead.adId) { properties.ad_id=lead.adId; properties.utm_content=lead.adId; }
  if(lead.adsetId) properties.ad_set_id=lead.adsetId;
  if(lead.campaignId) properties.campaign_id=lead.campaignId;
  const body={name:dealName(lead),pipelineId:ASAFLOW_PIPELINE_ID,stageId:ASAFLOW_STAGE_ID,contactIds:[contactId],description:buildMetaLeadDescription(lead),properties};
  if(ownerUserId) body.ownerUserId=ownerUserId;
  return body;
}

export function buildMetaDealBody(lead,contactId,ownerUserId=null) {
  return dealBody(lead,contactId,ownerUserId);
}

export async function createMetaDeal({apiKey,lead,contactId,ownerUserId=null,fetchImpl=fetch}={}) {
  const deal=await asaflowRequest({apiKey,path:'/deals',method:'POST',body:dealBody(lead,contactId,ownerUserId),idempotencyKey:`rook-meta-lead-${lead.id}`,fetchImpl});
  if(!deal || !UUID.test(deal.id||'')) throw new Error('asaflow_invalid_deal');
  const confirmed=await asaflowRequest({apiKey,path:`/deals/${encodeURIComponent(deal.id)}`,fetchImpl});
  if(!confirmed || confirmed.id!==deal.id || !Array.isArray(confirmed.contactIds) || !confirmed.contactIds.includes(contactId)) throw new Error('asaflow_contact_link_mismatch');
  return {dealId:deal.id};
}

export const isAsaflowUuid=value=>typeof value==='string' && UUID.test(value);
