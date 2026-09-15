import type {FinancialSuccess} from './financial-simulation.mjs';
export interface Municipality {id:string;name:string;uf:string}
export interface AcquisitionLead {submissionId:string;name:string;company:string;email:string;phone:string;city:Municipality;segment:string;segmentOther:string|null;revenueBand:string;usesErp:boolean;erp:string|null;erpOther:string|null;intent:string;consent:true;period:string|null;simulation:FinancialSuccess|null}
export const ERP_SYSTEMS:string[];
export const REVENUE_BANDS:{value:string;label:string}[];
export function normalizeSearch(value:unknown):string;
export function normalizePhone(value:unknown):string|null;
export function searchMunicipalities(cities:Municipality[],query:string):Municipality[];
export function deriveRevenueBand(value:unknown):string;
export function buildSimulationInput(answers:Record<string,string>,tool:string):unknown;
export function validateAcquisition(candidate:unknown,cities:Municipality[]):{ok:true;value:AcquisitionLead}|{ok:false;errors:Record<string,string>};
