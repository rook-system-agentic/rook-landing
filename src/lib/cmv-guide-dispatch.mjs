const SETTLED_PROVIDER_EVENTS = new Set(["delivered", "bounced", "failed"]);
const COUNTER_NAMES = ["claimed", "accepted", "retried", "failed", "delivered", "bounced", "reconciled", "needsReconciliation"];

export class CmvGuideDispatchError extends Error {
  constructor(code) {
    super(code);
    this.name = "CmvGuideDispatchError";
    this.code = code;
  }
}

function counters() {
  return Object.fromEntries(COUNTER_NAMES.map((name) => [name, 0]));
}

function errorCode(error) {
  return typeof error?.code === "string" ? error.code : "dispatch_unavailable";
}

function outcomeFor(error) {
  const code = errorCode(error);
  if (["provider_payload_conflict", "provider_ambiguous", "asset_missing", "asset_checksum_mismatch", "asset_too_large", "test_recipient_mismatch", "invalid_cmv_guide_envelope_input"].includes(code)) {
    return { outcome: "needs_reconciliation", counter: "needsReconciliation", code };
  }
  if (["provider_permanent"].includes(code)) return { outcome: "failed", counter: "failed", code };
  return { outcome: "retry", counter: "retried", code: [
    "asset_timeout", "asset_unavailable", "database_unavailable", "provider_transient", "dispatch_unavailable",
  ].includes(code) ? code : "dispatch_unavailable" };
}

async function finishQuietly(finish, claim, outcome, providerId, errorCodeValue) {
  try {
    return (await finish(claim.id, claim.lease_token, outcome, providerId, errorCodeValue)) === true;
  } catch {
    // O lease/DB pode ter vencido. Não transformar essa falha de confirmação em envio novo.
    return false;
  }
}

function normalizedEmail(request) {
  return typeof request?.email === "string" ? request.email.trim().toLowerCase() : "";
}

export async function runCmvGuideDispatch({
  recordKind,
  testEmail = null,
  claim,
  prepare,
  finish,
  loadMaterials,
  buildEnvelope,
  sendEmail,
  listReceipts,
  readReceipt,
  recordReceipt,
  limit = 5,
} = {}) {
  if (!["test", "live"].includes(recordKind) || typeof claim !== "function" || typeof prepare !== "function"
    || typeof finish !== "function" || typeof loadMaterials !== "function" || typeof buildEnvelope !== "function"
    || typeof sendEmail !== "function") {
    throw new CmvGuideDispatchError("not_configured");
  }
  const result = counters();
  const claims = await claim(Math.min(5, Math.max(1, Math.trunc(limit))), recordKind);
  if (!Array.isArray(claims)) throw new CmvGuideDispatchError("invalid_claim_receipt");
  result.claimed = claims.length;

  await Promise.all(claims.map(async (item) => {
    if (recordKind === "test" && normalizedEmail(item.request) !== normalizedEmail({ email: testEmail })) {
      await finishQuietly(finish, item, "needs_reconciliation", null, "test_recipient_mismatch");
      result.needsReconciliation += 1;
      return;
    }
    try {
      const attachments = await loadMaterials(item);
      const envelope = await buildEnvelope(item, attachments);
      const prepared = await prepare(item.id, item.lease_token, envelope.envelopeHash);
      if (!prepared) {
        result.needsReconciliation += 1;
        return;
      }
      const provider = await sendEmail(envelope);
      if (!provider || typeof provider.id !== "string" || provider.id.length === 0) {
        const error = new CmvGuideDispatchError("provider_ambiguous");
        await finishQuietly(finish, item, "needs_reconciliation", null, error.code);
        result.needsReconciliation += 1;
        return;
      }
      if (await finishQuietly(finish, item, "accepted", provider.id, null)) result.accepted += 1;
      else result.needsReconciliation += 1;
    } catch (error) {
      const decision = outcomeFor(error);
      if (await finishQuietly(finish, item, decision.outcome, null, decision.code)) result[decision.counter] += 1;
      else result.needsReconciliation += 1;
    }
  }));

  if (typeof listReceipts === "function" && typeof readReceipt === "function" && typeof recordReceipt === "function") {
    const receipts = await listReceipts(Math.min(5, Math.max(1, Math.trunc(limit))), recordKind);
    if (!Array.isArray(receipts)) throw new CmvGuideDispatchError("invalid_receipts_receipt");
    await Promise.all(receipts.map(async (receipt) => {
      try {
        const event = await readReceipt(receipt.providerMessageId);
        if (!SETTLED_PROVIDER_EVENTS.has(event)) return;
        const updated = await recordReceipt(receipt.id, receipt.providerMessageId, event);
        if (updated) {
          result.reconciled += 1;
          if (event === "delivered") result.delivered += 1;
          if (event === "bounced") result.bounced += 1;
          if (event === "failed") result.failed += 1;
        }
      } catch {
        // Polling é best effort; o próximo lote consulta novamente sem expor detalhes do provedor.
      }
    }));
  }

  return Object.freeze(Object.fromEntries(COUNTER_NAMES.map((name) => [name, Math.max(0, Math.trunc(Number(result[name]) || 0))])));
}
