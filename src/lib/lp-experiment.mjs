/**
 * Experimento da LP: contratação direta × atendimento assistido (ROO-1207).
 *
 * Lógica pura, sem Next e sem DOM, para rodar em `node --test`. Quem a usa:
 * o middleware (sorteia e grava o cookie), o script inline do layout (lê o
 * cookie antes da pintura) e os componentes de `/planos` (dimensões de
 * tracking e URL do formulário).
 *
 * POR QUE COOKIE, E NÃO localStorage
 *
 * A variante precisa existir ANTES do HTML chegar ao navegador, senão o CTA
 * aparece como A e troca para B na hidratação — o flicker que a issue proíbe.
 * Só o servidor consegue isso, e o servidor só enxerga cookie. O cookie é
 * first-party, sem dado pessoal (carrega o id do experimento e a variante), e
 * vive 90 dias para o mesmo visitante não cair em duas variantes.
 *
 * POR QUE O KILL SWITCH IGNORA O COOKIE
 *
 * Rollback é zerar `LP_ASAFLOW_ASSISTED_PCT`. Se o cookie valesse mais que a
 * porcentagem, quem já tinha caído na B continuaria vendo a B depois do
 * rollback — exatamente quando alguém quer que ela suma.
 */

export const LP_EXPERIMENT_ID = "lp_asaflow_v1";
export const LP_EXPERIMENT_COOKIE = "rook_lp_exp";
export const LP_EXPERIMENT_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;
export const LP_EXPERIMENT_FORCE_PARAM = "lp_exp";
export const LP_VARIANTS = Object.freeze(["direct", "assisted"]);

/** Inteiro de 0 a 100. Qualquer outra coisa (ausente, texto, fora da faixa, decimal) vira 0 = B desligada. */
export function parseAssistedPercent(bruto) {
  if (typeof bruto !== "string") return 0;
  const texto = bruto.trim();
  if (!/^\d{1,3}$/.test(texto)) return 0;
  const n = Number(texto);
  return n >= 0 && n <= 100 ? n : 0;
}

export function serializeExperimentCookie(variant) {
  if (!LP_VARIANTS.includes(variant)) {
    throw new Error(`Variante desconhecida do experimento: ${variant}`);
  }
  return `${LP_EXPERIMENT_ID}:${variant}`;
}

export function parseExperimentCookie(valor) {
  if (typeof valor !== "string") return null;
  const [experimentId, variant, ...resto] = valor.split(":");
  if (resto.length > 0) return null;
  if (experimentId !== LP_EXPERIMENT_ID) return null;
  if (!LP_VARIANTS.includes(variant)) return null;
  return { experimentId, variant };
}

/**
 * Decide a variante de uma requisição.
 *
 * Ordem: kill switch (pct 0) → forçada por querystring (QA) → cookie válido →
 * sorteio. `random` é injetado para o teste ser determinístico.
 */
export function allocateVariant({ existing, assistedPercent, random = Math.random, forced }) {
  if (assistedPercent <= 0) return { variant: "direct", source: "desligado" };

  if (LP_VARIANTS.includes(forced)) return { variant: forced, source: "forcada" };

  const salvo = parseExperimentCookie(existing);
  if (salvo) return { variant: salvo.variant, source: "cookie" };

  const variant = random() * 100 < assistedPercent ? "assisted" : "direct";
  return { variant, source: "sorteio" };
}

/** Lê a variante de uma string no formato de `Cookie:`/`document.cookie`. */
export function lerVarianteDoCookie(cookies) {
  if (typeof cookies !== "string" || cookies === "") return null;
  for (const par of cookies.split(";")) {
    const [nome, ...valor] = par.trim().split("=");
    if (nome !== LP_EXPERIMENT_COOKIE) continue;
    return parseExperimentCookie(decodeURIComponent(valor.join("=")))?.variant ?? null;
  }
  return null;
}

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

/**
 * URL do formulário AsaFlow embutido na Variante B.
 *
 * Só viaja o que a issue pede: as cinco UTMs, a URL de aterrissagem SEM a
 * querystring (ela pode carregar gclid, e-mail de link de campanha etc.), o
 * referrer e a variante. Nada da querystring original é repassado em bloco.
 */
export function buildAsaflowFormUrl(baseUrl, { currentHref, referrer, variant }) {
  const url = new URL(baseUrl);
  const atual = new URL(currentHref);

  for (const nome of UTM_PARAMS) {
    const valor = atual.searchParams.get(nome);
    if (valor) url.searchParams.set(nome, valor);
  }
  url.searchParams.set("landing_url", `${atual.origin}${atual.pathname}`);
  if (referrer) url.searchParams.set("referrer", referrer);
  url.searchParams.set("experiment_id", LP_EXPERIMENT_ID);
  url.searchParams.set("variant", variant);

  return url.toString();
}
