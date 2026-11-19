import {normalizePhone} from './acquisition-input.mjs';

export const META_GRAPH_BASE_URL='https://graph.facebook.com/v26.0';
export const META_LEADS_TIMEOUT_MS=8_000;
export const META_LEADS_FIELDS='id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,is_organic,platform,field_data,custom_disclaimer_responses';
export const META_REVENUE_LABELS=[
  'Até R$ 50 mil',
  'Acima de R$ 50 mil até R$ 100 mil',
  'Acima de R$ 100 mil até R$ 250 mil',
  'Acima de R$ 250 mil até R$ 500 mil',
  'Acima de R$ 500 mil',
];

const FORM_ID=/^\d{5,25}$/;
const LEAD_ID=/^\d{5,30}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value,max=500) {
  if(typeof value!=='string') return '';
  return value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g,' ').trim().slice(0,max);
}

export function normalizeMetaKey(value) {
  return text(value,200).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}

function integerEnv(value,fallback) {
  if(typeof value==='number' && Number.isInteger(value)) return value;
  if(typeof value==='string' && /^[+-]?\d+$/.test(value.trim())) return Number(value.trim());
  return fallback;
}

export function metaLeadsConfig(env={}) {
  const enabled=env.META_LEADS_SYNC_ENABLED==='true';
  const mode=env.META_LEADS_SYNC_MODE==='live'?'live':'dry_run';
  const requestedLookback=integerEnv(env.META_LEADS_LOOKBACK_HOURS,72);
  const lookbackHours=Math.min(168,Math.max(1,requestedLookback));
  const rawForms=typeof env.META_LEAD_FORM_IDS==='string' ? env.META_LEAD_FORM_IDS.split(',').map(value=>value.trim()).filter(Boolean) : [];
  const formIds=rawForms.filter(value=>FORM_ID.test(value));
  const formsValid=rawForms.length>0 && rawForms.length===formIds.length;
  const token=typeof env.META_LEADS_ACCESS_TOKEN==='string' ? env.META_LEADS_ACCESS_TOKEN.trim() : '';
  const ownerCandidate=typeof env.META_LEADS_OWNER_USER_ID==='string' ? env.META_LEADS_OWNER_USER_ID.trim() : '';
  const ownerUserId=UUID.test(ownerCandidate) ? ownerCandidate : null;
  const ownerUserIdInvalid=Boolean(ownerCandidate) && !ownerUserId;
  const apiKey=typeof env.ASAFLOW_ACQUISITION_API_KEY==='string' ? env.ASAFLOW_ACQUISITION_API_KEY.trim() : '';
  let status='ok';
  let reason=null;
  if(!enabled) status='disabled';
  else if(!token) { status='misconfigured'; reason='access_token_missing'; }
  else if(!formsValid) { status='misconfigured'; reason='form_ids_invalid'; }
  else if(mode==='live' && !apiKey) { status='misconfigured'; reason='asaflow_key_missing'; }
  return {
    enabled,status,reason,mode,token,formIds,lookbackHours,ownerUserId,ownerUserIdInvalid,
    apiKey,graphBaseUrl:META_GRAPH_BASE_URL,
  };
}

