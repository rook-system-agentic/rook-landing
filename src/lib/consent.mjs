/**
 * Estado de consentimento para o Consent Mode v2.
 *
 * POR QUE PUBLICIDADE NEGADA E MEDIÇÃO CONCEDIDA
 *
 * O rigor da LGPD se concentra em remarketing e público personalizado; medição
 * de audiência agregada é defensável por interesse legítimo, declarado na
 * página de privacidade.
 *
 * Negar medição por padrão faria os números do GA4 caírem no dia do deploy —
 * não por defeito, por gente que ignora banner. A escolha é de risco, foi
 * tomada em 14/08/2026 e está registrada na spec da ROO-1117.
 */

export const CONSENT_STORAGE_KEY = "rook-consent";

const CHAVES = Object.freeze([
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
]);

const VALORES = Object.freeze(["granted", "denied"]);

export function defaultConsentState() {
  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  };
}

export function grantedConsentState() {
  return Object.fromEntries(CHAVES.map((chave) => [chave, "granted"]));
}

export function serializeConsentState(estado) {
  return JSON.stringify(estado);
}

export function parseConsentState(bruto) {
  if (typeof bruto !== "string") return null;

  let candidato;
  try {
    candidato = JSON.parse(bruto);
  } catch {
    return null;
  }

  if (!candidato || typeof candidato !== "object") return null;

  const valido = CHAVES.every((chave) => VALORES.includes(candidato[chave]));

  return valido ? Object.fromEntries(CHAVES.map((c) => [c, candidato[c]])) : null;
}
