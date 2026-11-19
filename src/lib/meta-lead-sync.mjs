import {fetchMetaLeads,metaLeadsConfig} from './meta-lead-ads.mjs';
import {createMetaDeal,listSyncedLeadIds,resolveAsaflowContact} from './meta-lead-asaflow.mjs';

// A função tem 60s (maxDuration). Paramos de iniciar leads novos bem antes disso
// para nunca interromper uma gravação no meio; o restante entra na próxima rodada.
export const META_SYNC_MAX_LEADS_PER_RUN=20;
export const META_SYNC_TIME_BUDGET_MS=40_000;

function emptyCounts() {
  return {skipped:{},errors:{}};
}

function addCount(target,code) {
  target[code]=(target[code]||0)+1;
}

function reportBase(config) {
  return {
    status:config.status,mode:config.mode,forms:config.formIds.length,lookbackHours:config.lookbackHours,
    fetched:0,test:0,alreadySynced:0,eligible:0,created:0,skipped:{},errors:{},
    consentShape:{absent:0,checked:0,unchecked:0},fieldKeys:[],
  };
}

function classifyMetaCode(report,code) {
  if(code==='invalid_lead') addCount(report.skipped,code);
  else addCount(report.errors,code);
}

function classifyLeadError(report,error) {
  const code=error instanceof Error ? error.message : 'sync_unknown';
  if(code==='contact_ambiguous') addCount(report.skipped,code);
  else addCount(report.errors,code);
}

function finalStatus(report) {
  if(Object.keys(report.errors).length>0 || Object.keys(report.skipped).some(code=>code!=='already_synced')) return 'partial';
  return 'ok';
}

/** Executa uma rodada; somente este módulo decide quando há escrita permitida. */
export async function syncMetaLeads({env=process.env,fetchImpl=fetch,now=Date.now(),clock=()=>Date.now(),timeBudgetMs=META_SYNC_TIME_BUDGET_MS}={}) {
  const startedAt=clock();
  const config=metaLeadsConfig(env);
  const report=reportBase(config);
  if(config.ownerUserIdInvalid) addCount(report.skipped,'owner_user_id_invalid');
  if(config.status==='disabled' || config.status==='misconfigured') return report;

  const meta=await fetchMetaLeads({config,fetchImpl,now});
  report.fetched=meta.fetched;
  report.test=meta.leads.filter(lead=>lead.isTest).length;
  report.consentShape=meta.consentCounts;
  report.fieldKeys=meta.fieldKeys;
  for(const code of meta.errors) classifyMetaCode(report,code);

  const asaflowConfigured=Boolean(config.apiKey);
  if(config.mode==='dry_run' && !asaflowConfigured) {
    report.asaflow='not_configured';
    report.alreadySynced=0;
    report.eligible=meta.leads.length;
    report.status=finalStatus(report);
    return report;
  }
  report.asaflow='configured';

  let synced;
  try {
    synced=await listSyncedLeadIds({apiKey:config.apiKey,lookbackHours:config.lookbackHours,fetchImpl});
  } catch {
    addCount(report.errors,'asaflow_dedupe_unavailable');
    report.status='aborted';
    return report;
  }

  let attempted=0;
  for(const lead of meta.leads) {
    if(synced.has(lead.id)) {
      report.alreadySynced+=1;
      continue;
    }
    if(config.mode==='live' && attempted>=META_SYNC_MAX_LEADS_PER_RUN) {
      addCount(report.skipped,'max_leads_per_run');
      continue;
    }
    if(clock()-startedAt>=timeBudgetMs) {
      addCount(report.skipped,'time_budget');
      continue;
    }
    attempted+=1;
    try {
      const resolved=await resolveAsaflowContact({apiKey:config.apiKey,lead,fetchImpl,create:config.mode==='live'});
      // Ambiguidade de contato não é elegibilidade: nada seria criado nesse caso.
      report.eligible+=1;
      if(config.mode==='dry_run') continue;
      if(!resolved.contactId) throw new Error('asaflow_invalid_contact');
      await createMetaDeal({apiKey:config.apiKey,lead,contactId:resolved.contactId,ownerUserId:config.ownerUserId,fetchImpl});
      report.created+=1;
    } catch(error) {
      classifyLeadError(report,error);
    }
  }
  report.status=finalStatus(report);
  return report;
}
