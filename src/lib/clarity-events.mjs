/**
 * Eventos do Clarity dentro do formulário da /bl1 (ROO-1921).
 *
 * POR QUE EXISTE
 *
 * O Clarity mascara o formulário e não desenha o <dialog> no replay. Em 17/11
 * havia 8 aberturas do formulário e 0 envios, e não dava para saber se a pessoa
 * nem tentou enviar ou se travou em algum campo. Estes eventos respondem isso.
 *
 * POR QUE SÓ NOMES FIXOS
 *
 * O evento é só um nome de uma lista fechada; não existe parâmetro de valor.
 * Assim nada do que a pessoa digita pode chegar ao Clarity por engano. Nome
 * fora da lista não é enviado.
 *
 * O Clarity sobe pelo GTM e respeita o consentimento (analytics_storage). Se
 * ele não carregou, `window.clarity` não existe e o evento é descartado.
 */
export const BF1_FORM_CLARITY_EVENTS = Object.freeze({
  open: "bf1_form_aberto",
  attempt: "bf1_form_tentativa",
  fieldError: Object.freeze({
    name: "bf1_form_erro_nome",
    phone: "bf1_form_erro_whatsapp",
    email: "bf1_form_erro_email",
    restaurant: "bf1_form_erro_restaurante",
  }),
  verificationError: "bf1_form_erro_verificacao",
  sent: "bf1_form_enviado",
  failure: "bf1_form_falha_gravacao",
});

const ALLOWED = new Set([
  BF1_FORM_CLARITY_EVENTS.open,
  BF1_FORM_CLARITY_EVENTS.attempt,
  ...Object.values(BF1_FORM_CLARITY_EVENTS.fieldError),
  BF1_FORM_CLARITY_EVENTS.verificationError,
  BF1_FORM_CLARITY_EVENTS.sent,
  BF1_FORM_CLARITY_EVENTS.failure,
]);

export function isAllowedClarityEvent(name) {
  return ALLOWED.has(name);
}

/** Nunca lança: medição não pode atrapalhar o cadastro. */
export function pushClarityEvent(name, { enabled = false, target } = {}) {
  if (!enabled || !ALLOWED.has(name)) return false;
  const destino = target ?? globalThis;
  if (typeof destino.clarity !== "function") return false;
  try {
    destino.clarity("event", name);
    return true;
  } catch {
    return false;
  }
}
