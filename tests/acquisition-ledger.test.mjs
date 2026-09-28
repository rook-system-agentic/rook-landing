import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAcquisitionSnapshot, createAcquisitionLedger } from '../src/lib/acquisition-ledger.mjs';
import { createAsaflowAcquisition } from '../src/lib/asaflow-acquisition.mjs';
import { validateFinancialAcquisition } from '../src/lib/financial-acquisition.mjs';
import { validateAcquisition } from '../src/lib/acquisition.mjs';
import { financialLead } from './helpers/financial-acquisition-route.mjs';
import { CONTACT_ID, DEAL_ID, memoryLedger } from './helpers/acquisition-ledger.mjs';

const complete=()=>validateFinancialAcquisition(financialLead).value;
const commercial={...financialLead,company:'Casa Teste',cityId:'3550308',segment:'hamburgueria',revenueBand:'up_to_100k',usesErp:'no',consent:true,simulation:undefined};
const cities=[{id:'3550308',name:'São Paulo',uf:'SP'}];
const json=value=>({ok:true,json:async()=>structuredClone(value)});
function provider({contactIds=[CONTACT_ID],failRead=false,log=[]}={}) {
  const calls=[];
  const crm=createAsaflowAcquisition({apiKey:'test-only',pipelineId:'test-pipeline',stageId:'test-stage',fetchImpl:async(url,options)=>{
    const path=new URL(url).pathname.replace('/api/v1','');
    calls.push({path,...options}); log.push(`${options.method} ${path}`);
    if(path==='/contacts' && options.method==='GET') return json({data:[],nextCursor:null});
    if(path==='/contacts') return json({id:CONTACT_ID});
    if(path===`/contacts/${CONTACT_ID}`) return json({id:CONTACT_ID,email:'atualizado@example.invalid',phone:'+5521999999999'});
    if(path==='/deals') return json({id:DEAL_ID,contactIds});
    if(failRead) throw new Error('provider indisponível para teste');
    return json({id:DEAL_ID,contactIds});
  }});
  return {crm,calls};
}

test('snapshot distingue demonstração, parcial e cálculo; zero informado não vira ausente',()=>{
  const none=buildAcquisitionSnapshot(validateAcquisition(commercial,cities).value,{capturePath:'/diagnostico/'});
  assert.equal(none.request.analysisState,'none'); assert.equal(none.snapshot.inputs,null);
  assert.equal(none.request.capturePath,'/diagnostico');
  const partial=buildAcquisitionSnapshot(validateAcquisition({...commercial,intent:'breakeven',costInputMode:'purchases_amount',referenceBasis:'last_month',revenue:'100.000',fixedCosts:'0'},cities).value);
  assert.equal(partial.request.analysisState,'partial');
  assert.equal(partial.snapshot.inputs.revenue,100000);assert.equal(partial.snapshot.inputs.fixedCosts,0);
  assert.ok(partial.snapshot.missingFields.includes('purchasesAmount'));
  assert.equal(partial.snapshot.fullSimulation,null);assert.equal(partial.snapshot.publicSimulation,null);
  const full=buildAcquisitionSnapshot(complete());
  assert.equal(full.request.analysisState,'complete');assert.equal(full.snapshot.fullSimulation.result.estimatedNetRevenue,91175);
  assert.equal(full.snapshot.publicSimulation.result.estimatedNetRevenue,91175);
  assert.ok(full.snapshot.formulaVersion);assert.ok(full.snapshot.modelVersion);
  assert.equal(full.request.formulaVersion,undefined);assert.equal(full.request.fullSimulation,undefined);
  assert.equal(buildAcquisitionSnapshot({...complete(),recordKind:'test'}).request.recordKind,'live');
});

test('ledger antecede CRM e confirma só após leitura do vínculo; negócio inclui referência ADM',async()=>{
  const store=memoryLedger(),log=[];
  const transport=provider({log});
  const adminRequest=async(path,options)=>{log.push(JSON.parse(options.body).p_transition||'claim');return store.request(path,options);};
  const saved=await createAcquisitionLedger({adminRequest,crm:transport.crm}).persist(complete());
  assert.deepEqual(log,['claim','GET /contacts','contact_requested','POST /contacts','contact_resolved','deal_requested','POST /deals','deal_created',`GET /deals/${DEAL_ID}`,'confirmed']);
  assert.equal(saved.publicSimulation.ok,true);
  const row=store.records.get(financialLead.submissionId);
  assert.equal(row.crm_status,'confirmed');assert.equal(row.asaflow_contact_id,CONTACT_ID);
  const deal=JSON.parse(transport.calls.find(call=>call.path==='/deals').body);
  assert.match(deal.description,new RegExp(`onboarding-diagnosticos\\?analysis=${row.id}`));
  assert.match(deal.description,/Estado da análise: cálculo registrado/);
});

test('replay confirmado devolve snapshot original após mudança da fórmula e não chama CRM',async()=>{
  const store=memoryLedger(),transport=provider();
  const ledger=createAcquisitionLedger({adminRequest:store.request,crm:transport.crm});
  const first=await ledger.persist(complete());const calls=transport.calls.length;
  const newer=complete();newer.simulation.formulaVersion='versao-nova';newer.simulation.result.estimatedNetRevenue=999;
  const second=await ledger.persist(newer);
  assert.deepEqual(second,first);assert.equal(transport.calls.length,calls);
  assert.notEqual(store.records.get(financialLead.submissionId).snapshot.formulaVersion,'versao-nova');
});

