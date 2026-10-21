/**
 * ROO-1125 — origem canônica do site público. Fonte ÚNICA.
 *
 * POR QUE ISTO EXISTE
 *
 * O Cloudflare redireciona `rook.com.br` → `www.rook.com.br` com 308. Uma tag
 * canonical que aponta para a origem SEM www aponta, portanto, para uma URL que
 * redireciona — e o Google trata isso como conflito e não indexa. Foi o que o
 * Search Console reportou: 28 páginas, 13 delas por este motivo.
 *
 * O estado encontrado em 17/08/2026, contado no código:
 *
 *   15 ocorrências de `https://rook.com.br`        (sem www → redireciona)
 *    8 ocorrências de `https://rooksystem.com.br`  (domínio antigo)
 *    4 ocorrências de `https://www.rook.com.br`    (correto — só em /planos)
 *
 * Cada página declarava a sua própria origem à mão. Trocar as 23 strings
 * erradas resolveria hoje e voltaria a divergir na próxima página criada, que é
 * exatamente como `/planos` acabou sendo a única certa e `/blog` acabou no
 * domínio antigo.
 *
 * REGRA: nenhum arquivo fora daqui escreve a origem do site. Quem precisa de
 * URL absoluta chama `siteUrl(path)`. O guard de contrato reprova reincidência.
 *
 * Sobre `NEXT_PUBLIC_SITE_URL`: continua sendo respeitado para que homologação
 * publique as próprias URLs, mas aliases institucionais antigos são sempre
 * promovidos ao www. Em produção a origem é fixa, mesmo que a variável esteja
 * errada — um valor de ambiente não pode reintroduzir o defeito.
 */

import { normalizeOrigin } from "./indexability-policy.mjs";

/** Origem canônica de produção. Com www, porque é para onde o 308 aponta. */
export const CANONICAL_ORIGIN = "https://www.rook.com.br";

/** Domínios que já foram nossos e não podem mais aparecer em canonical/sitemap. */
export const ORIGENS_APOSENTADAS = [
  "https://rooksystem.com.br",
  "https://www.rooksystem.com.br",
  "https://rook.com.br",
] as const;

function normalizar(origem: string): string {
  const limpa = origem.replace(/\/+$/, "");
  // `rook.com.br` sem www redireciona: promove para a forma canônica.
  if (limpa === "https://rook.com.br") return CANONICAL_ORIGIN;
  if (limpa === "https://rooksystem.com.br") return CANONICAL_ORIGIN;
  if (limpa === "https://www.rooksystem.com.br") return CANONICAL_ORIGIN;
  return normalizeOrigin(limpa, CANONICAL_ORIGIN);
}

/**
 * Origem efetiva do ambiente. Em produção é sempre a canônica; em homologação
 * ou preview, o que `NEXT_PUBLIC_SITE_URL` declarar, com aliases antigos
 * normalizados. Sem uma marca explícita de produção, o build não pode produzir
 * URLs de produção por acidente.
 */
const origemConfigurada = normalizar(
  process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN,
);
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_ENV === "production" ? CANONICAL_ORIGIN : origemConfigurada;

/**
 * URL absoluta para um caminho do site.
 *
 * Mantém a barra final dos caminhos de página, porque é assim que o sitemap e
 * as canonicals já estavam publicados — mudar isso agora criaria um segundo
 * conflito de canonização, do tipo que esta issue existe para eliminar.
 */
export function siteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_ORIGIN}/`;
  const comBarraInicial = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${comBarraInicial}`;
}
