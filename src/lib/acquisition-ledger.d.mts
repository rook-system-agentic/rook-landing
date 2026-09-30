import type { AcquisitionLead } from './acquisition.mjs';
import type { FinancialAcquisitionLead } from './financial-acquisition.mjs';
import type { PublicFinancialSuccess } from './public-financial-simulation.mjs';
import type { createAsaflowAcquisition } from './asaflow-acquisition.mjs';
type Lead = AcquisitionLead | FinancialAcquisitionLead;
export class AcquisitionPersistenceError extends Error { code: string; retryAfterSeconds: number; constructor(code:string,retryAfterSeconds?:number); }
export function buildAcquisitionSnapshot(lead:Lead, options?:{capturePath?:unknown;recordKind?:string}):{request:Record<string,unknown>;snapshot:Record<string,unknown>};
export function createAcquisitionLedger(options:{adminRequest:(path:string,options?:RequestInit)=>Promise<unknown>;crm:ReturnType<typeof createAsaflowAcquisition>}):{persist(lead:Lead, options?:{capturePath?:unknown;recordKind?:string}):Promise<{publicSimulation:PublicFinancialSuccess|null;submissionId:string}>};
