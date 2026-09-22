/** Atribuição autodeclarada da visita. Nunca contém o cadastro do visitante. */
export const ATTRIBUTION_PREFIX = 'Atribuição de captação v1: ';
export const ATTRIBUTION_MAX_LENGTH = 1800;
export const LEAD_DESCRIPTION_MAX_LENGTH = 5000;
export const ATTRIBUTION_FIELDS = Object.freeze([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'landing_path', 'referrer_host',
]);
const UTM_FIELDS = ATTRIBUTION_FIELDS.slice(0, 5);
const SAFE_PATHS = new Set([
  '/', '/funcionalidades', '/cadastro', '/termos', '/calculadora-cmv', '/planos',
  '/privacidade', '/diagnostico', '/restaurantes', '/sobre', '/assistente', '/blog',
]);
const CONTROL = /[\p{Cc}\p{Cf}]/u;

function campaignLabel(value) {
  if (typeof value !== 'string' || value.length > 200 || CONTROL.test(value)) return null;
  const normalized = value.normalize('NFKC').trim();
  if (!normalized || normalized.length > 200 || !/^[\p{L}\p{N}\p{M} _.\[\]()|+/-]+$/u.test(normalized)) return null;
  // Bloqueia formatos evidentes de contato/documento, credencial ou identificador
  // opaco. Campanhas devem usar rótulos; dados pessoais não pertencem às UTMs.
  if (/(?:\d[ ()._+/-]*){10,}/.test(normalized)
    || /^(?:\/|www\.)|(?:^|\s)[^\s/]+\.[a-z]{2,}\//i.test(normalized)
    || /[a-z0-9]{32,}/i.test(normalized)
    || /^[a-z0-9_-]{10,}\.[a-z0-9_-]{10,}\.[a-z0-9_-]+$/i.test(normalized)
    || /(?:^|[ _.-])(?:token|secret|password|senha|email|cpf|cnpj)(?:$|[ _.-])/i.test(normalized)
    || /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(normalized)) return null;
  return normalized;
}

function safePath(value) {
  if (typeof value !== 'string' || value.length > 256 || CONTROL.test(value)) return null;
  const path = value === '/' ? value : value.replace(/\/$/, '');
  return SAFE_PATHS.has(path) ? path : null;
}

function referrerHost(value) {
  if (typeof value !== 'string' || value.length > 253 || CONTROL.test(value)) return null;
  const host = value.toLowerCase();
  if (!host.includes('.') || /^[\d.]+$/.test(host)) return null;
  return host.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) ? host : null;
}

/** Também executado no servidor: campos inválidos são descartados sem recusar o lead. */
export function normalizeLeadAttribution(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  const attribution = { version: 1, source: 'site_form' };
  const omitted = new Set(Array.isArray(candidate.omitted_fields)
    ? candidate.omitted_fields.filter(field => ATTRIBUTION_FIELDS.includes(field)) : []);
  for (const field of ATTRIBUTION_FIELDS) {
    if (!Object.hasOwn(candidate, field)) continue;
    const value = UTM_FIELDS.includes(field) ? campaignLabel(candidate[field])
      : field === 'landing_path' ? safePath(candidate[field]) : referrerHost(candidate[field]);
    if (value === null) omitted.add(field);
    else { attribution[field] = value; omitted.delete(field); }
  }
  if (omitted.size) attribution.omitted_fields = ATTRIBUTION_FIELDS.filter(field => omitted.has(field));
  return JSON.stringify(attribution).length <= ATTRIBUTION_MAX_LENGTH ? attribution : null;
}

/** URL e referrer completos são usados apenas durante esta chamada e não são guardados. */
export function captureLeadAttribution({ href, referrer } = {}) {
  let entry;
  try { entry = new URL(href); } catch { return null; }
  if (!['http:', 'https:'].includes(entry.protocol)) return null;
  const candidate = { landing_path: entry.pathname };
  for (const field of UTM_FIELDS) {
    const values = entry.searchParams.getAll(field);
    if (values.length) candidate[field] = values.length === 1 ? values[0] : null;
  }
  if (typeof referrer === 'string' && referrer) {
    try {
      const url = new URL(referrer);
      candidate.referrer_host = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
        ? url.hostname : null;
    } catch { candidate.referrer_host = null; }
  }
  return normalizeLeadAttribution(candidate);
}

/** Primeira entrada do documento, conservada apenas em memória durante a navegação SPA. */
export function createVisitAttributionCapture() {
  let captured = false;
  let snapshot = null;
  return input => {
    if (!captured) {
      snapshot = captureLeadAttribution(input);
      if (snapshot?.omitted_fields) Object.freeze(snapshot.omitted_fields);
      if (snapshot) Object.freeze(snapshot);
      captured = true;
    }
    return snapshot;
  };
}

/** Acrescenta ao cabeçalho somente se couber inteiro; nunca corta o diagnóstico. */
export function appendLeadAttribution(description, candidate) {
  const attribution = normalizeLeadAttribution(candidate);
  if (!attribution) return description;
  const line = `${ATTRIBUTION_PREFIX}${JSON.stringify(attribution)}`;
  if (description.length + line.length + 1 > LEAD_DESCRIPTION_MAX_LENGTH) return description;
  const separator = description.indexOf('\n\n');
  return separator < 0 ? `${description}\n${line}`
    : `${description.slice(0, separator)}\n${line}${description.slice(separator)}`;
}
