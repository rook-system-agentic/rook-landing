import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateFinancialAcquisition } from '../../src/lib/financial-acquisition.mjs';
import { createAsaflowAcquisition } from '../../src/lib/asaflow-acquisition.mjs';
import { toPublicFinancialSimulation } from '../../src/lib/public-financial-simulation.mjs';
import { CommercialLeadAbuseProtectionError } from '../../src/lib/commercial-lead-abuse-protection.mjs';
import { CMV_TAX_MODEL_VERSION } from '../../src/lib/cmv-input-options.mjs';

const compiled = ts.transpileModule(readFileSync(new URL('../../src/app/api/financial-simulations/route.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

export const financialInput = {
  tool: 'cmv', referenceBasis: 'last_month', revenueBasis: 'gross', revenue: 100000,
  cmvInputMode: 'amount', cmvAmount: 35000, segment: 'hamburgueria', taxState: 'SP',
  taxModelVersion: CMV_TAX_MODEL_VERSION,
};
export const financialLead = {
  submissionId: 'bb189bc0-1c1d-4cca-8400-44acb47fbda8',
  name: 'Pessoa Teste', email: 'teste@example.invalid', phone: '11999999999',
  simulation: financialInput, antiBot: { token: 'fresh-proof', solution: '0' },
};
export const financialRequest = (extra = {}) => new Request('http://localhost/api/financial-simulations/', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ...financialLead, ...extra }),
});

// Executa a rota TypeScript real; apenas transporte e configuração são injetados.
export function loadFinancialRoute({
  gate = async () => ({ allowed: true, reason: 'allowed', retryAfterSeconds: 0 }),
  create = async () => ({ contactId: 'private-contact', dealId: 'private-deal' }),
  fetchImpl,
  enabled = true,
  abuseConfigured = true,
  challenge = () => ({ token: 'challenge-token', difficulty: 8, expiresAt: 123456 }),
  env = {},
} = {}) {
  const calls = { gate: [], clients: [], crm: [], challenge: [], network: 0 };
  const dependencies = {
    'next/server': { NextResponse: Response },
    '@/lib/financial-acquisition.mjs': { validateFinancialAcquisition },
    '@/lib/public-financial-simulation.mjs': { toPublicFinancialSimulation },
    '@/lib/asaflow-acquisition.mjs': {
      createAsaflowAcquisition: options => {
        calls.clients.push(options);
        const implementation = fetchImpl ? createAsaflowAcquisition({ ...options, fetchImpl }).create : create;
        return { create: async value => { calls.crm.push(value); return implementation(value); } };
      },
    },
    '@/lib/commercial-lead-abuse': {
      CommercialLeadAbuseProtectionError,
      isCommercialLeadAbuseProtectionConfigured: () => abuseConfigured,
      issueCommercialLeadChallenge: headers => { calls.challenge.push(headers); return challenge(headers); },
      consumeCommercialLeadAbuseGate: async (headers, value, proof) => {
        calls.gate.push({ headers, value, proof });
        return gate(proof);
      },
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Buffer, console: { error() {} },
    process: { env: {
      ASAFLOW_ACQUISITION_ENABLED: String(enabled), ASAFLOW_ACQUISITION_API_KEY: 'private-api-key',
      ASAFLOW_ACQUISITION_PIPELINE_ID: 'private-pipeline', ASAFLOW_ACQUISITION_STAGE_ID: 'private-stage', ...env,
    } },
    fetch: () => { calls.network++; throw new Error('Requisições externas proibidas'); },
    require: name => {
      if (!(name in dependencies)) throw new Error(`Dependência inesperada: ${name}`);
      return dependencies[name];
    },
  }, { filename: 'api/financial-simulations/route.cjs' });
  return { post: module.exports.POST, get: module.exports.GET, calls };
}
