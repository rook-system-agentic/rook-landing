import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { validateCmvGuideInput } from "../../src/lib/cmv-guide-validation.mjs";
import { CmvGuidePersistenceError } from "../../src/lib/cmv-guide-persistence.mjs";

const compiled = ts.transpileModule(
  readFileSync(new URL("../../src/app/api/cmv-guide/route.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } },
).outputText;

export const GUIDE = {
  submissionId: "bb189bc0-1c1d-4cca-8400-44ac47fbda81",
  name: "Pessoa Teste",
  email: "teste@example.invalid",
  phone: "(11) 99999-9999",
  restaurant: "Restaurante Teste",
  commercialContactRequested: false,
  antiBot: { token: "proof", solution: "0" },
};

export function guideRequest(extra = {}, { method = "POST", headers = {} } = {}) {
  return new Request("https://www.rook.com.br/api/cmv-guide/", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: method === "GET" ? undefined : JSON.stringify({ ...GUIDE, ...extra }),
  });
}

export function loadCmvGuideRoute({
  configured = true,
  challenge = { token: "challenge", difficulty: 3, expiresInSeconds: 600 },
  gate = async () => ({ allowed: true, reason: "allowed", retryAfterSeconds: 0 }),
  enqueue = async () => ({ result: "created", state: "queued", requestId: GUIDE.submissionId }),
  corsAllowed = true,
  siteOrigin = "https://www.rook.com.br",
  testRecipient = null,
  env = {},
} = {}) {
  const calls = { challenge: 0, gate: [], enqueue: [] };
  const dependencies = {
    "next/server": { NextResponse: Response },
    "@/lib/acquisition-cors.mjs": {
      acquisitionCorsPolicy: () => ({ allowed: corsAllowed, headers: { "Cache-Control": "no-store" } }),
      acquisitionPreflightPolicy: () => ({ allowed: corsAllowed, headers: { "Cache-Control": "no-store" } }),
    },
    "@/lib/site-origin": { SITE_ORIGIN: siteOrigin },
    "@/lib/cmv-guide-origin.mjs": {
      cmvGuideCorsPolicy: () => ({ allowed: corsAllowed, headers: { "Cache-Control": "no-store" } }),
      cmvGuidePreflightPolicy: () => ({ allowed: corsAllowed, headers: { "Cache-Control": "no-store" } }),
    },
    "@/lib/cmv-guide-validation.mjs": { validateCmvGuideInput, isCmvGuideChallenge: (value) => Boolean(value?.token && value?.solution) },
    "@/lib/cmv-guide": {
      CmvGuideBackendError: class CmvGuideBackendError extends Error { constructor(code) { super(code); this.code = code; } },
      CmvGuidePersistenceError,
      isCmvGuidePublicConfigured: () => configured,
      cmvGuideTestRecipient: () => testRecipient,
      issueCmvGuideChallenge: () => { calls.challenge += 1; return challenge; },
      consumeCmvGuideAbuseGate: async (headers, value, proof) => { calls.gate.push({ headers, value, proof }); return gate(proof); },
      enqueueCmvGuideRequest: async (value) => { calls.enqueue.push(value); return enqueue(value); },
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    Buffer,
    URL,
    Request,
    Response,
    console: { error() {} },
    process: { env: { ...env } },
    require(name) {
      if (!(name in dependencies)) throw new Error(`Dependência inesperada: ${name}`);
      return dependencies[name];
    },
  }, { filename: "api/cmv-guide/route.cjs" });
  return { get: module.exports.GET, post: module.exports.POST, options: module.exports.OPTIONS, calls };
}