test('mesmo ID com contato, consentimento ou inputs diferentes é conflito sem CRM',async()=>{
  const store=memoryLedger(),transport=provider();const ledger=createAcquisitionLedger({adminRequest:store.request,crm:transport.crm});
  await ledger.persist(complete());const count=transport.calls.length;
  for(const change of [value=>value.email='outra@example.invalid',value=>value.commercialContactRequested=true,value=>value.simulation.inputs.revenue++]){
    const candidate=complete();change(candidate);await assert.rejects(()=>ledger.persist(candidate),/conflict/);
  }
  assert.equal(transport.calls.length,count);
});

test('claim ocupado ou banco indisponível não acessam CRM nem produzem resultado',async()=>{
  for(const adminRequest of [async()=>({status:'busy'}),async()=>{throw new Error('db indisponível');}]){
    const transport=provider();await assert.rejects(()=>createAcquisitionLedger({adminRequest,crm:transport.crm}).persist(complete()));
    assert.equal(transport.calls.length,0);
  }
});

test('negócio sem vínculo preserva seus IDs e exige reconciliação, sem recriação no retry',async()=>{
  const store=memoryLedger(),transport=provider({contactIds:[]});
  const ledger=createAcquisitionLedger({adminRequest:store.request,crm:transport.crm});
  await assert.rejects(()=>ledger.persist(complete()),/contact_link_mismatch/);
  const row=store.records.get(financialLead.submissionId);
  assert.equal(row.crm_status,'needs_reconciliation');assert.equal(row.asaflow_deal_id,DEAL_ID);
  assert.ok(row.snapshot.fullSimulation.result);const calls=transport.calls.length;
  await assert.rejects(()=>ledger.persist(complete()),/needs_reconciliation/);assert.equal(transport.calls.length,calls);
});

test('falha de leitura depois do recibo retoma só leitura e tolera edição legítima do contato',async()=>{
  const store=memoryLedger(),failed=provider({failRead:true});
  await assert.rejects(()=>createAcquisitionLedger({adminRequest:store.request,crm:failed.crm}).persist(complete()));
  assert.equal(store.records.get(financialLead.submissionId).asaflow_deal_id,DEAL_ID);
  const recovered=provider();
  const saved=await createAcquisitionLedger({adminRequest:store.request,crm:recovered.crm}).persist(complete());
  assert.equal(saved.publicSimulation.ok,true);
  assert.deepEqual(recovered.calls.map(call=>[call.method,call.path]),[['GET',`/contacts/${CONTACT_ID}`],['GET',`/deals/${DEAL_ID}`]]);
});

test('lease perdida antes do contato impede o POST e a liberação do resultado',async()=>{
  const store=memoryLedger(),transport=provider();
  const adminRequest=(path,options)=>JSON.parse(options.body).p_transition==='contact_requested'?{status:'stale_lease'}:store.request(path,options);
  await assert.rejects(()=>createAcquisitionLedger({adminRequest,crm:transport.crm}).persist(complete()),/stale_lease/);
  assert.deepEqual(transport.calls.map(call=>call.method),['GET']);
});

test('confirmação que persistiu mas perdeu resposta é reconciliada sem recriar no próximo envio',async()=>{
  const store=memoryLedger(),transport=provider();let lost=true;
  const adminRequest=async(path,options)=>{
    const result=await store.request(path,options);
    if(JSON.parse(options.body).p_transition==='confirmed' && lost){lost=false;throw new Error('resposta DB perdida');}
    return result;
  };
  const ledger=createAcquisitionLedger({adminRequest,crm:transport.crm});
  await assert.rejects(()=>ledger.persist(complete()));const calls=transport.calls.length;
  assert.equal((await ledger.persist(complete())).publicSimulation.ok,true);assert.equal(transport.calls.length,calls);
});

test('erro de transporte é sanitizado sem PII no recibo de falha',async()=>{
  const store=memoryLedger();const crm={create:async()=>{throw new Error('teste@example.invalid telefone 11999999999');}};
  await assert.rejects(()=>createAcquisitionLedger({adminRequest:store.request,crm}).persist(complete()));
  const failure=store.calls.at(-1).body;
  assert.deepEqual(failure.p_receipt,{error_code:'integration_unavailable'});
});

test('modo de reconciliação com recibos faz apenas GET e não admite IDs ausentes',async()=>{
  const transport=provider();
  const receipt=await transport.crm.create(complete(),{verificationOnly:true,contactId:CONTACT_ID,dealId:DEAL_ID});
  assert.equal(receipt.dealId,DEAL_ID);assert.ok(transport.calls.every(call=>call.method==='GET'));
  const count=transport.calls.length;
  await assert.rejects(()=>transport.crm.create(complete(),{verificationOnly:true,contactId:CONTACT_ID}),/invalid_verification_receipt/);
  assert.equal(transport.calls.length,count);
});
