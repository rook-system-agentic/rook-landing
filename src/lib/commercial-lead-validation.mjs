export const COMMERCIAL_INTERESTS = ["knight", "rook", "chess", "general"];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidCnpj(cnpj) {
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calculateDigit = (length) => {
    let sum = 0;
    let weight = length - 7;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cnpj[index]) * weight;
      weight -= 1;
      if (weight === 1) weight = 9;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    Number(cnpj[12]) === calculateDigit(12) &&
    Number(cnpj[13]) === calculateDigit(13)
  );
}

export function validateCommercialLeadInput(candidate) {
  if (!isRecord(candidate)) {
    return { ok: false, errors: { form: "Dados inválidos." } };
  }

  // Campo-armadilha: bots recebem uma resposta neutra sem gravar dados.
  if (text(candidate.website, 200)) {
    return { ok: true, honeypot: true, value: null };
  }

  const name = text(candidate.name, 120);
  const company = text(candidate.company, 160);
  const email = text(candidate.email, 254).toLowerCase();
  const phone = text(candidate.phone, 32);
  const phoneDigits = phone.replace(/\D/g, "");
  const cnpj = text(candidate.cnpj, 24).replace(/\D/g, "");
  const interest = text(candidate.interest, 20).toLowerCase();
  const errors = {};

  if (name.length < 2) errors.name = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    errors.phone = "Informe um telefone com DDD.";
  }
  if (!isValidCnpj(cnpj)) errors.cnpj = "Informe um CNPJ válido.";
  if (!COMMERCIAL_INTERESTS.includes(interest)) {
    errors.interest = "Selecione um interesse válido.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    honeypot: false,
    value: {
      name,
      company: company || null,
      email,
      phone,
      cnpj,
      interest,
    },
  };
}
