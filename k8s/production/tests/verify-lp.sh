#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
MANIFEST="$ROOT/k8s/production/lp.yaml"
DOCKERFILE="$ROOT/k8s/production/Dockerfile"
SECRET_GENERATOR="$ROOT/k8s/production/generate-secret.sh"

fail() {
  printf 'ERRO: %s\n' "$1" >&2
  exit 1
}

test -f "$MANIFEST" || fail "manifesto de produção ausente"
test -f "$DOCKERFILE" || fail "Dockerfile de produção ausente"
test -x "$SECRET_GENERATOR" || fail "gerador de Secret ausente ou não executável"

grep -q '^  namespace: rook-production$' "$MANIFEST" || fail "namespace incorreto"
grep -q '^  name: rook-lp$' "$MANIFEST" || fail "Deployment/Service rook-lp ausente"
grep -q '^  replicas: 1$' "$MANIFEST" || fail "réplica única ausente"
grep -q 'image: rook-lp:prod-a7b1a939' "$MANIFEST" || fail "imagem não fixa o commit publicado"
grep -q 'imagePullPolicy: Never' "$MANIFEST" || fail "imagem local pode tentar pull externo"
grep -q 'automountServiceAccountToken: false' "$MANIFEST" || fail "token do ServiceAccount está montado"
grep -q 'runAsNonRoot: true' "$MANIFEST" || fail "container pode executar como root"
grep -q 'allowPrivilegeEscalation: false' "$MANIFEST" || fail "container permite elevação"
grep -q 'rooksystem.com/supabase-api-client: "true"' "$MANIFEST" || fail "egress ao Supabase não será selecionado"
grep -q 'name: rook-lp-production-env' "$MANIFEST" || fail "Secret de runtime ausente"
grep -q 'name: NEXT_PUBLIC_ENV' "$MANIFEST" || fail "marcador de ambiente ausente"
grep -q 'value: production' "$MANIFEST" || fail "ambiente não é produção"
grep -q 'readinessProbe:' "$MANIFEST" || fail "readiness probe ausente"
grep -q 'livenessProbe:' "$MANIFEST" || fail "liveness probe ausente"
grep -q '^  type: ClusterIP$' "$MANIFEST" || fail "Service não está restrito ao cluster"

if grep -q '^kind: Ingress$' "$MANIFEST"; then
  fail "Ingress não pode existir antes do cutover"
fi
if grep -qi 'rook-homolog\|lp-homolog' "$MANIFEST"; then
  fail "manifesto de produção referencia homologação"
fi
if grep -qE 'value: (eyJ|re_|sbp_|postgres(ql)?://)' "$MANIFEST"; then
  fail "possível segredo literal no manifesto"
fi

grep -q '^ARG NEXT_PUBLIC_ENV=production$' "$DOCKERFILE" || fail "build não assume produção"
grep -q '^USER node$' "$DOCKERFILE" || fail "runtime não usa usuário node"
grep -q 'NEXT_PUBLIC_SITE_URL' "$DOCKERFILE" || fail "origem canônica não entra no build"

grep -q 'supabase-production' "$SECRET_GENERATOR" || fail "Secret não aponta ao Supabase candidato"
grep -q -- '--dry-run=client -o yaml' "$SECRET_GENERATOR" || fail "Secret não é aplicado declarativamente"
if grep -q 'rook-homolog\|namespace: supabase$' "$SECRET_GENERATOR"; then
  fail "gerador pode alcançar homologação"
fi

printf 'Contrato da landing de produção validado.\n'
