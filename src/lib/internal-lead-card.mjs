import {createHash} from 'node:crypto';
import {ERP_SYSTEMS, REVENUE_BANDS} from './acquisition.mjs';
import {segmentoPorSlug} from './cmv-benchmarks.mjs';
import {calculateFinancialSimulation} from './financial-simulation.mjs';
import {validateFinancialReference, financialReferenceLabel} from './financial-reference.mjs';

export const INTERNAL_LEAD_CARD_VERSION = 'rook-internal-lead-card-1';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const intents = {demo: 'Solicitou demonstração', cmv: 'Conversar sobre CMV', breakeven: 'Conversar sobre ponto de equilíbrio'};
const money = value => value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
const line = (value, max = 160) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
  : '';

/**
 * Preparação pura: usar somente no servidor, após validateAcquisition e recibo
 * de persistência do CRM. Não envia, não consulta o fornecedor, não agenda e
 * não fornece deduplicação durável. Nunca recebe texto bruto do agente.
 */
export function buildInternalLeadCard({lead, receipt} = {}) {
  if (!lead || lead.consent !== true || !uuid.test(lead.submissionId || '') ||
      !receipt || !uuid.test(receipt.contactId || '') || !uuid.test(receipt.dealId || '') ||
      typeof receipt.persistedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(receipt.persistedAt) ||
      !Number.isFinite(Date.parse(receipt.persistedAt)) || new Date(receipt.persistedAt).toISOString() !== receipt.persistedAt) {
    throw new Error('invalid_lead_receipt');
  }
  const segment = segmentoPorSlug(lead.segment)?.name || (lead.segment === 'other' ? line(lead.segmentOther, 100) : '');
  const revenueBand = REVENUE_BANDS.find(b => b.value === lead.revenueBand)?.label;
  const erp = lead.usesErp === false ? 'Não utiliza'
    : lead.usesErp === true ? (ERP_SYSTEMS.includes(lead.erp) ? lead.erp : lead.erp === 'other' ? line(lead.erpOther, 100) : '') : '';
  if (![lead.name, lead.company, lead.email, lead.phone, lead.city?.name, lead.city?.uf].every(v => line(v)) ||
      !/^\d{7}$/.test(lead.city?.id || '') || !/^[A-Z]{2}$/.test(lead.city?.uf || '') || !segment || !erp || !revenueBand || !intents[lead.intent]) {
    throw new Error('invalid_lead_profile');
  }
  const lines = [
    'Novo cadastro Rook',
    'Origem: formulário do site • Dados autodeclarados',
    `Estabelecimento: ${line(lead.company)}`,
    `Responsável: ${line(lead.name, 120)}`,
    `WhatsApp: ${line(lead.phone, 20)}`,
    `E-mail: ${line(lead.email, 254)}`,
    `Cidade/UF: ${line(lead.city.name, 120)}/${lead.city.uf} • IBGE ${lead.city.id}`,
    `Segmento: ${line(segment, 100)}`,
    `Faturamento bruto mensal: ${revenueBand}`,
    `ERP/PDV: ${erp}`,
    `Intenção: ${intents[lead.intent]}`,
    'Contato comercial solicitado: sim',
  ];
  let diagnostic = {status: 'not_run', provenance: 'none', formulaVersion: null};
  if (lead.simulation) {
    // O texto e o resultado recebidos não são evidência: recalcular as entradas.
    const calculated = calculateFinancialSimulation(lead.simulation.inputs);
    const reference = validateFinancialReference({...lead,period:lead.period===null?undefined:lead.period});
    if (!calculated.ok || !reference.ok ||
        calculated.inputs.referenceBasis !== reference.value.referenceBasis ||
        (calculated.inputs.period !== undefined && calculated.inputs.period !== reference.value.period) ||
        (calculated.tool === 'cmv' && calculated.inputs.segment !== lead.segment)) {
      throw new Error('invalid_lead_diagnostic');
    }
    diagnostic = {status: 'recalculated', provenance: 'rook_deterministic_engine', formulaVersion: calculated.formulaVersion};
    const input = calculated.inputs;
    lines.push('', `Diagnóstico: ${calculated.tool === 'cmv' ? 'CMV' : 'ponto de equilíbrio'} • ${reference.value.referenceBasis?financialReferenceLabel(reference.value):lead.period}`);
    if(calculated.tool==='cmv' && input.revenueBasis==='gross') {
      lines.push(`Faturamento bruto informado: ${money(input.revenue)} • UF da estimativa: ${input.taxState}`);
      // The assumptions below carry the estimated tax/net bridge and original CMV basis.
    } else lines.push(`Receita ${input.revenueBasis === 'net' ? 'líquida' : 'bruta'}: ${money(input.revenue)} • CMV: ${input.cmvPercent}%`);
    if (calculated.tool === 'breakeven') lines.push(
      `Custos fixos: ${money(input.fixedCosts)} • Impostos: ${input.taxInputMode === 'amount' ? `${money(input.taxAmount)} (guia informada)` : `${input.taxPercent}%`} • Taxas: ${input.feesPercent}% • Outros variáveis: ${input.otherVariablePercent}%`);
    lines.push(calculated.summary, ...calculated.assumptions,
      `Proveniência: motor determinístico Rook • Fórmula ${calculated.formulaVersion}`);
  } else if (Array.isArray(lead.diagnosticNotes) && lead.diagnosticNotes.length) {
    diagnostic = {status: 'incomplete', provenance: 'visitor_partial_inputs', formulaVersion: null};
    // As notas livres não são publicadas como resultado ou prova de cálculo.
    lines.push('', 'Diagnóstico: incompleto. Sem resultado financeiro confirmado; conferir os dados parciais no CRM.');
  } else {
    lines.push('', 'Diagnóstico: não realizado neste cadastro.');
  }
  const contactId = receipt.contactId.toLowerCase();
  const dealId = receipt.dealId.toLowerCase();
  const submissionId = lead.submissionId.toLowerCase();
  // Rota de contato observada no AsaFlow; não inferir rotas de negócio ou ADM.
  const contactUrl = `https://app.asaflow.com.br/contatos/${contactId}`;
  lines.push('', `Contato no CRM: ${contactUrl}`, `Negócio no CRM: ${dealId}`,
    `Solicitação: ${submissionId}`, `Recebido pelo CRM: ${receipt.persistedAt}`);
  const body = lines.join('\n');
  // Limite deste contrato, sem truncar silenciosamente premissas ou referências.
  if (body.length > 3500) throw new Error('lead_card_too_long');
  return {
    version: INTERNAL_LEAD_CARD_VERSION,
    deliveryState: 'prepared',
    source: 'site_form',
    notificationKey: `rook-lead-${createHash('sha256').update(`site_form:${submissionId}`).digest('hex')}`,
    sourceReference: {submissionId, contactId, dealId},
    diagnostic,
    body,
  };
}
