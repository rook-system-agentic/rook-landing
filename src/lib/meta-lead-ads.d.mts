export type MetaLeadsMode = 'live' | 'dry_run';
export type MetaLeadsStatus = 'disabled' | 'misconfigured' | 'ok';
export interface MetaLeadsConfig {
  enabled:boolean;
  status:MetaLeadsStatus;
  reason:string|null;
  mode:MetaLeadsMode;
  token:string;
  formIds:string[];
  lookbackHours:number;
  ownerUserId:string|null;
  ownerUserIdInvalid:boolean;
  apiKey:string;
  graphBaseUrl:string;
}
export interface MetaLead {
  id:string;
  createdTime:string|null;
  adId:string|null;
  adName:string|null;
  adsetId:string|null;
  adsetName:string|null;
  campaignId:string|null;
  campaignName:string|null;
  formId:string|null;
  platform:string|null;
  isOrganic:boolean;
  isTest:boolean;
  name:string;
  email:string;
  phone:string;
  city:string|null;
  restaurant:string|null;
  role:string;
  revenue:string;
  consent:'sim'|'não';
  consentShape:'absent'|'checked'|'unchecked';
}
export const META_GRAPH_BASE_URL:string;
export const META_LEADS_TIMEOUT_MS:number;
export const META_LEADS_FIELDS:string;
export const META_REVENUE_LABELS:string[];
export function normalizeMetaKey(value:unknown):string;
export function metaLeadsConfig(env?:Record<string,unknown>):MetaLeadsConfig;
export function consentShape(value:unknown):'absent'|'checked'|'unchecked';
export function isValidMetaLeadShape(value:unknown):boolean;
export function normalizeMetaLead(value:unknown):MetaLead|null;
export function fetchMetaLeads(options:{config:MetaLeadsConfig;fetchImpl?:typeof fetch;now?:Date|string|number}):Promise<{
  leads:MetaLead[];
  fetched:number;
  errors:string[];
  fieldKeys:string[];
  consentCounts:{absent:number;checked:number;unchecked:number};
}>;
export function buildMetaLeadDescription(lead:MetaLead):string;
export function isMetaFormId(value:unknown):boolean;
export function isMetaLeadId(value:unknown):boolean;
