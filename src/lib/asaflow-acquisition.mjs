import {createHash} from 'node:crypto';
import {ERP_SYSTEMS,REVENUE_BANDS,normalizePhone} from './acquisition.mjs';
import {segmentoPorSlug} from './cmv-benchmarks.mjs';
import {appendLeadAttribution,LEAD_DESCRIPTION_MAX_LENGTH,normalizeLeadAttribution} from './lead-attribution.mjs';
import {financialReferenceLabel} from './financial-reference.mjs';

const BASE='https://app.asaflow.com.br/api/v1';
const hash=value=>createHash('sha256').update(value).digest('hex');
const UTM_FIELDS=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
const ASAFLOW_SEGMENTS={
  a_la_carte:'Restaurante à la carte',fine_dining:'Alta gastronomia (fine dining)',
  italiana:'Comida Italiana',japonesa_sushi:'Comida Japonesa / Sushi',
  self_service_kilo:'Self-service / Comida a quilo',pizzaria:'Pizzaria',
  hamburgueria:'Hamburgueria',fast_food:'Lanchonete / Fast food',bar_boteco:'Bar / Boteco',
  padaria_cafeteria:'Padaria / Cafeteria / Confeitaria',delivery_especializado:'Delivery especializado',
  other:'Outro',
};

function cleanProperty(value,max=500) {
  return typeof value==='string' && value.trim() ? value.trim().slice(0,max) : null;
}

function normalizedAttribution(lead) {
  return normalizeLeadAttribution(lead.attribution);
}

function isMetaPaid(attribution) {
  const source=String(attribution?.utm_source||'').trim().toLowerCase();
  return ['meta','facebook','facebookads','instagram'].includes(source);
}

export function acquisitionOrigin(lead) {
  const attribution=normalizedAttribution(lead);
  if(isMetaPaid(attribution)) return 'Tráfego pago';
  return ['cmv','breakeven'].includes(lead.intent)?'Diagnóstico (site)':'Formulário (site)';
}

export function buildContactProperties(lead) {
  const properties={
    origem_lead:acquisitionOrigin(lead),
  };
  // A ferramenta coleta somente contato e números. Campo não coletado precisa
  // permanecer ausente: não equivale a estabelecimento sem ERP ou sem cidade.
  if(cleanProperty(lead.company)) {
    properties.empresa=lead.company;
    properties.nome_do_restaurante=lead.company;
  }
  if(cleanProperty(lead.city?.name)) properties.cidade=lead.city.name;
  if(cleanProperty(lead.city?.uf || lead.taxState)) properties.uf=lead.city?.uf || lead.taxState;
  if(lead.segment) properties.segmento=ASAFLOW_SEGMENTS[lead.segment]||'Outro';
  if(lead.segment==='other' && cleanProperty(lead.segmentOther,100)) properties.segmento_outros=cleanProperty(lead.segmentOther,100);
  if(lead.usesErp) properties.sistema_atual=ERP_SYSTEMS.includes(lead.erp)?lead.erp:cleanProperty(lead.erpOther,100);
  return properties;
}

export function buildDealProperties(lead) {
  const attribution=normalizedAttribution(lead);
  const properties={origem:acquisitionOrigin(lead)};
  if(cleanProperty(lead.company)) properties.empresa_cliente=lead.company;
  if(cleanProperty(attribution?.landing_path,256)) properties.landing_page=cleanProperty(attribution.landing_path,256);
  if(isMetaPaid(attribution)) properties.plataforma_de_midia='Meta Ads';
  if(String(attribution?.utm_campaign||'').trim().startsWith('[ES]')) properties.parceiro_de_aquisicao='Escala SaaS';
  for(const field of UTM_FIELDS) if(cleanProperty(attribution?.[field],200)) properties[field]=cleanProperty(attribution[field],200);
  return properties;
}

