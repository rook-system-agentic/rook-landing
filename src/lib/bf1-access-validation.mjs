import { normalizeCmvGuidePhone } from "./cmv-guide-validation.mjs";
import { normalizeLeadAttribution } from "./lead-attribution.mjs";

/*
 * Cadastro da /bl1 antes do grupo Black Rook 2026 (ROO-1848).
 *
 * As regras dos quatro campos são as mesmas do Guia CMV de propósito: o banco
 * aplica o mesmo CHECK nas duas tabelas. O telefone usa a MESMA função do CMV
 * (normalizeCmvGuidePhone), que é a fonte da regra +55/DDD/celular.
 */

/** Campanha gravada no banco; o CHECK da migration ROO-1848 aceita só este valor. */
export const BF1_ACCESS_CAMPAIGN = "black_rook_2026";

/**
 * Versão do aviso de finalidade exibido no formulário (texto em
 * bf1-content.ts → access.notice). Mudou o texto do aviso, sobe a versão:
 * o registro guarda qual aviso a pessoa viu.
 */
export const BF1_ACCESS_NOTICE_VERSION = "bf1-aviso-v1";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNSAFE = /[\u0000-\u001f\u007f\u2028\u2029]/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateBf1AccessInput(candidate) {
  if (!isRecord(candidate)) return { ok: false, errors: { form: "Dados inválidos." } };
  const submissionId = clean(candidate.submissionId);
  const name = clean(candidate.name);
  const email = clean(candidate.email).toLowerCase();
  const phoneInput = clean(candidate.phone);
  const restaurant = clean(candidate.restaurant);
  // Ausente = não pediu contato comercial. Nunca presumir o opt-in.
  const commercialContactRequested = candidate.commercialContactRequested === undefined
    ? false
    : candidate.commercialContactRequested;

  const errors = {};
  if (!UUID.test(submissionId)) errors.submissionId = "Identificador inválido.";
  if (name.length < 2 || name.length > 120 || UNSAFE.test(name)) errors.name = "Informe seu nome.";
  if (!EMAIL.test(email) || email.length > 254 || UNSAFE.test(email)) errors.email = "Informe um e-mail válido.";
  if (phoneInput.length > 40 || !normalizeCmvGuidePhone(phoneInput)) errors.phone = "Informe um WhatsApp com DDD.";
  if (restaurant.length < 2 || restaurant.length > 120 || UNSAFE.test(restaurant)) {
    errors.restaurant = "Informe o nome do restaurante.";
  }
  if (typeof commercialContactRequested !== "boolean") {
    errors.commercialContactRequested = "Informe uma opção válida.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: Object.freeze({
      submissionId,
      name,
      email,
      phone: normalizeCmvGuidePhone(phoneInput),
      restaurant,
      commercialContactRequested,
      // Contrato de atribuição v1 da landing; inválida vira null, nunca recusa.
      attribution: Object.hasOwn(candidate, "attribution") ? normalizeLeadAttribution(candidate.attribution) : null,
    }),
  };
}

export function isBf1AccessChallenge(value) {
  return isRecord(value)
    && typeof value.token === "string"
    && typeof value.solution === "string"
    && value.token.length > 0
    && value.token.length <= 512
    && /^\d{1,12}$/.test(value.solution);
}
