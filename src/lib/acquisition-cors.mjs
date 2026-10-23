/** CORS somente do cadastro público. Não substitui desafio, limites ou ledger. */
const PARTNER_ORIGINS = new Set([
  'https://rook-beefood-parceria-20261023.gabriel-abdala.chatgpt.site',
]);

export function acquisitionCorsPolicy(origin, requestOrigin) {
  const headers = { 'Cache-Control': 'no-store', Vary: 'Origin' };
  // Chamadas sem Origin continuam sujeitas à proteção pública já existente.
  if (origin === null) return { allowed: true, headers };
  if (origin !== requestOrigin && !PARTNER_ORIGINS.has(origin)) return { allowed: false, headers };
  return { allowed: true, headers: {
    ...headers,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Expose-Headers': 'Retry-After',
  } };
}

export function acquisitionPreflightPolicy(origin, requestOrigin, method, requestedHeaders) {
  const policy = acquisitionCorsPolicy(origin, requestOrigin);
  const names = requestedHeaders ? requestedHeaders.split(',').map(name => name.trim().toLowerCase()) : [];
  if (origin === null || !policy.allowed || !['GET', 'POST'].includes(method)
    || names.some(name => name !== 'content-type')) {
    return { allowed: false, headers: { 'Cache-Control': 'no-store', Vary: 'Origin' } };
  }
  return { allowed: true, headers: {
    ...policy.headers,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  } };
}
