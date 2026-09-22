import {createHash} from 'node:crypto';
import {ERP_SYSTEMS,REVENUE_BANDS,normalizePhone} from './acquisition.mjs';
import {segmentoPorSlug} from './cmv-benchmarks.mjs';
import {appendLeadAttribution,LEAD_DESCRIPTION_MAX_LENGTH} from './lead-attribution.mjs';

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
  ].map(line=>line.replace(/[\r\n\u0085\u2028\u2029]+/g,' '));
  if(lead.simulation) {
    lines.push('', `Cenário financeiro informado pelo visitante — mês ${lead.period}:`,lead.simulation.summary,
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
    const contact=existing || await request('/contacts','POST',{name:lead.name,email:lead.email,phone:lead.phone},`rook-contact-${hash(`${lead.email}:${lead.phone}`)}`);
    if(!contact || typeof contact.id!=='string' || !contact.id.trim()) throw new Error('asaflow_invalid_contact');
    // A mesma solicitação conserva a chave; a API documenta reenvio em até 24h.
    // A identidade compartilhada com o chat ainda depende da integração nativa.
    // Não alterar contatos preexistentes sem autenticação.
    const deal=await request('/deals','POST',{
      name:lead.company.slice(0,200),pipelineId,stageId,
      contactIds:[contact.id],description,
    },`rook-acquisition-${lead.submissionId}`);
    if(!deal || typeof deal.id!=='string' || !deal.id.trim()) throw new Error('asaflow_invalid_deal');
    return {contactId:contact.id,dealId:deal.id};
  }
  return {create};
}
