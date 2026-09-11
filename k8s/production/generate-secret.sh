#!/usr/bin/env bash
set -euo pipefail
umask 077

export KUBECONFIG=${KUBECONFIG:-/etc/rancher/k3s/k3s.yaml}
NS=${NS:-rook-production}
SB_NS=${SB_NS:-supabase-production}
SECRET=${SECRET:-rook-lp-production-env}

if kubectl -n "$NS" get secret "$SECRET" >/dev/null 2>&1; then
  printf '%s já existe em %s; nenhuma credencial foi alterada.\n' "$SECRET" "$NS"
  exit 0
fi

ANON=$(kubectl -n "$SB_NS" get secret supabase-jwt -o jsonpath='{.data.anonKey}' | base64 -d)
SERVICE=$(kubectl -n "$SB_NS" get secret supabase-jwt -o jsonpath='{.data.serviceKey}' | base64 -d)
COMMERCIAL_LEAD_ABUSE_SECRET=$(openssl rand -hex 32)
CONTENT_AUTOMATION_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
INTERNAL_SUPABASE_URL="http://supabase-supabase-kong.${SB_NS}.svc.cluster.local:8000"

kubectl -n "$NS" create secret generic "$SECRET" \
  --from-literal=SUPABASE_URL="$INTERNAL_SUPABASE_URL" \
  --from-literal=SUPABASE_ANON_KEY="$ANON" \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL=https://supabase-production.rooksystem.com.br \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON" \
  --from-literal=COMMERCIAL_LEAD_ABUSE_SECRET="$COMMERCIAL_LEAD_ABUSE_SECRET" \
  --from-literal=CONTENT_AUTOMATION_SECRET="$CONTENT_AUTOMATION_SECRET" \
  --from-literal=CRON_SECRET="$CRON_SECRET" \
  --from-literal=NEWSLETTER_FROM='Rook Validation <nao-responda@production.invalid>' \
  --from-literal=NEWSLETTER_REPLY_TO=nao-responda@production.invalid \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null

kubectl -n "$NS" label secret "$SECRET" \
  app.kubernetes.io/part-of=rook-production \
  rooksystem.com/environment=production \
  rooksystem.com/source-revision=a7b1a939e39a4afd7a05cf15f0733fad74bf1651 \
  --overwrite >/dev/null

unset ANON SERVICE COMMERCIAL_LEAD_ABUSE_SECRET CONTENT_AUTOMATION_SECRET CRON_SECRET
printf '%s criado em %s sem exibir valores.\n' "$SECRET" "$NS"
