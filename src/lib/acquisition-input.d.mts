export interface Municipality {id:string;name:string;uf:string}
export const ERP_SYSTEMS:string[];
export interface RevenueBand {value:string;label:string;plan:'knight'|'rook'|null;upTo:number|null}
export const REVENUE_BANDS:RevenueBand[];
export const LEGACY_REVENUE_BANDS:RevenueBand[];
export const REVENUE_BAND_PLAN_LABELS:{knight:string;rook:string};
export function revenueBandInfo(value:unknown):RevenueBand|null;
export function normalizeSearch(value:unknown):string;
export function normalizePhone(value:unknown):string|null;
export function searchMunicipalities(cities:Municipality[],query:string):Municipality[];
export function deriveRevenueBand(value:unknown):string;
export function buildSimulationInput(answers:Record<string,string>,tool:string):unknown;
