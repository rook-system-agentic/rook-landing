import {
  createHash,
  createHmac,
  randomBytes as nodeRandomBytes,
  timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";

export const COMMERCIAL_LEAD_RATE_LIMITS = Object.freeze({
  windowSeconds: 15 * 60,
  ip: 20,
  identity: 5,
});

export const COMMERCIAL_LEAD_CHALLENGE = Object.freeze({
  difficulty: 3,
  ttlSeconds: 10 * 60,
  maxClockSkewSeconds: 60,
});

export class CommercialLeadAbuseProtectionError extends Error {
  constructor(code) {
    super(code);
    this.name = "CommercialLeadAbuseProtectionError";
    this.code = code;
  }
}

function requireSecret(secret) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new CommercialLeadAbuseProtectionError("abuse_protection_not_configured");
  }
  return secret;
}

function firstValidIp(rawHeader) {
  if (typeof rawHeader !== "string" || rawHeader.length === 0) return null;

  for (const candidate of rawHeader.slice(0, 512).split(",")) {
    const value = candidate.trim().replace(/^\[|\]$/g, "");
    if (isIP(value)) return value.toLowerCase();
  }
  return null;
}

export function resolveCommercialLeadClientIp(headers) {
  for (const headerName of [
    "x-vercel-forwarded-for",
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
  ]) {
    const resolved = firstValidIp(headers.get(headerName));
    if (resolved) return resolved;
  }
  return null;
}

export function hashCommercialLeadSubject(secret, scope, rawValue) {
  requireSecret(secret);
  return createHmac("sha256", secret)
    .update(`rook:commercial-lead-abuse:v1:${scope}\0${rawValue}`)
    .digest("hex");
}

function signChallengePayload(secret, payload) {
  return createHmac("sha256", secret)
    .update(`rook:commercial-lead-challenge:v1\0${payload}`)
    .digest("hex");
}

function safeEqualHex(left, right) {
  if (!/^[0-9a-f]{64}$/.test(left) || !/^[0-9a-f]{64}$/.test(right)) {
    return false;
  }
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function hasValidCommercialLeadProof(token, solution, difficulty) {
  if (typeof token !== "string" || typeof solution !== "string") return false;
  if (!/^\d{1,12}$/.test(solution)) return false;
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 6) return false;

  return createHash("sha256")
    .update(`${token}.${solution}`)
    .digest("hex")
    .startsWith("0".repeat(difficulty));
}

