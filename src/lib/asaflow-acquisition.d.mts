import type {AcquisitionLead} from './acquisition.mjs';
import type {FinancialAcquisitionLead} from './financial-acquisition.mjs';
type Lead = AcquisitionLead | FinancialAcquisitionLead;
export function acquisitionOrigin(lead:Lead):string;
export function buildContactProperties(lead:Lead):Record<string,string|null>;
export function buildDealProperties(lead:Lead):Record<string,string|boolean>;
export function buildLeadDescription(lead:Lead,options?:{environment?:string}):string;
export interface AcquisitionReceipt {contactId:string;dealId:string;contactIds:string[]}
export function createAsaflowAcquisition(options:{apiKey:string;pipelineId:string;stageId:string;environment?:string;fetchImpl?:typeof fetch}):{create(lead:Lead,options?:{contactId?:string|null;dealId?:string|null;verificationOnly?:boolean;checkpoint?:(transition:string,receipt:Record<string,unknown>)=>Promise<unknown>}):Promise<AcquisitionReceipt>};
