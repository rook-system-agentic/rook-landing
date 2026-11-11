/*
 * Configuração do cadastro da /bl1 antes do grupo Black Rook 2026 (ROO-1848).
 *
 * O cadastro grava no mesmo banco do Guia CMV (a tabela e a RPC vêm da
 * migration ROO-1848 do rook-system). Por isso, sem variáveis dedicadas, ele
 * usa o conjunto CMV_GUIDE_* de banco/chave/antiabuso — mas NUNCA as flags do
 * CMV (CMV_GUIDE_ENABLED, entrega, e-mail): desligar o Guia não derruba este
 * cadastro, e vice-versa.
 *
 * Conjunto dedicado (BF1_ACCESS_SUPABASE_URL + chave + segredo) é tudo ou nada:
 * se a URL dedicada existir, chave e segredo também vêm do conjunto dedicado.
 * Misturar URL de um banco com chave de outro não passa.
 *
 * Ativação explícita: BF1_ACCESS_ENABLED=true. Sem ela (ou sem banco/chave),
 * a rota responde 503 e o CTA da /bl1 leva direto ao grupo, como antes do
 * formulário. Isso desacopla o deploy da landing da migration do banco:
 * liga-se a variável só depois de a RPC existir no ambiente. Desligar = tirar
 * a variável (ou trocar para outro valor) e redeployar.
 */

// Mesmos hosts aceitos por cmv-guide-config.mjs. O teste
// bf1-access.test.mjs confere a equivalência para não divergir em silêncio.
export const BF1_ACCESS_HOMOLOG_DATABASE_HOSTS = Object.freeze([
  "hsaehgdbzqgqehkfzofz.supabase.co",
  "supabase.homolog.rook.com.br",
  "supabase-homolog.rooksystem.com.br",
]);
export const BF1_ACCESS_PRODUCTION_DATABASE_HOSTS = Object.freeze([
  "fzvhgucgfmhnisaqellu.supabase.co",
  "supabase.rook.com.br",
]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validSecret(value, minimum) {
  return typeof value === "string" && value.length >= minimum;
}

function validDatabaseUrl(value, environment) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const allowed = environment === "homolog"
      ? BF1_ACCESS_HOMOLOG_DATABASE_HOSTS
      : environment === "production"
        ? BF1_ACCESS_PRODUCTION_DATABASE_HOSTS
        : [];
    return url.protocol === "https:"
      && url.pathname === "/"
      && !url.search
      && !url.hash
      && !url.username
      && !url.password
      && !url.port
      && allowed.includes(url.hostname);
  } catch {
    return false;
  }
}

export function readBf1AccessConfig(env = {}) {
  const environment = text(env.BF1_ACCESS_ENV) || text(env.CMV_GUIDE_ENV);
  const aligned = (environment === "homolog" || environment === "production")
    && env.NEXT_PUBLIC_ENV === environment;
  const dedicated = text(env.BF1_ACCESS_SUPABASE_URL) !== "";
  const databaseUrl = dedicated ? text(env.BF1_ACCESS_SUPABASE_URL) : text(env.CMV_GUIDE_SUPABASE_URL);
  const serviceRoleKey = dedicated
    ? env.BF1_ACCESS_SUPABASE_SERVICE_ROLE_KEY || ""
    : env.CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY || "";
  const abuseSecret = dedicated ? env.BF1_ACCESS_ABUSE_SECRET || "" : env.CMV_GUIDE_ABUSE_SECRET || "";
  const enabled = env.BF1_ACCESS_ENABLED === "true";

  const errors = [];
  if (!enabled) errors.push("disabled");
  if (!aligned) errors.push("environment_mismatch");
  if (!validDatabaseUrl(databaseUrl, environment)) errors.push("database_url_invalid");
  if (!validSecret(serviceRoleKey, 32)) errors.push("database_key_missing");
  if (!validSecret(abuseSecret, 32)) errors.push("abuse_protection_missing");
  const ready = errors.length === 0;

  return Object.freeze({
    environment: aligned ? environment : null,
    ready,
    source: dedicated ? "dedicated" : "cmv_guide",
    // Em homolog todo cadastro é teste; em produção, real. Sem terceiro estado.
    recordKind: environment === "homolog" ? "test" : "live",
    databaseUrl: ready ? databaseUrl : null,
    serviceRoleKey: ready ? serviceRoleKey : null,
    abuseSecret: ready ? abuseSecret : null,
    errors: Object.freeze(errors),
  });
}