export function createCommercialLeadAbuseProtection({
  adminRequest,
  secret,
  now = () => Date.now(),
  randomBytes = nodeRandomBytes,
} = {}) {
  const signingSecret = requireSecret(secret);
  if (typeof adminRequest !== "function") {
    throw new CommercialLeadAbuseProtectionError("abuse_protection_not_configured");
  }

  function requireClientIp(headers) {
    const clientIp = resolveCommercialLeadClientIp(headers);
    if (!clientIp) {
      throw new CommercialLeadAbuseProtectionError("client_ip_unavailable");
    }
    return clientIp;
  }

  function issueChallenge(headers) {
    const clientIp = requireClientIp(headers);
    const issuedAt = Math.floor(now() / 1000);
    const nonce = randomBytes(16).toString("hex");
    const ipHash = hashCommercialLeadSubject(signingSecret, "challenge-ip", clientIp);
    const payload = `v1.${issuedAt}.${nonce}.${ipHash}`;
    const signature = signChallengePayload(signingSecret, payload);

    return {
      token: `${payload}.${signature}`,
      difficulty: COMMERCIAL_LEAD_CHALLENGE.difficulty,
      expiresInSeconds: COMMERCIAL_LEAD_CHALLENGE.ttlSeconds,
    };
  }

  function verifiedChallengeDetails(headers, challenge) {
    if (!challenge || typeof challenge !== "object") return null;
    const { token, solution } = challenge;
    if (typeof token !== "string" || typeof solution !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 5) return null;
    const [version, rawIssuedAt, nonce, boundIpHash, signature] = parts;
    if (version !== "v1" || !/^\d{10,13}$/.test(rawIssuedAt)) return null;
    if (!/^[0-9a-f]{32}$/.test(nonce) || !/^[0-9a-f]{64}$/.test(boundIpHash)) return null;

    const issuedAt = Number(rawIssuedAt);
    const currentTime = Math.floor(now() / 1000);
    if (!Number.isSafeInteger(issuedAt)) return null;
    if (issuedAt > currentTime + COMMERCIAL_LEAD_CHALLENGE.maxClockSkewSeconds) return null;
    if (currentTime - issuedAt > COMMERCIAL_LEAD_CHALLENGE.ttlSeconds) return null;

    const clientIp = resolveCommercialLeadClientIp(headers);
    if (!clientIp) return null;
    const expectedIpHash = hashCommercialLeadSubject(signingSecret, "challenge-ip", clientIp);
    if (!safeEqualHex(boundIpHash, expectedIpHash)) return null;

    const payload = `${version}.${rawIssuedAt}.${nonce}.${boundIpHash}`;
    const expectedSignature = signChallengePayload(signingSecret, payload);
    if (!safeEqualHex(signature, expectedSignature)) return null;

    if (!hasValidCommercialLeadProof(
      token,
      solution,
      COMMERCIAL_LEAD_CHALLENGE.difficulty,
    )) return null;

    return {
      clientIp,
      nonceHash: hashCommercialLeadSubject(signingSecret, "challenge-nonce", nonce),
      issuedAt,
      expiresAt: issuedAt + COMMERCIAL_LEAD_CHALLENGE.ttlSeconds,
    };
  }

  function verifyChallenge(headers, challenge) {
    return verifiedChallengeDetails(headers, challenge) !== null;
  }

  async function consumeAbuseGate(headers, lead, challenge) {
    const verified = verifiedChallengeDetails(headers, challenge);
    if (!verified) {
      throw new CommercialLeadAbuseProtectionError("invalid_challenge");
    }

    const body = {
      p_nonce_hash: verified.nonceHash,
      p_nonce_issued_at: new Date(verified.issuedAt * 1000).toISOString(),
      p_nonce_expires_at: new Date(verified.expiresAt * 1000).toISOString(),
      p_ip_hash: hashCommercialLeadSubject(signingSecret, "ip", verified.clientIp),
      p_cnpj_hash: hashCommercialLeadSubject(signingSecret, "cnpj", lead.cnpj),
      p_email_hash: hashCommercialLeadSubject(signingSecret, "email", lead.email),
      p_window_seconds: COMMERCIAL_LEAD_RATE_LIMITS.windowSeconds,
      p_ip_limit: COMMERCIAL_LEAD_RATE_LIMITS.ip,
      p_identity_limit: COMMERCIAL_LEAD_RATE_LIMITS.identity,
    };

    const rows = await adminRequest("rpc/consume_commercial_lead_abuse_gate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const decision = rows?.[0];
    const acceptedReasons = new Set([
      "allowed",
      "nonce_replayed",
      "ip_rate_limited",
      "identity_rate_limited",
    ]);
    if (
      !decision
      || typeof decision.allowed !== "boolean"
      || !acceptedReasons.has(decision.reason)
      || (decision.allowed && decision.reason !== "allowed")
      || (!decision.allowed && decision.reason === "allowed")
      || !Number.isFinite(Number(decision.retry_after_seconds))
    ) {
      throw new CommercialLeadAbuseProtectionError("invalid_rate_limit_response");
    }

    return {
      allowed: decision.allowed,
      reason: decision.reason,
      retryAfterSeconds: Math.max(0, Math.ceil(Number(decision.retry_after_seconds))),
    };
  }

  return { issueChallenge, verifyChallenge, consumeAbuseGate };
}