function nowDate(now) {
  const date=now instanceof Date ? new Date(now.getTime()) : new Date(now===undefined ? Date.now() : now);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function readConsent(value) {
  if(!Array.isArray(value) || value.length===0) return {consent:'não',shape:'absent'};
  let checked=false;
  for(const item of value) {
    if(item && (item.is_checked==='1' || item.is_checked===1 || item.is_checked===true)) checked=true;
  }
  return {consent:checked?'sim':'não',shape:checked?'checked':'unchecked'};
}

export function consentShape(value) {
  return readConsent(value).shape;
}

function firstValue(values) {
  return Array.isArray(values) ? values.find(value=>typeof value==='string' && value.trim()) || '' : '';
}

function canonicalRole(value) {
  const normalized=normalizeMetaKey(value);
  if(/dono|socio|proprietari/.test(normalized)) return 'Dono ou sócio';
  if(/gerente|gestor|responsavel/.test(normalized)) return 'Gerente ou responsável pela operação';
  return value ? 'Outro' : 'Não informado';
}

function canonicalRevenue(value) {
  const normalized=normalizeMetaKey(value);
  return META_REVENUE_LABELS.find(label=>normalizeMetaKey(label)===normalized) || 'Não informado';
}

function validFieldData(fieldData) {
  return Array.isArray(fieldData) && fieldData.every(item=>item && typeof item.name==='string' && Array.isArray(item.values) && item.values.every(value=>typeof value==='string'));
}

export function isValidMetaLeadShape(lead) {
  return Boolean(lead && typeof lead==='object' && typeof lead.id==='string' && LEAD_ID.test(lead.id) && validFieldData(lead.field_data));
}

export function normalizeMetaLead(lead) {
  if(!isValidMetaLeadShape(lead)) return null;
  const fields=new Map();
  for(const item of lead.field_data) {
    const key=normalizeMetaKey(item.name);
    if(!fields.has(key)) fields.set(key,[]);
    fields.get(key).push(...item.values);
  }
  const valueFor=(key)=>firstValue(fields.get(key));
  const first=valueFor('first_name');
  const last=valueFor('last_name');
  const name=text(valueFor('full_name') || [first,last].filter(Boolean).join(' '),120) || 'Não informado(a)';
  const emailCandidate=text(valueFor('email'),254).toLowerCase();
  const email=EMAIL.test(emailCandidate) ? emailCandidate : '';
  const phone=normalizePhone(valueFor('phone_number'));
  if(!email || !phone) return null;
  let restaurant='';
  for(const [key,values] of fields) {
    if(key==='company_name' || key.includes('restaurante')) {
      restaurant=text(firstValue(values),160);
      if(restaurant) break;
    }
  }
  let roleValue='';
  for(const [key,values] of fields) {
    if(key.includes('voce_e') || key.includes('cargo') || key.includes('papel') || key.includes('job_title') || key.includes('funcao')) {
      roleValue=firstValue(values);
      if(roleValue) break;
    }
  }
  let revenueValue='';
  for(const [key,values] of fields) {
    if(key.includes('faturamento')) {
      revenueValue=firstValue(values);
      if(revenueValue) break;
    }
  }
  const consentInfo=readConsent(lead.custom_disclaimer_responses);
  const cleanOptional=(value,max)=>text(value,max)||null;
  return {
    id:lead.id,
    createdTime:cleanOptional(lead.created_time,100),
    adId:cleanOptional(lead.ad_id,100),
    adName:cleanOptional(lead.ad_name,200),
    adsetId:cleanOptional(lead.adset_id,100),
    adsetName:cleanOptional(lead.adset_name,200),
    campaignId:cleanOptional(lead.campaign_id,100),
    campaignName:cleanOptional(lead.campaign_name,200),
    formId:cleanOptional(lead.form_id,100),
    platform:cleanOptional(lead.platform,80),
    isOrganic:lead.is_organic===true,
    isTest:!text(lead.ad_id,100),
    name,
    email,
    phone,
    city:cleanOptional(valueFor('city'),120),
    restaurant:restaurant||null,
    role:canonicalRole(roleValue),
    revenue:canonicalRevenue(revenueValue),
    consent:consentInfo.consent,
    consentShape:consentInfo.shape,
  };
}

function leadFieldKeys(lead) {
  return validFieldData(lead?.field_data) ? lead.field_data.map(item=>text(item.name,200)).filter(Boolean) : [];
}

async function jsonOrNull(response) {
  try { return await response.json(); } catch { return null; }
}

function errorCodesForResponse(status,body) {
  const codes=[`meta_http_${status}`];
  const errorCode=body && typeof body==='object' && body.error && typeof body.error==='object' ? body.error.code : null;
  if(typeof errorCode==='number' && Number.isFinite(errorCode)) codes.push(`meta_error_${errorCode}`);
  return codes;
}

function metaUrl(formId,filtering,after) {
  const url=new URL(`${META_GRAPH_BASE_URL}/${formId}/leads`);
  url.searchParams.set('fields',META_LEADS_FIELDS);
  url.searchParams.set('limit','100');
  url.searchParams.set('filtering',JSON.stringify(filtering));
  if(after) url.searchParams.set('after',after);
  return url.toString();
}

/** Lê as páginas sem seguir uma URL `paging.next` fornecida pela Meta. */
export async function fetchMetaLeads({config,fetchImpl=fetch,now=Date.now()}={}) {
  const leads=[];
  const errors=[];
  const fieldKeys=new Set();
  const consentCounts={absent:0,checked:0,unchecked:0};
  let fetched=0;
  const filtering=[{field:'time_created',operator:'GREATER_THAN',value:Math.floor((nowDate(now).getTime()-config.lookbackHours*60*60*1000)/1000)}];
  for(const formId of config.formIds||[]) {
    let after=null;
    for(let page=0;page<10;page+=1) {
      let response;
      let body=null;
      try {
        response=await fetchImpl(metaUrl(formId,filtering,after),{
          method:'GET',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},
          signal:AbortSignal.timeout(META_LEADS_TIMEOUT_MS),cache:'no-store',
        });
        body=await jsonOrNull(response);
      } catch(error) {
        errors.push(error && error.name==='AbortError'?'meta_timeout':'meta_network');
        break;
      }
      if(!response?.ok) {
        errors.push(...errorCodesForResponse(response?.status||0,body));
        break;
      }
      if(!body || typeof body!=='object' || !Array.isArray(body.data)) {
        errors.push('meta_invalid_shape');
        break;
      }
      fetched+=body.data.length;
      for(const rawLead of body.data) {
        if(!isValidMetaLeadShape(rawLead)) {
          errors.push('invalid_lead');
          continue;
        }
        for(const key of leadFieldKeys(rawLead)) fieldKeys.add(key);
        const shape=consentShape(rawLead.custom_disclaimer_responses);
        consentCounts[shape]+=1;
        const lead=normalizeMetaLead(rawLead);
        if(!lead) {
          errors.push('invalid_lead');
          continue;
        }
        lead.formId=lead.formId||formId;
        if(!leads.some(item=>item.id===lead.id)) leads.push(lead);
      }
      const nextAfter=body.paging?.cursors?.after;
      const hasNext=typeof nextAfter==='string' && nextAfter.length>0 && typeof body.paging?.next==='string' && body.paging.next.length>0;
      if(!hasNext) break;
      after=nextAfter;
      if(page===9) errors.push('meta_pagination_limit');
    }
  }
  return {leads,fetched,errors,fieldKeys:[...fieldKeys].sort((a,b)=>a.localeCompare(b)),consentCounts};
}

