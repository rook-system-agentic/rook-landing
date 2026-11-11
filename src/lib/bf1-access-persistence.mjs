import { normalizeLeadAttribution } from "./lead-attribution.mjs";
import { BF1_ACCESS_CAMPAIGN, BF1_ACCESS_NOTICE_VERSION } from "./bf1-access-validation.mjs";

/*
 * Grava o cadastro da /bl1 pela RPC register_bf1_community_access_v1
 * (rook-system, migration 20270107213417_roo1848). Os nomes dos parâmetros
 * abaixo são contrato com a assinatura SQL; o teste PGlite do rook-system
 * confere o lado do banco e bf1-access.test.mjs confere este lado.
 */
export const BF1_ACCESS_RPC = "register_bf1_community_access_v1";
export const BF1_ACCESS_RPC_PARAMS = Object.freeze([
  "p_submission_id",
  "p_campaign",
  "p_request",
  "p_notice_version",
  "p_record_kind",
  "p_attribution",
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class Bf1AccessPersistenceError extends Error {
  constructor(code) {
    super(code);
    this.name = "Bf1AccessPersistenceError";
    this.code = code;
  }
}

function firstRow(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value && typeof value === "object" ? value : null;
}

export function createBf1AccessPersistence({ adminRequest } = {}) {
  if (typeof adminRequest !== "function") throw new Bf1AccessPersistenceError("not_configured");

  async function register(request, recordKind) {
    if (recordKind !== "test" && recordKind !== "live") throw new Bf1AccessPersistenceError("invalid_record_kind");
    const body = {
      p_submission_id: request.submissionId,
      p_campaign: BF1_ACCESS_CAMPAIGN,
      p_request: {
        name: request.name,
        email: request.email,
        phone: request.phone,
        restaurant: request.restaurant,
        commercialContactRequested: request.commercialContactRequested,
      },
      p_notice_version: BF1_ACCESS_NOTICE_VERSION,
      p_record_kind: recordKind,
      p_attribution: normalizeLeadAttribution(request.attribution) ?? null,
    };
    const row = firstRow(await adminRequest(`rpc/${BF1_ACCESS_RPC}`, {
      method: "POST",
      body: JSON.stringify(body),
    }));
    if (!row || !["created", "existing", "conflict"].includes(row.result)
      || typeof row.request_id !== "string" || !UUID.test(row.request_id)) {
      throw new Bf1AccessPersistenceError("invalid_register_receipt");
    }
    if (row.result === "conflict") throw new Bf1AccessPersistenceError("conflict");
    return {
      result: row.result,
      requestId: row.request_id,
      attributionRecorded: row.attribution_recorded === true,
    };
  }

  return { register };
}
