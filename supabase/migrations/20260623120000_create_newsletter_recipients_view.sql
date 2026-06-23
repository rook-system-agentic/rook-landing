-- ROO-139 — Newsletter: view de audiência unificada + hardening de leads_newsletter.
--
-- Aplicar no SQL Editor do Supabase (apply_migration via MCP é bloqueado pelo
-- classificador DDL). Versionada no PR; Gabriel roda e claude_code verifica via execute_sql.
--
-- Nota sobre o spec original do ROO-139: a view proposta na issue referenciava
-- users.full_name / users.email / users.email_notifications / users.status — colunas que
-- NÃO existem. public.users só tem name/subscription_status; o e-mail mora em auth.users.
-- A view abaixo é a versão corrigida e travada (cruza auth.users = PII -> só service_role).

-- 1) View: lead (leads_newsletter consentido) + client (assinante ativo com e-mail).
CREATE OR REPLACE VIEW public.newsletter_recipients AS
SELECT
  ln.id,
  ln.name,
  ln.email,
  'lead'::text                                AS audience_type,
  ln.status,
  ln.consent_at,
  ln.created_at
FROM public.leads_newsletter ln
WHERE ln.status = 'active'
UNION ALL
SELECT
  u.id,
  u.name,
  au.email,
  'client'::text                              AS audience_type,
  COALESCE(u.subscription_status, 'inactive') AS status,
  NULL::timestamptz                           AS consent_at,
  u.created_at
FROM public.users u
JOIN auth.users au ON au.id = u.id
WHERE u.subscription_status = 'active'
  AND au.email IS NOT NULL;

-- View definer (NÃO security_invoker): lê auth.users com privilégio do owner.
-- Por isso o acesso precisa ser estritamente restrito (passo 2).
ALTER VIEW public.newsletter_recipients SET (security_invoker = false);

COMMENT ON VIEW public.newsletter_recipients IS
  'ROO-139: audiência unificada da newsletter (lead = leads_newsletter consentido; client = user com assinatura ativa + auth.users.email). Cruza auth.users (PII) -> acesso só service_role.';

-- 2) Lock de acesso da view (PII): nunca exposta a anon/authenticated.
REVOKE ALL ON public.newsletter_recipients FROM PUBLIC;
REVOKE ALL ON public.newsletter_recipients FROM anon, authenticated;
GRANT SELECT ON public.newsletter_recipients TO service_role;

-- 3) Hardening de leads_newsletter (tabela de PII / e-mails).
--    Estava com grants amplos a anon/authenticated (INSERT/SELECT/UPDATE/DELETE) — resíduo do
--    form que inseria como anon. A captura agora é 100% server-side (service_role via
--    /api/newsletter). Removemos a superfície pública; service_role mantém acesso total.
REVOKE ALL ON public.leads_newsletter FROM anon, authenticated;
