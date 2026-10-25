import { parseBrazilianNumber } from './financial-number.mjs';

export const ERP_SYSTEMS = ['Saipos','Consumer','Colibri','Linx','Sischef','Teknisa','Omie','Conta Azul','Bling','Tiny'];
// Faixas do formulário comercial (ROO-1592). Os cortes seguem o piso do perfil
// ideal (R$ 50 mil, decisão D2 da ROO-1590) e o limite do Knight no catálogo de
// billing (classification.knightMaxMonthlyRevenueCents, R$ 250 mil inclusive).
// `upTo` está em reais; `plan` é o plano indicado pela faixa. Chess
// (multiunidade) não sai da faixa. tests/revenue-bands.test.mjs quebra se o
// limite do catálogo mudar, em vez de a faixa passar a indicar o plano errado.
export const REVENUE_BANDS = [
  {value:'up_to_50k',label:'Até R$ 50 mil',plan:'knight',upTo:50000},
  {value:'50k_to_100k',label:'Acima de R$ 50 mil até R$ 100 mil',plan:'knight',upTo:100000},
  {value:'100k_to_250k',label:'Acima de R$ 100 mil até R$ 250 mil',plan:'knight',upTo:250000},
  {value:'250k_to_500k',label:'Acima de R$ 250 mil até R$ 500 mil',plan:'rook',upTo:500000},
  {value:'above_500k',label:'Acima de R$ 500 mil',plan:'rook',upTo:null},
];
// Valores usados até 24/10/2026. O formulário não os exibe, mas o servidor
// continua aceitando: a LP parceira BeeFood envia `revenueBand` direto
// (docs/beefood-commercial-acquisition.md) e uma página aberta antes da troca
// ainda pode enviar. A faixa de R$ 200 a 300 mil atravessa o limite do Knight
// e por isso não indica plano.
export const LEGACY_REVENUE_BANDS = [
  {value:'up_to_100k',label:'Até R$ 100 mil',plan:'knight',upTo:100000},
  {value:'100k_to_200k',label:'Acima de R$ 100 mil até R$ 200 mil',plan:'knight',upTo:200000},
  {value:'200k_to_300k',label:'Acima de R$ 200 mil até R$ 300 mil',plan:null,upTo:300000},
  {value:'above_300k',label:'Acima de R$ 300 mil',plan:'rook',upTo:null},
];
// Mesmos textos das opções da propriedade `plano_sugerido` no AsaFlow.
export const REVENUE_BAND_PLAN_LABELS = {knight:'Knight',rook:'Rook'};
export function revenueBandInfo(value) {
  return REVENUE_BANDS.find(b=>b.value===value) || LEGACY_REVENUE_BANDS.find(b=>b.value===value) || null;
}
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
  return REVENUE_BANDS.find(b=>b.upTo===null || revenue<=b.upTo).value;
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
  // Compras são uma aproximação declarada em reais, não CMV apurado. Mantemos
  // os valores originais; somente o servidor deriva proporções para a estimativa.
  if(tool==='breakeven' && answers.costInputMode==='purchases_amount') return {
    tool,...reference,revenueBasis:'gross',costInputMode:answers.costInputMode,
    revenue:parseBrazilianNumber(answers.revenue),purchasesAmount:parseBrazilianNumber(answers.purchasesAmount),
    fixedCosts:parseBrazilianNumber(answers.fixedCosts),taxInputMode:answers.taxInputMode,
    taxAmount:parseBrazilianNumber(answers.taxAmount),feesPercent:parseBrazilianNumber(answers.feesPercent),
    otherVariableAmount:parseBrazilianNumber(answers.otherVariableAmount),
  };
  const common={tool,...reference,revenueBasis:tool==='cmv'?'net':'gross',revenue:parseBrazilianNumber(answers.revenue),cmvPercent:parseBrazilianNumber(answers.cmvPercent)};
  return tool==='cmv' ? {...common,segment:answers.segment} : {...common,
    fixedCosts:parseBrazilianNumber(answers.fixedCosts),
    ...(answers.taxInputMode !== undefined ? {taxInputMode:answers.taxInputMode} : {}),
    ...(answers.taxInputMode === 'amount' ? {taxAmount:parseBrazilianNumber(answers.taxAmount)} : {taxPercent:parseBrazilianNumber(answers.taxPercent)}),
    feesPercent:parseBrazilianNumber(answers.feesPercent),otherVariablePercent:parseBrazilianNumber(answers.otherVariablePercent)};
}
