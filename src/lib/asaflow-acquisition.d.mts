import type {AcquisitionLead} from './acquisition.mjs';
import type {FinancialAcquisitionLead} from './financial-acquisition.mjs';
type Lead = AcquisitionLead | FinancialAcquisitionLead;
export function acquisitionOrigin(lead:Lead):string;
export function buildContactProperties(lead:Lead):Record<string,string|null>;
export function buildDealProperties(lead:Lead):Record<string,string>;
export function buildLeadDescription(lead:Lead):string;
export function createAsaflowAcquisition(options:{apiKey:string;pipelineId:string;stageId:string;fetchImpl?:typeof fetch}):{create(lead:Lead):Promise<{contactId:string;dealId:string}>};
