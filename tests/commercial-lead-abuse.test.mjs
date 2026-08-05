import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  COMMERCIAL_LEAD_CHALLENGE,
  COMMERCIAL_LEAD_RATE_LIMITS,
  createCommercialLeadAbuseProtection,
  resolveCommercialLeadClientIp,
} from "../src/lib/commercial-lead-abuse-protection.mjs";

const SECRET = "test-only-secret-that-is-longer-than-thirty-two-bytes";
const NOW = Date.UTC(2026, 7, 5, 18, 0, 0);

function headers(values = {}) {
  const normalized = new Map(
    Object.entries(values).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return { get: (name) => normalized.get(name.toLowerCase()) ?? null };
}

function solve(token, difficulty) {
  for (let nonce = 0; nonce <= 1_000_000; nonce += 1) {
    const solution = String(nonce);
    if (
      createHash("sha256")
        .update(`${token}.${solution}`)
        .digest("hex")
        .startsWith("0".repeat(difficulty))
    ) {
      return solution;
    }
  }
  throw new Error("proof not found");
}

test("resolve o primeiro IP válido dos headers do proxy", () => {
  assert.equal(
    resolveCommercialLeadClientIp(
      headers({ "x-forwarded-for": "203.0.113.20, 10.0.0.1" }),
    ),
    "203.0.113.20",
  );
  assert.equal(resolveCommercialLeadClientIp(headers({ "x-real-ip": "inválido" })), null);
});

test("challenge assinado e vinculado ao IP aceita prova e rejeita reuso em outro IP", () => {
  const protection = createCommercialLeadAbuseProtection({
    adminRequest: async () => [],
    secret: SECRET,
    now: () => NOW,
    randomBytes: () => Buffer.alloc(16, 7),
  });
  const originalHeaders = headers({ "x-forwarded-for": "203.0.113.20" });
  const challenge = protection.issueChallenge(originalHeaders);
  const answer = {
    token: challenge.token,
    solution: solve(challenge.token, challenge.difficulty),
  };

  assert.equal(challenge.difficulty, COMMERCIAL_LEAD_CHALLENGE.difficulty);
  assert.equal(protection.verifyChallenge(originalHeaders, answer), true);
  assert.equal(
    protection.verifyChallenge(headers({ "x-forwarded-for": "203.0.113.21" }), answer),
    false,
  );
  assert.equal(
    protection.verifyChallenge(originalHeaders, {
      ...answer,
      token: `${answer.token.slice(0, -1)}0`,
    }),
    false,
  );
});

test("challenge expira sem revelar o IP no token", () => {
  let clock = NOW;
  const protection = createCommercialLeadAbuseProtection({
    adminRequest: async () => [],
    secret: SECRET,
    now: () => clock,
    randomBytes: () => Buffer.alloc(16, 3),
  });
  const requestHeaders = headers({ "x-forwarded-for": "203.0.113.44" });
  const challenge = protection.issueChallenge(requestHeaders);
  const answer = {
    token: challenge.token,
    solution: solve(challenge.token, challenge.difficulty),
  };

  assert.equal(challenge.token.includes("203.0.113.44"), false);
  clock += (COMMERCIAL_LEAD_CHALLENGE.ttlSeconds + 1) * 1000;
  assert.equal(protection.verifyChallenge(requestHeaders, answer), false);
});

test("gate envia somente HMACs e interpreta bloqueio persistente", async () => {
  const calls = [];
  const protection = createCommercialLeadAbuseProtection({
    adminRequest: async (path, options) => {
      calls.push({ path, options });
      return [{
        allowed: false,
        reason: "ip_rate_limited",
        retry_after_seconds: 321,
      }];
    },
    secret: SECRET,
    now: () => NOW,
    randomBytes: () => Buffer.alloc(16, 9),
  });
  const requestHeaders = headers({ "x-forwarded-for": "203.0.113.20" });
  const lead = {
    name: "Maria Silva",
    company: "Restaurante Exemplo",
    email: "maria@example.com",
    phone: "(61) 99999-9999",
    cnpj: "11222333000181",
    interest: "rook",
  };
  const challenge = protection.issueChallenge(requestHeaders);
  const answer = {
    token: challenge.token,
    solution: solve(challenge.token, challenge.difficulty),
  };
  const rawNonce = challenge.token.split(".")[2];

  const decision = await protection.consumeAbuseGate(
    requestHeaders,
    lead,
    answer,
  );

  assert.deepEqual(decision, {
    allowed: false,
    reason: "ip_rate_limited",
    retryAfterSeconds: 321,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, "rpc/consume_commercial_lead_abuse_gate");
  const rawBody = calls[0].options.body;
  const body = JSON.parse(rawBody);
  assert.equal(rawBody.includes("203.0.113.20"), false);
  assert.equal(rawBody.includes(lead.email), false);
  assert.equal(rawBody.includes(lead.cnpj), false);
  assert.equal(rawBody.includes(rawNonce), false);
  assert.match(body.p_nonce_hash, /^[0-9a-f]{64}$/);
  assert.match(body.p_ip_hash, /^[0-9a-f]{64}$/);
  assert.match(body.p_cnpj_hash, /^[0-9a-f]{64}$/);
  assert.match(body.p_email_hash, /^[0-9a-f]{64}$/);
  assert.equal(body.p_nonce_issued_at, new Date(NOW).toISOString());
  assert.equal(
    body.p_nonce_expires_at,
    new Date(NOW + COMMERCIAL_LEAD_CHALLENGE.ttlSeconds * 1000).toISOString(),
  );
  assert.equal(body.p_window_seconds, COMMERCIAL_LEAD_RATE_LIMITS.windowSeconds);
  assert.equal(body.p_ip_limit, COMMERCIAL_LEAD_RATE_LIMITS.ip);
  assert.equal(body.p_identity_limit, COMMERCIAL_LEAD_RATE_LIMITS.identity);
});

test("o mesmo challenge produz o mesmo nonce HMAC e o gate recusa replay", async () => {
  const consumed = new Set();
  const protection = createCommercialLeadAbuseProtection({
    adminRequest: async (_path, options) => {
      const body = JSON.parse(options.body);
      if (consumed.has(body.p_nonce_hash)) {
        return [{ allowed: false, reason: "nonce_replayed", retry_after_seconds: 0 }];
      }
      consumed.add(body.p_nonce_hash);
      return [{ allowed: true, reason: "allowed", retry_after_seconds: 0 }];
    },
    secret: SECRET,
    now: () => NOW,
    randomBytes: () => Buffer.alloc(16, 11),
  });
  const requestHeaders = headers({ "x-forwarded-for": "203.0.113.55" });
  const lead = {
    name: "Maria Silva",
    company: "Restaurante Exemplo",
    email: "maria@example.com",
    phone: "(61) 99999-9999",
    cnpj: "11222333000181",
    interest: "rook",
  };
  const challenge = protection.issueChallenge(requestHeaders);
  const answer = {
    token: challenge.token,
    solution: solve(challenge.token, challenge.difficulty),
  };

  assert.deepEqual(
    await protection.consumeAbuseGate(requestHeaders, lead, answer),
    { allowed: true, reason: "allowed", retryAfterSeconds: 0 },
  );
  assert.deepEqual(
    await protection.consumeAbuseGate(requestHeaders, lead, answer),
    { allowed: false, reason: "nonce_replayed", retryAfterSeconds: 0 },
  );
  assert.equal(consumed.size, 1);
});

test("challenge inválido falha antes de chamar a RPC", async () => {
  let calls = 0;
  const protection = createCommercialLeadAbuseProtection({
    adminRequest: async () => {
      calls += 1;
      return [];
    },
    secret: SECRET,
    now: () => NOW,
  });

  await assert.rejects(
    protection.consumeAbuseGate(
      headers({ "x-forwarded-for": "203.0.113.20" }),
      { email: "maria@example.com", cnpj: "11222333000181" },
      { token: "invalido", solution: "0" },
    ),
    (error) => error?.code === "invalid_challenge",
  );
  assert.equal(calls, 0);
});

test("rota falha fechada e publica 429 com Retry-After sem contador em memória", async () => {
  const routeSource = await readFile(
    new URL("../src/app/api/commercial-leads/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(routeSource, /export async function GET/);
  assert.match(routeSource, /consumeCommercialLeadAbuseGate/);
  assert.match(routeSource, /nonce_replayed/);
  assert.doesNotMatch(routeSource, /verifyCommercialLeadChallenge/);
  assert.match(routeSource, /status:\s*429/);
  assert.match(routeSource, /"Retry-After"/);
  assert.match(routeSource, /status:\s*503/);
  assert.doesNotMatch(routeSource, /new Map\(|setInterval\(|globalThis\.__.*rate/i);
});

test("formulário resolve o desafio antes de enviar o lead", async () => {
  const componentSource = await readFile(
    new URL(
      "../src/components/plans/PlansCommercialExperience.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(componentSource, /solveCommercialLeadChallenge/);
  assert.match(componentSource, /method:\s*"GET"/);
  assert.match(componentSource, /antiBot:\s*\{\s*token:\s*challenge\.token,\s*solution\s*\}/);
  assert.ok(
    componentSource.indexOf("solveCommercialLeadChallenge(challenge)")
      < componentSource.indexOf('method: "POST"'),
  );
});
