import type {AcquisitionLead} from './acquisition.mjs';
export function buildLeadDescription(lead:AcquisitionLead):string;
export function createAsaflowAcquisition(options:{apiKey:string;pipelineId:string;stageId:string;fetchImpl?:typeof fetch}):{create(lead:AcquisitionLead):Promise<{contactId:string;dealId:string}>};
