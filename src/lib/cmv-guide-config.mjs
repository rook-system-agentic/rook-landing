const HOMOLOG_DATABASE_HOSTS = new Set([
  "hsaehgdbzqgqehkfzofz.supabase.co",
  "supabase.homolog.rook.com.br",
  "supabase-homolog.rooksystem.com.br",
]);
const PRODUCTION_DATABASE_HOSTS = new Set([
  "fzvhgucgfmhnisaqellu.supabase.co",
  "supabase.rook.com.br",
]);
const CONTROL_OR_HEADER = /[\u0000-\u001f\u007f\u2028\u2029]/;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const ROOK_EMAIL = /^[^\s@<>]+@rook\.com\.br$/i;

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validSecret(value, minimum = 1) {
  return typeof value === "string" && value.length >= minimum;
}

function validDatabaseUrl(value, environment) {
  if (!nonEmpty(value)) return false;
  try {
    const url = new URL(value);
    const allowed = environment === "homolog" ? HOMOLOG_DATABASE_HOSTS : PRODUCTION_DATABASE_HOSTS;
    return url.protocol === "https:"
      && url.pathname === "/"
      && !url.search
      && !url.hash
      && !url.username
      && !url.password
      && !url.port
      && allowed.has(url.hostname);
  } catch {
    return false;
  }
}

function validSender(value) {
  if (!value || CONTROL_OR_HEADER.test(value)) return false;
  const match = /^([^<>]+)<([^<>]+)>$/u.exec(value);
  if (match) {
    const displayName = match[1].trim();
    const address = match[2].trim();
    return displayName.length > 0 && !/[<>]/.test(displayName) && ROOK_EMAIL.test(address);
  }
  return ROOK_EMAIL.test(value);
}

function validReplyTo(value) {
  return EMAIL.test(value) && !CONTROL_OR_HEADER.test(value);
}

function environmentIsAligned(environment, env) {
  return (environment === "homolog" || environment === "production")
    && env.NEXT_PUBLIC_ENV === environment;
}

export function readCmvGuideConfig(env = {}) {
  const environment = env.CMV_GUIDE_ENV;
  const enabled = env.CMV_GUIDE_ENABLED === "true";
  const aligned = environmentIsAligned(environment, env);
  const databaseConfigured = validDatabaseUrl(env.CMV_GUIDE_SUPABASE_URL, environment);
  const serviceRoleConfigured = validSecret(env.CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY, 32);
  // O desafio é o mesmo algoritmo distribuído da aquisição, mas sua RPC deve
  // apontar para o banco dedicado desta rota. Nunca herdar segredo ou URL globais.
  const abuseSecret = env.CMV_GUIDE_ABUSE_SECRET || "";
  const abuseConfigured = validSecret(abuseSecret, 32);
  const testEmail = typeof env.CMV_GUIDE_TEST_EMAIL === "string" ? env.CMV_GUIDE_TEST_EMAIL.trim().toLowerCase() : "";
  const homologRecipientConfigured = environment !== "homolog" || EMAIL.test(testEmail);
  const publicReady = enabled && aligned && databaseConfigured && serviceRoleConfigured && abuseConfigured && homologRecipientConfigured;
  const deliveryEnabled = env.CMV_GUIDE_DELIVERY_ENABLED === "true";
  const sender = typeof env.CMV_GUIDE_FROM === "string" ? env.CMV_GUIDE_FROM.trim() : "";
  const replyTo = typeof env.CMV_GUIDE_REPLY_TO === "string" ? env.CMV_GUIDE_REPLY_TO.trim() : "";
  const deliveryReady = publicReady
    && deliveryEnabled
    && validSecret(env.RESEND_API_KEY, 1)
    && validSender(sender)
    && (!replyTo || validReplyTo(replyTo))
    && homologRecipientConfigured;

  const errors = [];
  if (!enabled) errors.push("disabled");
  if (!aligned) errors.push("environment_mismatch");
  if (!databaseConfigured) errors.push("database_url_invalid");
  if (!serviceRoleConfigured) errors.push("database_key_missing");
  if (!abuseConfigured) errors.push("abuse_protection_missing");
  if (!homologRecipientConfigured) errors.push("test_recipient_missing");
  if (!deliveryEnabled) errors.push("delivery_disabled");
  if (!validSecret(env.RESEND_API_KEY, 1)) errors.push("resend_key_missing");
  if (!validSender(sender)) errors.push("sender_missing");
  if (replyTo && !validReplyTo(replyTo)) errors.push("reply_to_invalid");

  return Object.freeze({
    environment,
    publicReady,
    deliveryReady,
    databaseUrl: publicReady ? env.CMV_GUIDE_SUPABASE_URL : null,
    serviceRoleKey: publicReady ? env.CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY : null,
    abuseSecret: publicReady ? abuseSecret : null,
    resendApiKey: deliveryReady ? env.RESEND_API_KEY : null,
    from: deliveryReady ? sender : null,
    replyTo: deliveryReady && replyTo ? replyTo : null,
    testEmail: environment === "homolog" && homologRecipientConfigured ? testEmail : null,
    errors: Object.freeze(errors),
  });
}

export function publicCmvGuideState(config) {
  return config?.publicReady === true ? "ready" : "unavailable";
}

export function deliveryCmvGuideState(config) {
  return config?.deliveryReady === true ? "ready" : "unavailable";
}