function descriptionValue(value,fallback='Não informado(a)',max=500) {
  const clean=text(value,max).replace(/\./g,'').trim();
  return clean||fallback;
}

function formattedBrasiliaDate(value) {
  const date=new Date(value||Date.now());
  if(Number.isNaN(date.getTime())) return 'Não informado(a)';
  const parts=Object.fromEntries(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

/** Descrição é um contrato consumido pelas automações do funil comercial. */
export function buildMetaLeadDescription(lead) {
  const when=formattedBrasiliaDate(lead.createdTime);
  const firstLine=lead.isTest
    ? `Teste de integração Meta (sem anúncio) recebido em ${when} (horário de Brasília).`
    : `Lead Meta Ads recebido em ${when} (horário de Brasília). Papel: ${descriptionValue(lead.role)}. Faturamento informado: ${descriptionValue(lead.revenue)}. Dor principal: Não informada. Cidade: ${descriptionValue(lead.city,'Não informada',160)}. Consentimento WhatsApp: ${lead.consent==='sim'?'sim':'não'}.`;
  const lines=[firstLine];
  const details=[
    ['Restaurante',lead.restaurant],['Responsável',lead.name],['WhatsApp',lead.phone],['E-mail',lead.email],
    ['Lead Meta',lead.id],['Formulário Meta',lead.formId],['Campanha',lead.campaignName],['Conjunto',lead.adsetName],
    ['Anúncio',lead.adName],['Plataforma',lead.platform],
  ];
  for(const [label,value] of details) if(value) lines.push(`${label}: ${descriptionValue(value,'Não informado(a)',500)}`);
  return lines.join('\n').slice(0,5000);
}

export const isMetaFormId=value=>typeof value==='string' && FORM_ID.test(value);
export const isMetaLeadId=value=>typeof value==='string' && LEAD_ID.test(value);
