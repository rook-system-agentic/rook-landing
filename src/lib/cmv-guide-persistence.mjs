const REQUEST_STATES = new Set([
  "queued", "processing", "retry", "provider_accepted", "delivered",
  "failed", "needs_reconciliation", "bounced",
]);
const OUTCOMES = new Set(["accepted", "retry", "failed", "needs_reconciliation"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDER_ID = /^[A-Za-z0-9._:-]{1,256}$/;
const ERROR_CODE = /^[a-z][a-z0-9_]{1,70}$/;

export class CmvGuidePersistenceError extends Error {
  constructor(code, retryAfterSeconds = 30) {
    super(code);
    this.name = "CmvGuidePersistenceError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function firstRow(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value && typeof value === "object" ? value : null;
}

function validState(value) {
  return typeof value === "string" && REQUEST_STATES.has(value);
}

function validUuid(value) {
  return typeof value === "string" && UUID.test(value);
}

function sanitizeErrorCode(value, fallback = "persistence_unavailable") {
  return typeof value === "string" && ERROR_CODE.test(value) ? value : fallback;
}

function providerId(value) {
  return typeof value === "string" && PROVIDER_ID.test(value) ? value : null;
}

export function publicDeliveryState(value) {
  if (value === "processing" || value === "retry") return "queued";
  if (value === "bounced") return "failed";
  return validState(value) ? value : "needs_reconciliation";
}

export function createCmvGuidePersistence({ adminRequest } = {}) {
  if (typeof adminRequest !== "function") throw new CmvGuidePersistenceError("not_configured");
  const rpc = (name, body) => adminRequest(`rpc/${name}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  async function enqueue(request, recordKind) {
    const row = firstRow(await rpc("enqueue_cmv_guide_request_v1", {
      p_submission_id: request.submissionId,
      p_request: {
        name: request.name,
        email: request.email,
        phone: request.phone,
        restaurant: request.restaurant,
        commercialContactRequested: request.commercialContactRequested,
      },
      p_record_kind: recordKind,
    }));
    if (!row || !["created", "existing", "conflict"].includes(row.result)
      || !validUuid(row.request_id) || !validState(row.delivery_status)) {
      throw new CmvGuidePersistenceError("invalid_enqueue_receipt");
    }
    if (row.result === "conflict") throw new CmvGuidePersistenceError("conflict");
    return {
      result: row.result,
      requestId: row.request_id,
      state: publicDeliveryState(row.delivery_status),
    };
  }

  async function claim(limit, recordKind) {
    const rows = await rpc("claim_cmv_guide_deliveries_v1", {
      p_limit: Math.min(5, Math.max(1, Math.trunc(limit))),
      p_record_kind: recordKind,
    });
    if (!Array.isArray(rows)) throw new CmvGuidePersistenceError("invalid_claim_receipt");
    return rows.slice(0, 5).filter((row) => row && validUuid(row.id) && validUuid(row.lease_token)
      && validState(row.delivery_status) && (row.record_kind === "test" || row.record_kind === "live")
      && row.request && typeof row.request === "object");
  }

  async function prepare(requestId, leaseToken, envelopeHash) {
    if (!validUuid(requestId) || !validUuid(leaseToken) || !/^[0-9a-f]{64}$/.test(envelopeHash)) {
      throw new CmvGuidePersistenceError("invalid_prepare_input");
    }
    const row = firstRow(await rpc("prepare_cmv_guide_envelope_v1", {
      p_request_id: requestId,
      p_lease_token: leaseToken,
      p_envelope_hash: envelopeHash,
    }));
    if (!row || typeof row.prepared !== "boolean") throw new CmvGuidePersistenceError("invalid_prepare_receipt");
    return row.prepared;
  }

  async function finish(requestId, leaseToken, outcome, providerMessageId = null, errorCode = null) {
    if (!validUuid(requestId) || !validUuid(leaseToken) || !OUTCOMES.has(outcome)) {
      throw new CmvGuidePersistenceError("invalid_finish_input");
    }
    const id = providerId(providerMessageId);
    if (outcome === "accepted" && !id) throw new CmvGuidePersistenceError("invalid_provider_receipt");
    const row = firstRow(await rpc("finish_cmv_guide_delivery_v1", {
      p_request_id: requestId,
      p_lease_token: leaseToken,
      p_outcome: outcome,
      p_provider_message_id: id,
      p_error_code: errorCode ? sanitizeErrorCode(errorCode) : null,
    }));
    if (!row || typeof row.updated !== "boolean") throw new CmvGuidePersistenceError("invalid_finish_receipt");
    return row.updated;
  }

  async function listReceipts(limit, recordKind) {
    const rows = await rpc("list_cmv_guide_receipts_v1", {
      p_limit: Math.min(5, Math.max(1, Math.trunc(limit))),
      p_record_kind: recordKind,
    });
    if (!Array.isArray(rows)) throw new CmvGuidePersistenceError("invalid_receipts_receipt");
    return rows.slice(0, 5).filter((row) => validUuid(row?.id) && providerId(row?.provider_message_id))
      .map((row) => ({ id: row.id, providerMessageId: row.provider_message_id }));
  }

  async function recordReceipt(requestId, providerMessageId, deliveryState) {
    if (!validUuid(requestId) || !providerId(providerMessageId)
      || !["delivered", "bounced", "failed"].includes(deliveryState)) {
      throw new CmvGuidePersistenceError("invalid_receipt_input");
    }
    const row = firstRow(await rpc("record_cmv_guide_receipt_v1", {
      p_request_id: requestId,
      p_provider_message_id: providerMessageId,
      p_delivery_state: deliveryState,
    }));
    if (!row || typeof row.updated !== "boolean") throw new CmvGuidePersistenceError("invalid_receipt_result");
    return row.updated;
  }

  return { enqueue, claim, prepare, finish, listReceipts, recordReceipt };
}
