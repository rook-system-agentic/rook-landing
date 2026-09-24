import { segmentsData } from './cmv-benchmarks.mjs';
import { parseBrazilianNumber, calculateFinancialSimulation } from './financial-simulation.mjs';
import { normalizeLeadAttribution } from './lead-attribution.mjs';
import { CMV_TAX_MODEL_VERSION, TAX_STATES } from './cmv-tax-estimate.mjs';
import { validateFinancialReference, financialReferenceLabel } from './financial-reference.mjs';

export const ERP_SYSTEMS = ['Saipos','Consumer','Colibri','Linx','Sischef','Teknisa','Omie','Conta Azul','Bling','Tiny'];
export const REVENUE_BANDS = [
  {value:'up_to_100k',label:'Até R$ 100 mil'},
  {value:'100k_to_200k',label:'Acima de R$ 100 mil até R$ 200 mil'},
  {value:'200k_to_300k',label:'Acima de R$ 200 mil até R$ 300 mil'},
  {value:'above_300k',label:'Acima de R$ 300 mil'},
];
export const normalizeSearch = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function searchMunicipalities(cities, query) {
  const terms=normalizeSearch(query).replace(/\//g,' ').split(/\s+/).filter(Boolean);
  if (terms.join('').length < 2) return [];
  return cities.filter(c=>terms.every(term=>normalizeSearch(`${c.name} ${c.uf}`).includes(term))).slice(0,12);
}
export function normalizePhone(value) {
  const digits=String(value??'').replace(/\D/g,'');
  const local=digits.startsWith('55') && digits.length>11 ? digits.slice(2) : digits;
  return /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(local) ? `+55${local}` : null;
}
export function deriveRevenueBand(value) {
  const revenue=parseBrazilianNumber(value);
  if(revenue===null || revenue<=0) return '';
  return revenue<=100000?'up_to_100k':revenue<=200000?'100k_to_200k':revenue<=300000?'200k_to_300k':'above_300k';
}

export function buildSimulationInput(answers, tool) {
  // Older simulations kept the explicit calendar month outside the engine.
  // New relative references travel with the inputs, including a conflicting
  // period if supplied, so the engine rejects it instead of choosing silently.
  const reference = answers.referenceBasis !== undefined
    ? {referenceBasis:answers.referenceBasis,...(answers.period !== undefined ? {period:answers.period} : {})}
    : {};
  if(tool==='cmv' && answers.revenueBasis==='gross') return {
    tool,...reference,revenueBasis:'gross',revenue:parseBrazilianNumber(answers.revenue),segment:answers.segment,
    cmvInputMode:answers.cmvInputMode,taxState:answers.taxState,taxModelVersion:answers.taxModelVersion,
    ...(answers.cmvInputMode==='amount' ? {cmvAmount:parseBrazilianNumber(answers.cmvAmount)} : {cmvPercent:parseBrazilianNumber(answers.cmvPercent)}),
  };
  const common={tool,...reference,revenueBasis:tool==='cmv'?'net':'gross',revenue:parseBrazilianNumber(answers.revenue),cmvPercent:parseBrazilianNumber(answers.cmvPercent)};
  return tool==='cmv' ? {...common,segment:answers.segment} : {...common,
    fixedCosts:parseBrazilianNumber(answers.fixedCosts),taxPercent:parseBrazilianNumber(answers.taxPercent),
    feesPercent:parseBrazilianNumber(answers.feesPercent),otherVariablePercent:parseBrazilianNumber(answers.otherVariablePercent)};
}

export function validateAcquisition(candidate,cities) {
  if(!candidate || typeof candidate!=='object' || Array.isArray(candidate)) return {ok:false,errors:{form:'Dados inválidos.'}};
  const errors={};
  const text=(field,max=160)=>typeof candidate[field]==='string'?candidate[field].trim().slice(0,max):'';
  const name=text('name',120),company=text('company'),email=text('email',254).toLowerCase(),phone=normalizePhone(candidate.phone);
  const city=cities.find(c=>c.id===text('cityId',7));
  if(name.length<2) errors.name='Informe seu nome.';
  if(company.length<2) errors.company='Informe o estabelecimento.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email='Informe um e-mail válido.';
  if(!phone) errors.phone='Informe um WhatsApp válido com DDD.';
  if(!city) errors.cityId='Escolha a cidade e UF na lista.';
  const segment=text('segment',60),segmentOther=text('segmentOther',100);
  if(!segmentsData.some(s=>s.slug===segment) && segment!=='other') errors.segment='Selecione o segmento.';
  if(segment==='other' && segmentOther.length<2) errors.segmentOther='Informe o segmento.';
  const revenueBand=text('revenueBand',40);
  if(!REVENUE_BANDS.some(b=>b.value===revenueBand)) errors.revenueBand='Selecione a faixa de faturamento bruto.';
  const usesErp=text('usesErp',3),erp=text('erp',60),erpOther=text('erpOther',100);
  if(!['yes','no'].includes(usesErp)) errors.usesErp='Informe se utiliza ERP ou PDV.';
  if(usesErp==='yes' && !ERP_SYSTEMS.includes(erp) && erp!=='other') errors.erp='Selecione o sistema.';
  if(usesErp==='yes' && erp==='other' && erpOther.length<2) errors.erpOther='Informe o nome do sistema.';
  if(candidate.consent!==true) errors.consent='Confirme o contato comercial.';
  const submissionId=text('submissionId',36);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) errors.form='Atualize a página e tente novamente.';
  let simulation=null;
  const diagnosticNotes=[];
  const reference=validateFinancialReference(candidate,{required:Boolean(candidate.simulation)});
  if(!reference.ok) Object.assign(errors,reference.errors);
  const referenceValue=reference.ok?reference.value:{};
  const period=referenceValue.period;
  if(candidate.simulation){
    const calculated=calculateFinancialSimulation(candidate.simulation);
    if(!calculated.ok) errors.simulation='Revise os números do cenário antes de enviar.';
    else if(calculated.tool==='cmv' && calculated.inputs.segment!==segment) errors.simulation='O segmento do diagnóstico difere do estabelecimento. Recalcule ou remova o cenário.';
    else if(calculated.inputs.referenceBasis!==referenceValue.referenceBasis ||
      (calculated.inputs.period!==undefined && calculated.inputs.period!==period)) errors.simulation='A referência dos números difere do diagnóstico. Recalcule ou remova o cenário.';
    else simulation=calculated;
  }
  if(!simulation && ['cmv','breakeven'].includes(candidate.intent)) {
    const grossCmv=candidate.intent==='cmv' && candidate.revenueBasis==='gross';
    const amountCmv=grossCmv && candidate.cmvInputMode==='amount';
    const fields=candidate.intent==='cmv'
      ? ['revenue',amountCmv?'cmvAmount':'cmvPercent']
      : ['revenue','cmvPercent','fixedCosts','taxPercent','feesPercent','otherVariablePercent'];
    const labels={revenue:grossCmv?'Faturamento bruto mensal (R$)':'Receita mensal (R$)',cmvAmount:'Ingredientes consumidos (R$)',cmvPercent:'CMV (%)',fixedCosts:'Custos fixos (R$)',taxPercent:'Impostos (%)',feesPercent:'Taxas (%)',otherVariablePercent:'Outros variáveis (%)'};
    const known=[];const missing=[];
    for(const field of fields){
      const value=parseBrazilianNumber(candidate[field]);
      if(value!==null && value>=0 && value<=(field.endsWith('Percent')?100:1_000_000_000) && (field!=='revenue'||value>0)) known.push(`${labels[field]}: ${value}`);
      else missing.push(labels[field]);
    }
    diagnosticNotes.push('Diagnóstico interrompido ou incompleto: não foi emitido resultado financeiro.',
      `Base: ${candidate.intent==='cmv'&&!grossCmv?'receita líquida':'receita bruta'}. ${referenceValue.referenceBasis?`Referência: ${financialReferenceLabel(referenceValue)}`:`Mês: ${period||'não informado'}`}.`,
      `Dados informados: ${known.length ? known.join('; ') : 'nenhum valor financeiro informado'}.`,
      missing.length?`Dados ainda não informados: ${missing.join(', ')}.`:'Valores ainda precisam de confirmação e cálculo.');
    if(grossCmv) {
      diagnosticNotes.push(`CMV informado em ${amountCmv?'reais de consumo':candidate.cmvInputMode==='gross_percent'?'percentual do faturamento bruto':candidate.cmvInputMode==='net_percent'?'percentual da receita líquida estimada':'base ainda não confirmada'}. Impostos e receita líquida ainda não calculados.`);
      const state=TAX_STATES.find(item=>item.code===candidate.taxState);
      diagnosticNotes.push(`UF da estimativa: ${state?`${state.label} (${state.code})`:'não confirmada'}. Modelo: ${candidate.taxModelVersion===CMV_TAX_MODEL_VERSION?CMV_TAX_MODEL_VERSION:'não confirmado'}.`);
    }
  }
  if(Object.keys(errors).length) return {ok:false,errors};
  return {ok:true,value:{submissionId,name,company,email,phone,city,segment,segmentOther:segment==='other'?segmentOther:null,
    revenueBand,usesErp:usesErp==='yes',erp:usesErp==='yes'?erp:null,erpOther:usesErp==='yes'&&erp==='other'?erpOther:null,
    intent:['cmv','breakeven','demo'].includes(candidate.intent)?candidate.intent:'demo',consent:true,period:period||null,
    ...(referenceValue.referenceBasis?{referenceBasis:referenceValue.referenceBasis}:{}),simulation,diagnosticNotes,
    attribution:normalizeLeadAttribution(candidate.attribution)}};
}
