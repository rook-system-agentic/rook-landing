import type {MetaLeadsMode} from './meta-lead-ads.mjs';
export interface MetaLeadSyncReport {
  status:'disabled'|'misconfigured'|'ok'|'partial'|'aborted';
  mode:MetaLeadsMode;
  forms:number;
  lookbackHours:number;
  fetched:number;
  test:number;
  alreadySynced:number;
  eligible:number;
  created:number;
  skipped:Record<string,number>;
  errors:Record<string,number>;
  consentShape:{absent:number;checked:number;unchecked:number};
  fieldKeys:string[];
  asaflow?:'configured'|'not_configured';
}
export const META_SYNC_MAX_LEADS_PER_RUN:number;
export const META_SYNC_TIME_BUDGET_MS:number;
export function syncMetaLeads(options?:{env?:Record<string,unknown>;fetchImpl?:typeof fetch;now?:Date|string|number;clock?:()=>number;timeBudgetMs?:number}):Promise<MetaLeadSyncReport>;
