import { randomUUID } from 'node:crypto';
export const CONTACT_ID = '11111111-1111-4111-8111-111111111111';
export const DEAL_ID = '22222222-2222-4222-8222-222222222222';
export const RECEIPT = {contactId:CONTACT_ID,dealId:DEAL_ID,contactIds:[CONTACT_ID]};

/** Dublê do transporte RPC; as regras SQL têm testes próprios no rook-system. */
export function memoryLedger() {
  const records = new Map(), calls = [];
  async function request(path, options) {
    const body = JSON.parse(options.body); calls.push({path,body});
    const id = body.p_submission_id;
    if (path.endsWith('claim_financial_submission_v1')) {
      let row = records.get(id);
      const hash = JSON.stringify(body.p_request);
      if (row && row.request_hash !== hash) return {status:'conflict'};
      if (row?.crm_status === 'confirmed') return {status:'confirmed',submission:structuredClone(row)};
      if (row?.crm_status === 'needs_reconciliation') return {status:'needs_reconciliation'};
      if (row?.crm_status === 'processing') return {status:'busy'};
      if (!row) { row = {id:randomUUID(),submission_id:id,request_hash:hash,request_payload:body.p_request,snapshot:body.p_snapshot,crm_status:'pending',asaflow_contact_id:null,asaflow_deal_id:null}; records.set(id,row); }
      row.crm_status='processing'; row.lease_token=randomUUID();
      return {status:'claimed',submission:structuredClone(row),lease_token:row.lease_token};
    }
    const row = records.get(id);
    if (!row || row.lease_token !== body.p_lease_token || row.crm_status !== 'processing') return {status:'stale_lease'};
    const receipt=body.p_receipt;
    if (body.p_transition==='contact_resolved') row.asaflow_contact_id=receipt.contact_id;
    if (body.p_transition==='deal_created') row.asaflow_deal_id=receipt.deal_id;
    if (body.p_transition==='confirmed') {
      if (!receipt.contact_ids?.includes(receipt.contact_id) || receipt.deal_id!==row.asaflow_deal_id || receipt.contact_id!==row.asaflow_contact_id) { row.crm_status='needs_reconciliation'; return {status:'needs_reconciliation'}; }
      row.crm_status='confirmed';
    }
    if (body.p_transition==='retryable_error' || body.p_transition==='needs_reconciliation') row.crm_status=body.p_transition;
    return {status:row.crm_status==='confirmed'?'confirmed':'updated',submission:structuredClone(row)};
  }
  return {request,records,calls};
}

export async function checkpointReceipt(options, receipt=RECEIPT) {
  await options.checkpoint('contact_resolved',{contact_id:receipt.contactId});
  if (!options.dealId) { await options.checkpoint('deal_requested',{}); await options.checkpoint('deal_created',{deal_id:receipt.dealId}); }
  return receipt;
}
