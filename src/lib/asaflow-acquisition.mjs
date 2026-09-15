import {createHash} from 'node:crypto';
import {ERP_SYSTEMS,REVENUE_BANDS} from './acquisition.mjs';
import {segmentoPorSlug} from './cmv-benchmarks.mjs';

const BASE='https://app.asaflow.com.br/api/v1';
const hash=value=>createHash('sha256').update(value).digest('hex');
export function buildLeadDescription(lead) {
  const lines=[
    'Cadastro comercial pelo site Rook. Dados autodeclarados.',
    `Estabelecimento: ${lead.company}`,`Responsável: ${lead.name}`,
    `WhatsApp: ${lead.phone}`,`E-mail: ${lead.email}`,
    `Cidade/UF: ${lead.city.name}/${lead.city.uf} (IBGE ${lead.city.id})`,
    `Segmento: ${segmentoPorSlug(lead.segment)?.name || lead.segmentOther}`,
    `Faturamento bruto mensal: ${REVENUE_BANDS.find(b=>b.value===lead.revenueBand)?.label}`,
    `ERP/PDV: ${lead.usesErp ? (ERP_SYSTEMS.includes(lead.erp)?lead.erp:lead.erpOther) : 'Não utiliza'}`,
    `Intenção: ${lead.intent}`, 'Contato comercial solicitado: sim',
    `Referência da solicitação: ${lead.submissionId}`,
  ];
  if(lead.simulation) {
    lines.push('', `Cenário financeiro informado pelo visitante — mês ${lead.period}:`,lead.simulation.summary,
      `Entradas: ${JSON.stringify(lead.simulation.inputs)}`,`Fórmula: ${lead.simulation.formulaVersion}`,
      ...lead.simulation.assumptions);
  }
  return lines.join('\n').slice(0,5000);
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
    const contacts=await request(`/contacts?limit=100&search=${encodeURIComponent(lead.email)}`);
    const existing=(contacts.data||[]).find(c=>c.email?.toLowerCase()===lead.email && String(c.phone||'').replace(/\D/g,'')===lead.phone.replace(/\D/g,''));
    if(!existing && contacts.nextCursor) throw new Error('asaflow_contact_ambiguous');
    const contact=existing || await request('/contacts','POST',{name:lead.name,email:lead.email,phone:lead.phone},`rook-contact-${hash(`${lead.email}:${lead.phone}`)}`);
    if(typeof contact.id!=='string') throw new Error('asaflow_invalid_contact');
    // Idempotência da oportunidade é por solicitação; formulário e conversa
    // compartilham o mesmo ID. Não alterar contatos preexistentes sem autenticação.
    const deal=await request('/deals','POST',{
      name:lead.company.slice(0,200),pipelineId,stageId,
      contactIds:[contact.id],description:buildLeadDescription(lead),
    },`rook-acquisition-${lead.submissionId}`);
    if(typeof deal.id!=='string') throw new Error('asaflow_invalid_deal');
    return {contactId:contact.id,dealId:deal.id};
  }
  return {create};
}
