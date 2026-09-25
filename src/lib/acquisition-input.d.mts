export interface Municipality {id:string;name:string;uf:string}
export const ERP_SYSTEMS:string[];
export const REVENUE_BANDS:{value:string;label:string}[];
export function normalizeSearch(value:unknown):string;
export function normalizePhone(value:unknown):string|null;
export function searchMunicipalities(cities:Municipality[],query:string):Municipality[];
export function deriveRevenueBand(value:unknown):string;
export function buildSimulationInput(answers:Record<string,string>,tool:string):unknown;
