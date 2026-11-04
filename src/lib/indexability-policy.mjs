/**
 * ROO-1557 — política de indexação por ambiente e host.
 *
 * A decisão fica fora de Next para poder ser exercitada com node:test sem
 * construir a aplicação. O único host que pode indexar é o www em um build
 * explicitamente marcado como produção; qualquer ausência ou valor diferente
 * é uma falha fechada para previews e ambientes de revisão.
 */

export const CANONICAL_HOST = "www.rook.com.br";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const RETIRED_HOSTS = new Set([
  "rook.com.br",
  "rooksystem.com.br",
  "www.rooksystem.com.br",
]);

/**
 * Normaliza uma origem configurada sem deixar aliases institucionais antigos
 * vazarem para canonical, Open Graph ou sitemap.
 */
export function normalizeOrigin(value, fallback = CANONICAL_ORIGIN) {
  const candidate = String(value || "").trim();
  if (!candidate) return fallback;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    if (RETIRED_HOSTS.has(url.hostname.toLowerCase())) return CANONICAL_ORIGIN;
    return url.origin;
  } catch {
    return fallback;
  }
}

/** Os aliases antigos são internos; valores editoriais de outros domínios não são alterados. */
export function normalizeInternalCanonical(value, fallback) {
  const candidate = String(value || "").trim();
  if (!candidate) return fallback;

  try {
    const url = new URL(candidate);
    if (!RETIRED_HOSTS.has(url.hostname.toLowerCase())) return candidate;

    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return url.toString();
  } catch {
    return fallback;
  }
}

/** Somente o build explicitamente marcado como produção pode indexar. */
export function isIndexableBuild(environment, deploymentEnvironment) {
  return environment === "production" &&
    (deploymentEnvironment === undefined || deploymentEnvironment === "production");
}

/**
 * Decide a indexabilidade da requisição. A comparação do host ignora apenas
 * maiúsculas, como determina a semântica de hostname; porta e hosts alternos
 * continuam fora da lista permitida.
 */
export function indexabilityDecision({ environment, host, deploymentEnvironment }) {
  if (!isIndexableBuild(environment, deploymentEnvironment)) {
    return { indexable: false, reason: "build-not-production" };
  }

  const normalizedHost = String(host || "").trim().toLowerCase();
  if (normalizedHost !== CANONICAL_HOST) {
    return { indexable: false, reason: "host-not-canonical" };
  }

  return { indexable: true, reason: "official-production" };
}