export function buildLeadDescription(lead) {
  const financialTool=lead.captureKind==='financial_tool';
  const lines=[
    financialTool ? 'Solicitação de análise financeira pelo site Rook. Dados autodeclarados.' : 'Cadastro comercial pelo site Rook. Dados autodeclarados.',
    ...(lead.company ? [`Estabelecimento: ${lead.company}`] : []),`Responsável: ${lead.name}`,
    `WhatsApp: ${lead.phone}`,`E-mail: ${lead.email}`,
    ...(lead.city ? [`Cidade/UF: ${lead.city.name}/${lead.city.uf} (IBGE ${lead.city.id})`] : lead.taxState ? [`UF informada para a estimativa: ${lead.taxState}`] : []),
    ...(lead.segment ? [`Segmento: ${segmentoPorSlug(lead.segment)?.name || lead.segmentOther || 'Outro'}`] : []),
    ...(lead.revenueBand ? [`Faturamento bruto mensal: ${REVENUE_BANDS.find(b=>b.value===lead.revenueBand)?.label}`] : []),
    ...(typeof lead.usesErp==='boolean' ? [`ERP/PDV: ${lead.usesErp ? (ERP_SYSTEMS.includes(lead.erp)?lead.erp:lead.erpOther) : 'Não utiliza'}`] : []),
    `Intenção: ${lead.intent}`,
    ...(financialTool ? [`Análise solicitada: ${lead.intent==='cmv'?'CMV':'Ponto de equilíbrio'}`, 'Demonstração solicitada: não'] : []),
    `Contato comercial solicitado: ${!financialTool || lead.commercialContactRequested ? 'sim' : 'não'}`,
    `Referência da solicitação: ${lead.submissionId}`,
  ].map(line=>line.replace(/[\r\n\u0085\u2028\u2029]+/g,' '));
  if(lead.simulation) {
    lines.push('', `Cenário financeiro informado pelo visitante — ${lead.referenceBasis?financialReferenceLabel({referenceBasis:lead.referenceBasis}):`mês ${lead.period}`}:`,lead.simulation.summary,
      `Entradas: ${JSON.stringify(lead.simulation.inputs)}`,`Fórmula: ${lead.simulation.formulaVersion}`,
      ...lead.simulation.assumptions);
  }
  if(lead.diagnosticNotes?.length) lines.push('',...lead.diagnosticNotes);
  const description=lines.join('\n');
  // O perfil limitado e o diagnóstico recalculado no servidor cabem neste teto.
  // Uma regressão futura deve falhar antes da gravação, nunca cortar o cenário.
  if(description.length>LEAD_DESCRIPTION_MAX_LENGTH) throw new Error('asaflow_description_too_long');
  return appendLeadAttribution(description,lead.attribution);
}

/** Contrato público OpenAPI v1; nenhuma chamada ao banco privado do fornecedor. */
export function createAsaflowAcquisition({apiKey,pipelineId,stageId,fetchImpl=fetch}) {
  if(!apiKey || !pipelineId || !stageId) throw new Error('asaflow_not_configured');
  async function request(path,method='GET',body,idem) {
    const response=await fetchImpl(`${BASE}${path}`,{method,
      headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json',...(idem?{'Idempotency-Key':idem}:{})},
      ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(8000),cache:'no-store'});
    if(!response.ok) throw new Error(`asaflow_${response.status}`);
    return response.json();
  }
  async function create(lead) {
    const description=buildLeadDescription(lead);
    // A busca aceita até 200 caracteres; a comparação abaixo continua exata.
    const contacts=await request(`/contacts?limit=100&search=${encodeURIComponent(lead.email.slice(0,200))}`);
    if(!contacts || !Array.isArray(contacts.data) ||
      !(contacts.nextCursor===null || (typeof contacts.nextCursor==='string' && contacts.nextCursor.length>0 && contacts.nextCursor.length<=512)) ||
      contacts.data.some(c=>!c || typeof c.id!=='string' || !c.id.trim() ||
        !(c.email===null || typeof c.email==='string') || !(c.phone===null || typeof c.phone==='string'))) {
      throw new Error('asaflow_invalid_contacts');
    }
    // Uma página parcial não prova que o contato é único, mesmo com uma coincidência.
    if(contacts.nextCursor!==null) throw new Error('asaflow_contact_ambiguous');
    // O CRM pode conter o telefone brasileiro local, com ou sem máscara/DDI.
    // Reutilizar a mesma normalização do formulário evita criar outro contato
    // por uma diferença de apresentação, mantendo a exigência de ambos os dados.
    const matches=contacts.data.filter(c=>c.email?.trim().toLowerCase()===lead.email &&
      normalizePhone(c.phone)===lead.phone);
    if(new Set(matches.map(c=>c.id)).size>1) throw new Error('asaflow_contact_ambiguous');
    const existing=matches[0];
    const contact=existing || await request('/contacts','POST',{
      name:lead.name,email:lead.email,phone:lead.phone,properties:buildContactProperties(lead),
    },`rook-contact-${hash(`${lead.email}:${lead.phone}`)}`);
    if(!contact || typeof contact.id!=='string' || !contact.id.trim()) throw new Error('asaflow_invalid_contact');
    // A mesma solicitação conserva a chave; a API documenta reenvio em até 24h.
    // A identidade compartilhada com o chat ainda depende da integração nativa.
    // Não alterar contatos preexistentes sem autenticação.
    const deal=await request('/deals','POST',{
      name:(lead.captureKind==='financial_tool' ? `${lead.intent==='cmv'?'CMV':'Ponto de equilíbrio'} — ${lead.name}` : lead.company).slice(0,200),pipelineId,stageId,
      contactIds:[contact.id],description,properties:buildDealProperties(lead),
    },`rook-acquisition-${lead.submissionId}`);
    if(!deal || typeof deal.id!=='string' || !deal.id.trim()) throw new Error('asaflow_invalid_deal');
    return {contactId:contact.id,dealId:deal.id};
  }
  return {create};
}
