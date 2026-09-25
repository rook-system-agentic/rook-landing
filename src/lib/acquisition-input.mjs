import { parseBrazilianNumber } from './financial-number.mjs';

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
    fixedCosts:parseBrazilianNumber(answers.fixedCosts),
    ...(answers.taxInputMode !== undefined ? {taxInputMode:answers.taxInputMode} : {}),
    ...(answers.taxInputMode === 'amount' ? {taxAmount:parseBrazilianNumber(answers.taxAmount)} : {taxPercent:parseBrazilianNumber(answers.taxPercent)}),
    feesPercent:parseBrazilianNumber(answers.feesPercent),otherVariablePercent:parseBrazilianNumber(answers.otherVariablePercent)};
}

