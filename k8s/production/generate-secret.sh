#!/usr/bin/env bash
# Cria ou SUBSTITUI o Secret de runtime da landing de produção. Credenciais
# geradas aqui (leads, automação de conteúdo, cron) são preservadas quando o
# Secret já existe, para não invalidar chamadas em voo nem o CronJob. Nenhum
# valor é impresso. Requer root para ler a fonte de runtime da Hostinger.
set -euo pipefail
umask 077

export KUBECONFIG=${KUBECONFIG:-/etc/rancher/k3s/k3s.yaml}
NS=${NS:-rook-production}
SB_NS=${SB_NS:-supabase-production}
SECRET=${SECRET:-rook-lp-production-env}
RUNTIME_ENV=${RUNTIME_ENV:-/etc/rook-production/runtime/landing.production.env}
SOURCE_REVISION=${SOURCE_REVISION:-manual}

# Valor atual de uma chave do Secret, ou vazio.
existing() {
  kubectl -n "$NS" get secret "$SECRET" -o jsonpath="{.data.$1}" 2>/dev/null | base64 -d || true
}

# Lê KEY=valor (com ou sem aspas) da fonte root-only sem ecoar o valor.
from_runtime_env() {
  local line
  line=$(grep -m1 "^$1=" "$RUNTIME_ENV") || { printf 'ERRO: %s ausente em %s\n' "$1" "$RUNTIME_ENV" >&2; exit 1; }
  line=${line#*=}
  line=${line%\"}; line=${line#\"}
  printf '%s' "$line"
}

test -r "$RUNTIME_ENV" || { printf 'ERRO: %s ilegível; execute como root.\n' "$RUNTIME_ENV" >&2; exit 1; }
[[ "$SOURCE_REVISION" =~ ^([0-9a-f]{40}|manual)$ ]] || { printf 'ERRO: SOURCE_REVISION inválida.\n' >&2; exit 1; }

ANON=$(kubectl -n "$SB_NS" get secret supabase-jwt -o jsonpath='{.data.anonKey}' | base64 -d)
SERVICE=$(kubectl -n "$SB_NS" get secret supabase-jwt -o jsonpath='{.data.serviceKey}' | base64 -d)
RESEND_API_KEY=$(from_runtime_env RESEND_API_KEY)
ASAFLOW_ACQUISITION_ENABLED=$(from_runtime_env ASAFLOW_ACQUISITION_ENABLED)
ASAFLOW_ACQUISITION_API_KEY=$(from_runtime_env ASAFLOW_ACQUISITION_API_KEY)
ASAFLOW_ACQUISITION_PIPELINE_ID=$(from_runtime_env ASAFLOW_ACQUISITION_PIPELINE_ID)
ASAFLOW_ACQUISITION_STAGE_ID=$(from_runtime_env ASAFLOW_ACQUISITION_STAGE_ID)
case "$ASAFLOW_ACQUISITION_ENABLED" in
  true|false) ;;
  *) printf 'ERRO: ASAFLOW_ACQUISITION_ENABLED deve ser true ou false.\n' >&2; exit 1 ;;
esac
if [ "$ASAFLOW_ACQUISITION_ENABLED" = true ]; then
  for value in "$ASAFLOW_ACQUISITION_API_KEY" "$ASAFLOW_ACQUISITION_PIPELINE_ID" "$ASAFLOW_ACQUISITION_STAGE_ID"; do
    [ -n "$value" ] || { printf 'ERRO: integração AsaFlow habilitada com configuração vazia.\n' >&2; exit 1; }
  done
fi
COMMERCIAL_LEAD_ABUSE_SECRET=$(existing COMMERCIAL_LEAD_ABUSE_SECRET)
CONTENT_AUTOMATION_SECRET=$(existing CONTENT_AUTOMATION_SECRET)
CRON_SECRET=$(existing CRON_SECRET)
[ -n "$COMMERCIAL_LEAD_ABUSE_SECRET" ] || COMMERCIAL_LEAD_ABUSE_SECRET=$(openssl rand -hex 32)
[ -n "$CONTENT_AUTOMATION_SECRET" ] || CONTENT_AUTOMATION_SECRET=$(openssl rand -hex 32)
[ -n "$CRON_SECRET" ] || CRON_SECRET=$(openssl rand -hex 32)
INTERNAL_SUPABASE_URL="http://supabase-supabase-kong.${SB_NS}.svc.cluster.local:8000"

kubectl -n "$NS" create secret generic "$SECRET" \
  --from-literal=SUPABASE_URL="$INTERNAL_SUPABASE_URL" \
  --from-literal=SUPABASE_ANON_KEY="$ANON" \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL=https://supabase.rook.com.br \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON" \
  --from-literal=RESEND_API_KEY="$RESEND_API_KEY" \
  --from-literal=ASAFLOW_ACQUISITION_ENABLED="$ASAFLOW_ACQUISITION_ENABLED" \
  --from-literal=ASAFLOW_ACQUISITION_API_KEY="$ASAFLOW_ACQUISITION_API_KEY" \
  --from-literal=ASAFLOW_ACQUISITION_PIPELINE_ID="$ASAFLOW_ACQUISITION_PIPELINE_ID" \
  --from-literal=ASAFLOW_ACQUISITION_STAGE_ID="$ASAFLOW_ACQUISITION_STAGE_ID" \
  --from-literal=COMMERCIAL_LEAD_ABUSE_SECRET="$COMMERCIAL_LEAD_ABUSE_SECRET" \
  --from-literal=CONTENT_AUTOMATION_SECRET="$CONTENT_AUTOMATION_SECRET" \
  --from-literal=CRON_SECRET="$CRON_SECRET" \
  --from-literal=NEWSLETTER_FROM='Rook <comunicacao@rook.com.br>' \
  --from-literal=NEWSLETTER_REPLY_TO=comunicacao@rook.com.br \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null

kubectl -n "$NS" label secret "$SECRET" \
  app.kubernetes.io/part-of=rook-production \
  rooksystem.com/environment=production \
  rooksystem.com/source-revision="$SOURCE_REVISION" \
  --overwrite >/dev/null

unset ANON SERVICE RESEND_API_KEY ASAFLOW_ACQUISITION_ENABLED ASAFLOW_ACQUISITION_API_KEY
unset ASAFLOW_ACQUISITION_PIPELINE_ID ASAFLOW_ACQUISITION_STAGE_ID
unset COMMERCIAL_LEAD_ABUSE_SECRET CONTENT_AUTOMATION_SECRET CRON_SECRET
printf '%s aplicado em %s sem exibir valores.\n' "$SECRET" "$NS"
