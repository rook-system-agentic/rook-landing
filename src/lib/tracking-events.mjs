/**
 * Eventos de conversão da LP.
 *
 * POR QUE A ALLOWLIST LANÇA EXCEÇÃO
 *
 * O formulário de /planos coleta nome, e-mail, telefone e CNPJ; o diagnóstico
 * coleta faturamento, CMV e retirada de sócios. Nada disso pode chegar ao GA4
 * ou à Meta — é proibido no contrato das duas e é exposição de LGPD.
 *
 * Uma convenção ("não mande dado pessoal") depende de todo mundo lembrar. Uma
 * allowlist que lança exceção quebra o teste e o build de quem esquecer. Por
 * isso o campo desconhecido é erro, e não um campo silenciosamente ignorado:
 * ignorar em silêncio deixaria o autor achar que o dado foi enviado.
 */

export const TRACKING_EVENTS = Object.freeze({
  lead: "generate_lead",
  diagnostic: "diagnostic_complete",
  newsletter: "newsletter_signup",
  appHandoff: "app_handoff",
});

const ALLOWED_FIELDS = Object.freeze({
  [TRACKING_EVENTS.lead]: ["plano"],
  [TRACKING_EVENTS.diagnostic]: ["ab_variant"],
  [TRACKING_EVENTS.newsletter]: [],
  [TRACKING_EVENTS.appHandoff]: ["destino"],
});

export function buildTrackingEvent(name, payload = {}) {
  const allowed = ALLOWED_FIELDS[name];

  if (!allowed) {
    throw new Error(`Evento de rastreamento desconhecido: ${name}`);
  }

  const proibidos = Object.keys(payload).filter((chave) => !allowed.includes(chave));

  if (proibidos.length > 0) {
    throw new Error(
      `Campo não permitido no evento ${name}: ${proibidos.join(", ")}. `
        + `Permitidos: ${allowed.join(", ") || "nenhum"}.`,
    );
  }

  return { event: name, ...payload };
}

export function resolvePageType(pathname) {
  const caminho = String(pathname ?? "").replace(/\/+$/, "");

  if (caminho === "") return "home";
  if (caminho.startsWith("/planos")) return "planos";
  if (caminho.startsWith("/blog")) return "blog";
  if (caminho.startsWith("/diagnostico")) return "diagnostico";
  if (caminho.startsWith("/calculadora-cmv")) return "calculadora";

  return "institucional";
}

export function pushTrackingEvent(name, payload = {}, { enabled = false, target } = {}) {
  if (!enabled) return false;

  const destino = target ?? globalThis;
  const evento = buildTrackingEvent(name, payload);

  destino.dataLayer = destino.dataLayer || [];
  destino.dataLayer.push(evento);

  return true;
}
