import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { isBf1AccessChallenge, validateBf1AccessInput } from "../../src/lib/bf1-access-validation.mjs";
import { Bf1AccessPersistenceError } from "../../src/lib/bf1-access-persistence.mjs";

const compiled = ts.transpileModule(
  readFileSync(new URL("../../src/app/api/bf1-community-access/route.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } },
).outputText;

export const ACCESS = {
  submissionId: "3f6c1d2e-8a4b-4c5d-9e7f-0a1b2c3d4e5f",
  name: "Pessoa Teste",
  email: "Teste@Example.invalid",
  phone: "(11) 98888-7777",
  restaurant: "Restaurante Teste",
  commercialContactRequested: false,
  antiBot: { token: "proof", solution: "0" },
};

export class FakeBackendError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function accessRequest(extra = {}, { method = "POST", headers = {} } = {}) {
  return new Request("https://www.rook.com.br/api/bf1-community-access/", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: method === "GET" ? undefined : JSON.stringify({ ...ACCESS, ...extra }),
  });
}

export function loadBf1AccessRoute({
  configured = true,
  challenge = { token: "challenge", difficulty: 3, expiresInSeconds: 600 },
  gate = async () => ({ allowed: true, reason: "allowed", retryAfterSeconds: 0 }),
  register = async () => ({ result: "created", requestId: ACCESS.submissionId, attributionRecorded: false }),
  corsAllowed = true,
} = {}) {
  const calls = { challenge: 0, gate: [], register: [], logs: [] };
  const dependencies = {
    "next/server": { NextResponse: Response },
    "@/lib/site-origin": { SITE_ORIGIN: "https://www.rook.com.br" },
    "@/lib/cmv-guide-origin.mjs": {
      cmvGuideCorsPolicy: () => ({ allowed: corsAllowed, headers: { "Cache-Control": "no-store" } }),
      cmvGuidePreflightPolicy: () => ({ allowed: corsAllowed, headers: { "Cache-Control": "no-store" } }),
    },
    "@/lib/bf1-access-validation.mjs": { validateBf1AccessInput, isBf1AccessChallenge },
    "@/lib/bf1-access": {
      Bf1AccessBackendError: FakeBackendError,
      Bf1AccessPersistenceError,
      bf1AccessEnvironment: () => (configured ? "production" : null),
      isBf1AccessConfigured: () => configured,
      issueBf1AccessChallenge: () => {
        calls.challenge += 1;
        return challenge;
      },
      consumeBf1AccessAbuseGate: async (headers, value, proof) => {
        calls.gate.push({ value, proof });
        return gate(proof);
      },
      registerBf1Access: async (value) => {
        calls.register.push(value);
        return register(value);
      },
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
    console: { error: (...args) => calls.logs.push(args.join(" ")) },
    process: { env: {} },
    require(name) {
      if (!(name in dependencies)) throw new Error(`Dependência inesperada: ${name}`);
      return dependencies[name];
    },
  }, { filename: "api/bf1-community-access/route.cjs" });
  return { get: module.exports.GET, post: module.exports.POST, options: module.exports.OPTIONS, calls };
}
