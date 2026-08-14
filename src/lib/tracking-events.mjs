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
 * allowlist que lança exceção torna o erro visível em vez de um campo
 * silenciosamente ignorado — ignorar em silêncio deixaria o autor achar que o
 * dado foi enviado. Isso NÃO quebra teste nem build: track() aceita
 * Record<string, string> (TypeScript não barra a chamada), o CI não roda tsc
 * nem build, e nenhum teste exercita os quatro pontos de chamada reais. Quem
 * é enforçado é o visitante, em produção — por isso track() (em track.ts)
 * captura essa exceção antes que ela chegue a quem chama.
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

const APP_HOST = "app.rook.com.br";

/**
 * Decide se um clique é uma saída da LP para o app, e para qual destino.
 *
 * Só existem hoje dois links reais para app.rook.com.br: "Entrar" (Header e
 * Footer) e o checkout direto de /planos (`buildDirectCheckoutHref`, que
 * sempre aponta para /contratar com querystring). Por isso qualquer link para
 * o app host que não seja /contratar é tratado como login — não há um
 * terceiro destino para classificar.
 *
 * Retorna null quando o clique não é uma saída para o app: host diferente de
 * app.rook.com.br, href vazio/ausente, ou URL que a WHATWG URL não consegue
 * parsear (nunca lança — um clique de verdade não pode quebrar a página).
 */
export function resolveAppHandoff(href, currentHref) {
  if (!href) return null;

  let url;
  try {
    url = new URL(href, currentHref);
  } catch {
    return null;
  }

  if (url.hostname !== APP_HOST) return null;

  return url.pathname.includes("contratar") ? "contratar" : "login";
}

export function pushTrackingEvent(name, payload = {}, { enabled = false, target } = {}) {
  if (!enabled) return false;

  const destino = target ?? globalThis;
  const evento = buildTrackingEvent(name, payload);

  destino.dataLayer = destino.dataLayer || [];
  destino.dataLayer.push(evento);

  return true;
}
