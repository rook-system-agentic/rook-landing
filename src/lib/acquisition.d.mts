import type {FinancialSuccess} from './financial-simulation.mjs';
import type {LeadAttribution} from './lead-attribution.mjs';
import type {FinancialReferenceBasis} from './financial-reference.mjs';
import type { Municipality } from './acquisition-input.mjs';
export type { Municipality } from './acquisition-input.mjs';
export { ERP_SYSTEMS, REVENUE_BANDS, normalizeSearch, normalizePhone, searchMunicipalities, deriveRevenueBand, buildSimulationInput } from './acquisition-input.mjs';
export interface AcquisitionLead {submissionId:string;name:string;company:string;email:string;phone:string;city:Municipality;segment:string;segmentOther:string|null;revenueBand:string;usesErp:boolean;erp:string|null;erpOther:string|null;intent:string;consent:true;period:string|null;referenceBasis?:FinancialReferenceBasis;simulation:FinancialSuccess|null;diagnosticNotes:string[];attribution?:LeadAttribution|null}
export function validateAcquisition(candidate:unknown,cities:Municipality[]):{ok:true;value:AcquisitionLead}|{ok:false;errors:Record<string,string>};
