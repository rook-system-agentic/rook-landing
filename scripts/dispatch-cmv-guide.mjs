/**
 * ROO-1642 — Acionador nativo da fila educativa.
 *
 * O cadastro é gravado antes do envio. Este processo só pede ao backend que
 * recupere pendências; não possui PII, anexos ou chave Resend. O workflow fica
 * desligado até a habilitação explícita de cada ambiente. Nunca segue redirect
 * com Bearer nem aceita URL escolhida por quem preencheu o formulário.
 */
import { pathToFileURL } from 'node:url';

export const CMV_GUIDE_ORIGINS = Object.freeze({
  homolog: 'https://lp.homolog.rook.com.br',
  production: 'https://www.rook.com.br',
});

const COUNTERS = ['claimed', 'accepted', 'retried', 'failed', 'delivered', 'bounced', 'reconciled', 'needsReconciliation'];

export async function dispatchCmvGuide({ environment, secret, fetchImpl = fetch }) {
  const origin = CMV_GUIDE_ORIGINS[environment];
  if (!origin || typeof secret !== 'string' || secret.length < 32 || /[\r\n]/u.test(secret)) {
    throw new Error('Configuração do acionador CMV inválida.');
  }
  const response = await fetchImpl(`${origin}/api/internal/cmv-guide-dispatch/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: '{}',
    redirect: 'error',
    cache: 'no-store',
    signal: AbortSignal.timeout(55_000),
  });
  if (!response.ok) throw new Error(`Despachante CMV indisponível (HTTP ${response.status}).`);
  const result = await response.json();
  if (!result || typeof result !== 'object' || Array.isArray(result) || result.ok !== true) {
    throw new Error('Confirmação do despachante CMV inválida.');
  }
  // Só contagens: uma resposta futura com destinatário/token jamais vai ao log.
  return Object.fromEntries(COUNTERS.flatMap(key =>
    Number.isSafeInteger(result[key]) && result[key] >= 0 ? [[key, result[key]]] : [],
  ));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  dispatchCmvGuide({
    environment: process.env.CMV_GUIDE_DISPATCH_ENV,
    secret: process.env.CMV_GUIDE_DISPATCH_SECRET,
  }).then(counts => {
    console.log(JSON.stringify({ event: 'cmv_guide_dispatch', ...counts }));
  }).catch(() => {
    // Não imprimir stack/rawerror/resposta: podem conter credenciais ou dados.
    console.error('Falha no acionamento da fila CMV. Consulte o estado do backend.');
    process.exitCode = 1;
  });
}
