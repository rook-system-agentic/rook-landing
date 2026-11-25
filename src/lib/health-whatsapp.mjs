/**
 * Link de WhatsApp da LP `/health/`.
 *
 * POR QUE ISTO EXISTE
 *
 * A Rook Health nasce como teste de interesse: uma página e um botão que abre
 * a conversa. Não há formulário nem gravação — quem recebe o contato é uma
 * pessoa, no WhatsApp. O número vem de `HEALTH_WHATSAPP_NUMBER`, e não do
 * código, porque quem atende pode mudar sem que isso vire deploy de texto.
 *
 * A REGRA: número inválido ou ausente devolve `null`, e a página mostra o
 * estado "em breve" em vez de um botão que abre conversa com ninguém. É a
 * mesma ideia das outras fontes externas do site: nunca falhar em silêncio.
 *
 * Aceita só celular ou fixo brasileiro com DDI 55 (12 ou 13 dígitos). Um número
 * colado com máscara — "+55 (61) 9 9999-0000" — é normalizado; qualquer coisa
 * fora disso é recusada, para um erro de digitação na variável não publicar um
 * link para o telefone de um desconhecido.
 */
export const HEALTH_WHATSAPP_MESSAGE =
  "Olá! Tenho uma clínica e quero conhecer a Rook Health.";

/** Valor fechado do `destination` no evento `cta_click` desta página. */
export const HEALTH_TRACKING_DESTINATION = "health_whatsapp";

/** Âncora da seção de contato, usada pelo cabeçalho e pelos botões da página. */
export const HEALTH_CONTACT_ANCHOR = "#contato";

export function normalizeHealthWhatsappNumber(value) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  return /^55[1-9]\d(?:9\d{8}|[2-5]\d{7})$/.test(digits) ? digits : null;
}

export function healthWhatsappHref(value, message = HEALTH_WHATSAPP_MESSAGE) {
  const number = normalizeHealthWhatsappNumber(value);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
