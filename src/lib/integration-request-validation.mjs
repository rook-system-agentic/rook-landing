/**
 * Validação da solicitação de integração.
 *
 * O botão "Não encontrou o seu sistema? Solicite a integração" abria um
 * `mailto:` — que só funciona para quem tem cliente de e-mail configurado, não
 * registra nada em lugar nenhum e não diz ao Comercial qual sistema foi pedido.
 * Virou formulário, e este módulo é a borda dele.
 *
 * A LISTA DE SISTEMAS é fechada de propósito, com escape para texto livre. Sem
 * lista, cada visitante escreve o mesmo ERP de um jeito ("Teknisa", "teknisa",
 * "TEKNISA sistemas") e a priorização por volume de pedidos — que é como o time
 * decide o que integrar — vira contagem manual. Com lista, `sistema` agrupa
 * sozinho; com o escape, ninguém fica sem pedir o que usa.
 *
 * Os sistemas listados são os que AINDA NÃO são parceiros. Colocar um parceiro
 * aqui seria pedir o que já existe — por isso a lista é conferida contra
 * `PARTNERS` num teste.
 *
 * Dependência zero, `.mjs` puro: `node --test` roda direto, sem build.
 */

/**
 * Sistemas de food service mais citados que ainda não estão no hall de
 * parceiros. Ordem alfabética; `outro` fica por último no formulário.
 */
export const SISTEMAS = [
  { valor: "alloy", rotulo: "Alloy Automação" },
  { valor: "anotaai", rotulo: "Anota AI" },
  { valor: "bluesoft", rotulo: "Bluesoft" },
  { valor: "colibri", rotulo: "Colibri / Bematech" },
  { valor: "consumer", rotulo: "Consumer" },
  { valor: "delivery_much", rotulo: "Delivery Much" },
  { valor: "goomer", rotulo: "Goomer" },
  { valor: "linx", rotulo: "Linx" },
  { valor: "menew", rotulo: "Menew" },
  { valor: "neemo", rotulo: "Neemo" },
  { valor: "onfly", rotulo: "OnFly" },
  { valor: "praticus", rotulo: "Praticus" },
  { valor: "sischef", rotulo: "Sischef" },
  { valor: "teknisa", rotulo: "Teknisa" },
  { valor: "totvs", rotulo: "TOTVS" },
  { valor: "zigpay", rotulo: "Zig" },
  { valor: "outro", rotulo: "Outro — vou escrever" },
];

const VALORES = SISTEMAS.map((s) => s.valor);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/**
 * @param {unknown} candidato
 * @returns {{ok: true, honeypot: true, value: null}
 *          | {ok: true, honeypot?: false, value: object}
 *          | {ok: false, errors: Record<string, string>}}
 */
export function validarSolicitacaoIntegracao(candidato) {
  if (!isRecord(candidato)) {
    return { ok: false, errors: { form: "Dados inválidos." } };
  }

  // Campo-armadilha: bots recebem resposta neutra sem gravar nada. Mesmo
  // mecanismo do formulário de planos.
  if (text(candidato.website, 200)) {
    return { ok: true, honeypot: true, value: null };
  }

  const nome = text(candidato.nome, 120);
  const email = text(candidato.email, 254).toLowerCase();
  const telefone = text(candidato.telefone, 32);
  const digitos = telefone.replace(/\D/g, "");
  const sistema = text(candidato.sistema, 40).toLowerCase();
  const sistemaOutro = text(candidato.sistemaOutro, 120);

  const errors = {};

  if (nome.length < 2) errors.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (digitos.length < 10 || digitos.length > 13) {
    errors.telefone = "Informe um telefone com DDD.";
  }
  if (!VALORES.includes(sistema)) {
    errors.sistema = "Escolha o sistema que você usa.";
  }
  // "Outro" sem o nome do sistema é o mesmo que não responder: o pedido chega
  // ao Comercial sem dizer o que integrar.
  if (sistema === "outro" && sistemaOutro.length < 2) {
    errors.sistemaOutro = "Escreva o nome do sistema.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const rotulo = SISTEMAS.find((s) => s.valor === sistema)?.rotulo ?? sistema;

  return {
    ok: true,
    value: {
      nome,
      email,
      telefone,
      sistema,
      /* O que o Comercial lê: o nome escrito, quando houver, senão o rótulo. */
      sistemaNome: sistema === "outro" ? sistemaOutro : rotulo,
    },
  };
}
