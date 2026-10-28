const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_OR_HEADER = /[\u0000-\u001f\u007f]/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function hasUnsafeText(value) {
  return CONTROL_OR_HEADER.test(value) || value.includes("\u2028") || value.includes("\u2029");
}

/**
 * O telefone chega em formatos de edição, mas o request persistido nunca leva
 * a máscara. O +55 é deliberado: o banco e o antiabuso veem uma identidade
 * única para (11) 99999-9999 e +55 11 99999-9999.
 */
export function normalizeCmvGuidePhone(value) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("55") && (digits.length === 12 || digits.length === 13)
    ? digits.slice(2)
    : digits;
  if (!/^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(local)) return null;
  return `+55${local}`;
}

export function validateCmvGuideInput(candidate) {
  if (!isRecord(candidate)) return { ok: false, errors: { form: "Dados inválidos." } };

  const submissionId = cleanText(candidate.submissionId);
  const name = cleanText(candidate.name);
  const email = cleanText(candidate.email).toLowerCase();
  const phoneInput = cleanText(candidate.phone);
  const restaurant = cleanText(candidate.restaurant);
  const commercialContactRequested = candidate.commercialContactRequested === undefined
    ? false
    : candidate.commercialContactRequested;
  const errors = {};

  if (!UUID.test(submissionId)) errors.submissionId = "Identificador inválido.";
  if (name.length < 2 || name.length > 120 || hasUnsafeText(name)) errors.name = "Informe seu nome.";
  if (!EMAIL.test(email) || email.length > 254 || hasUnsafeText(email)) errors.email = "Informe um e-mail válido.";
  if (phoneInput.length > 40 || !normalizeCmvGuidePhone(phoneInput)) errors.phone = "Informe um telefone com DDD.";
  if (restaurant.length < 2 || restaurant.length > 120 || hasUnsafeText(restaurant)) {
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
    }),
  };
}

export function isCmvGuideChallenge(value) {
  return isRecord(value)
    && typeof value.token === "string"
    && typeof value.solution === "string"
    && value.token.length > 0
    && value.token.length <= 512
    && /^\d{1,12}$/.test(value.solution);
}
