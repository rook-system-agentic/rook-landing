const PRODUCTION_HOSTS = new Set(["www.rook.com.br", "rook.com.br"]);
const HOMOLOG_HOSTS = new Set([
  "lp.homolog.rook.com.br",
  "lp-homolog.rooksystem.com.br",
  "localhost",
  "127.0.0.1",
  "[::1]",
]);

function originOf(value, requireHttps = false) {
  if (typeof value !== "string" || value === "" || value === "null") return null;
  try {
    const url = new URL(value);
    if ((requireHttps && url.protocol !== "https:") || (!requireHttps && !/^https?:$/.test(url.protocol))) return null;
    if (url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}

function environmentHostAllowed(value, environment) {
  const url = originOf(value, true);
  if (!url) return false;
  const hosts = environment === "homolog" ? HOMOLOG_HOSTS : environment === "production" ? PRODUCTION_HOSTS : new Set();
  return hosts.has(url.hostname);
}

export function cmvGuideCorsPolicy(origin, requestOrigin, siteOrigin, environment) {
  const headers = { "Cache-Control": "no-store", Vary: "Origin" };
  if (origin === null) return { allowed: true, headers };
  const current = originOf(requestOrigin);
  const requested = originOf(origin, true);
  const canonical = originOf(siteOrigin, true);
  if (!current || !requested || !canonical || !environmentHostAllowed(canonical.href, environment)) {
    return { allowed: false, headers };
  }
  // O proxy pode entregar request.url interno (HTTP/host do upstream), mas a
  // origem pública canônica continua vinculada ao ambiente desta rota.
  if (requested.origin === canonical.origin) {
    return {
      allowed: true,
      headers: {
        ...headers,
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Expose-Headers": "Retry-After",
      },
    };
  }
  if (requested.origin !== current.origin || !environmentHostAllowed(requestOrigin, environment)) {
    return { allowed: false, headers };
  }
  return {
    allowed: true,
    headers: {
      ...headers,
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Expose-Headers": "Retry-After",
    },
  };
}

export function cmvGuidePreflightPolicy(origin, requestOrigin, siteOrigin, environment, method, requestedHeaders) {
  const policy = cmvGuideCorsPolicy(origin, requestOrigin, siteOrigin, environment);
  const names = requestedHeaders ? requestedHeaders.split(",").map((name) => name.trim().toLowerCase()) : [];
  if (origin === null || !policy.allowed || !["GET", "POST"].includes(method) || names.some((name) => name !== "content-type")) {
    return { allowed: false, headers: { "Cache-Control": "no-store", Vary: "Origin" } };
  }
  return {
    allowed: true,
    headers: {
      ...policy.headers,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };
}
