#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
MANIFEST="$ROOT/k8s/production/lp.yaml"
DOCKERFILE="$ROOT/k8s/production/Dockerfile"
SECRET_GENERATOR="$ROOT/k8s/production/generate-secret.sh"
SECRET_WRAPPER="$ROOT/k8s/production/rook-lp-runtime-secret-reconcile"
CRONJOB="$ROOT/k8s/production/cron/publish-scheduled.yaml"
WORKFLOW="$ROOT/.github/workflows/deploy-production.yml"
VERCEL_JSON="$ROOT/vercel.json"

fail() {
  printf 'ERRO: %s\n' "$1" >&2
  exit 1
}

test -f "$MANIFEST" || fail "manifesto de produção ausente"
test -f "$DOCKERFILE" || fail "Dockerfile de produção ausente"
test -x "$SECRET_GENERATOR" || fail "gerador de Secret ausente ou não executável"
test -x "$SECRET_WRAPPER" || fail "wrapper privilegiado ausente ou não executável"
test -f "$CRONJOB" || fail "CronJob de publicação agendada ausente"
test -f "$WORKFLOW" || fail "workflow de deploy de produção ausente"

grep -q '^ARG NEXT_PUBLIC_SUPABASE_URL$' "$DOCKERFILE" || fail "URL pública do destino não é parâmetro do build"
grep -q '^ARG NEXT_PUBLIC_SUPABASE_ANON_KEY$' "$DOCKERFILE" || fail "chave pública do destino não é parâmetro do build"
grep -q '^ARG SUPABASE_URL$' "$DOCKERFILE" || fail "origem privada do CMS não é separada no build"
grep -q '^ARG SUPABASE_ANON_KEY$' "$DOCKERFILE" || fail "chave privada de build do CMS não é separada"

# Regressão do corte para Hostinger: runtime env não configura código client.
for name in NEXT_PUBLIC_ASAFLOW_CHAT_ENABLED NEXT_PUBLIC_ASAFLOW_CHAT_TENANT NEXT_PUBLIC_ASAFLOW_CHAT_FLOW; do
  grep -q "^ARG ${name}\\(=.*\\)\\?$" "$DOCKERFILE" || fail "$name não é argumento do build"
  grep -Fq "$name=\$$name" "$DOCKERFILE" || fail "$name não chega ao ambiente do Next build"
  grep -Fq -- "--build-arg $name=\"\$$name\"" "$WORKFLOW" || fail "$name não é passado pelo deploy"
  grep -q "^  ${name}: " "$WORKFLOW" || fail "$name não está configurado no deploy"
done
grep -Fq "aria-label=\"Abrir chat Rook AI\"" "$WORKFLOW" || fail "smoke não confere a presença do chat"

grep -q '^  namespace: rook-production$' "$MANIFEST" || fail "namespace incorreto"
grep -q '^  name: rook-lp$' "$MANIFEST" || fail "Deployment/Service rook-lp ausente"
grep -q '^  replicas: 1$' "$MANIFEST" || fail "réplica única ausente"
grep -q 'image: rook-lp:production$' "$MANIFEST" || fail "imagem não é o placeholder trocado pelo deploy"
grep -q 'value: https://www.rook.com.br$' "$MANIFEST" || fail "NEXT_PUBLIC_SITE_URL não é a origem canônica"
grep -q 'rooksystem.com/internet-egress: "true"' "$MANIFEST" || fail "egress à internet (Resend/GTM) não será selecionado"
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

grep -q '^kind: Ingress$' "$MANIFEST" || fail "Ingress www.rook.com.br ausente"
grep -q 'ingressClassName: nginx' "$MANIFEST" || fail "Ingress sem classe nginx"
grep -q -- '- host: www.rook.com.br$' "$MANIFEST" || fail "Ingress não serve www.rook.com.br"
grep -q 'secretName: rook-origin' "$MANIFEST" || fail "TLS do Ingress não usa o Secret rook-origin"
if grep -q 'configuration-snippet\|\$request_uri' "$MANIFEST"; then
  fail "anotação recusada pelo admission webhook do ingress-nginx"
fi
if grep -q 'a7b1a939' "$MANIFEST" "$SECRET_GENERATOR"; then
  fail "revisão fixa da Vercel ainda referenciada"
fi
if grep -qi 'rook-homolog\|lp-homolog' "$MANIFEST"; then
  fail "manifesto de produção referencia homologação"
fi
if grep -qE 'value: (eyJ|re_|sbp_|postgres(ql)?://)' "$MANIFEST"; then
  fail "possível segredo literal no manifesto"
fi

grep -q '^ARG NEXT_PUBLIC_ENV=production$' "$DOCKERFILE" || fail "build não assume produção"
grep -q '^USER node$' "$DOCKERFILE" || fail "runtime não usa usuário node"
grep -q '^ARG NEXT_PUBLIC_SITE_URL=https://www.rook.com.br$' "$DOCKERFILE" || fail "origem canônica do build não é www.rook.com.br"
grep -q 'test "$NEXT_PUBLIC_SITE_URL" = https://www.rook.com.br' "$DOCKERFILE" || fail "build não recusa outra origem"

grep -q 'supabase-production' "$SECRET_GENERATOR" || fail "Secret não aponta ao Supabase candidato"
grep -q 'NEXT_PUBLIC_SUPABASE_URL=https://supabase.rook.com.br' "$SECRET_GENERATOR" || fail "URL pública do Supabase não é a de produção"
grep -q 'comunicacao@rook.com.br' "$SECRET_GENERATOR" || fail "remetente da newsletter não é o real"
grep -q '/etc/rook-production/runtime/landing.production.env' "$SECRET_GENERATOR" || fail "fonte root-only da Hostinger ausente"
for name in ASAFLOW_ACQUISITION_ENABLED ASAFLOW_ACQUISITION_API_KEY ASAFLOW_ACQUISITION_PIPELINE_ID ASAFLOW_ACQUISITION_STAGE_ID; do
  grep -Fq "from_runtime_env $name" "$SECRET_GENERATOR" || fail "$name não vem da fonte de runtime"
  grep -Fq -- "--from-literal=$name=\"\$$name\"" "$SECRET_GENERATOR" || fail "$name não chega ao Secret"
done
grep -Fq 'rooksystem.com/source-revision="$SOURCE_REVISION"' "$SECRET_GENERATOR" || fail "Secret sem revisão de origem"
grep -q 'existing CRON_SECRET' "$SECRET_GENERATOR" || fail "CRON_SECRET existente não é preservado"
if grep -q 'já existe.*exit 0' "$SECRET_GENERATOR"; then
  fail "gerador ainda desiste quando o Secret existe"
fi
if grep -qE '^(echo|printf).*\$(RESEND_API_KEY|ANON|SERVICE|CRON_SECRET)' "$SECRET_GENERATOR"; then
  fail "gerador imprime segredo"
fi
grep -q -- '--dry-run=client -o yaml' "$SECRET_GENERATOR" || fail "Secret não é aplicado declarativamente"
if grep -q 'rook-homolog\|namespace: supabase$' "$SECRET_GENERATOR"; then
  fail "gerador pode alcançar homologação"
fi

grep -q '^  name: cron-lp-publish-scheduled$' "$CRONJOB" || fail "nome do CronJob incorreto"
grep -q '^  namespace: rook-production$' "$CRONJOB" || fail "CronJob fora do namespace de produção"
grep -q '^  suspend: true$' "$CRONJOB" || fail "CronJob não nasce suspenso"
grep -q '^  schedule: "0 \* \* \* \*"$' "$CRONJOB" || fail "agenda do CronJob difere do vercel.json"
grep -q 'concurrencyPolicy: Forbid' "$CRONJOB" || fail "CronJob permite execuções concorrentes"
grep -q 'rooksystem.com/cron-client: "true"' "$CRONJOB" || fail "pod do cron sem label de cliente de cron"
grep -q 'app.kubernetes.io/part-of: rook-production-cron' "$CRONJOB" || fail "CronJob fora do conjunto rook-production-cron"
grep -q 'name: rook-lp-production-env' "$CRONJOB" || fail "CRON_SECRET não vem do Secret da landing"
grep -q 'http://rook-lp.rook-production.svc.cluster.local/api/content/cron/publish-scheduled' "$CRONJOB" || fail "rota do cron incorreta"

grep -q 'branches: \[main\]' "$WORKFLOW" || fail "workflow não publica a main"
grep -q 'group: deploy-production-lp' "$WORKFLOW" || fail "concorrência do deploy ausente"
grep -q 'cancel-in-progress: false' "$WORKFLOW" || fail "deploy pode ser cancelado pela metade"
grep -q 'secrets.PROD_SUPABASE_ANON_KEY' "$WORKFLOW" || fail "anon key de produção não é exigida"
grep -q 'vars.PROD_EXTERNAL_EFFECTS' "$WORKFLOW" || fail "portão PROD_EXTERNAL_EFFECTS ausente"
grep -q 'image: rook-lp:production|image: rook-lp:prod-\${GITHUB_SHA}' "$WORKFLOW" || fail "workflow não troca o placeholder da imagem"
grep -q 'rollout undo deploy/rook-lp' "$WORKFLOW" || fail "rollback em falha ausente"
grep -q -- '--resolve www.rook.com.br:443:127.0.0.1 https://www.rook.com.br/' "$WORKFLOW" || fail "smoke pelo ingress local ausente"
grep -q 'rook-lp-runtime-secret-reconcile' "$WORKFLOW" || fail "workflow não reconcilia o Secret root-only"
grep -q 'sha256sum k8s/production/generate-secret.sh' "$WORKFLOW" || fail "workflow não valida o gerador root-owned"
grep -q '/usr/local/lib/rook-lp/generate-secret.sh' "$SECRET_WRAPPER" || fail "wrapper não fixa o gerador root-owned"
grep -q 'env -i' "$SECRET_WRAPPER" || fail "wrapper herda ambiente não confiável do runner"

# Executa o wrapper com um gerador fictício em diretório temporário. Só o
# caminho fixo do gerador é trocado na cópia de teste; nenhuma chamada kubectl,
# fonte de runtime ou escrita no cache privilegiado é realizada.
python3 - "$SECRET_WRAPPER" <<'PY'
import hashlib
import os
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile

source = Path(sys.argv[1]).read_text()
fixed_generator = 'GENERATOR=/usr/local/lib/rook-lp/generate-secret.sh'
assert source.count(fixed_generator) == 1, 'gerador deve continuar fixo no wrapper'
revision = '1' * 40

with tempfile.TemporaryDirectory(prefix='rook-lp-wrapper-') as temporary:
    root = Path(temporary)
    workspace = root / 'checkout'
    workspace.mkdir()
    generator = root / 'generator.sh'
    generator.write_text('''#!/bin/sh
set -eu
test "${KUBECACHEDIR:-}" = /var/cache/rook-lp/kubectl
test "${KUBECONFIG:-}" = /etc/rancher/k3s/k3s.yaml
test "${NS:-}" = rook-production
test "${SB_NS:-}" = supabase-production
test "${SECRET:-}" = rook-lp-production-env
test "${RUNTIME_ENV:-}" = /etc/rook-production/runtime/landing.production.env
test "${UNTRUSTED_PARENT_ENV+x}" != x
test "${SOURCE_REVISION:-}" = ''' + revision + '''
printf 'gerador-ficticio-ok\\n'
''')
    generator.chmod(0o700)
    wrapper = root / 'wrapper.sh'
    wrapper.write_text(source.replace(fixed_generator, 'GENERATOR=' + shlex.quote(str(generator)), 1))
    digest = hashlib.sha256(generator.read_bytes()).hexdigest()
    environment = dict(os.environ, KUBECACHEDIR='./cache-herdado',
                       UNTRUSTED_PARENT_ENV='nao-propagar')

    def run(rev, checksum):
        return subprocess.run(['bash', str(wrapper), rev, checksum], cwd=workspace,
                              env=environment, text=True, capture_output=True)

    valid = run(revision, digest)
    assert valid.returncode == 0, valid.stderr or 'cache absoluto não chegou ao gerador'
    assert valid.stdout == 'gerador-ficticio-ok\n', 'gerador fictício não foi executado'
    for rev, checksum, expected_code in [(revision, '0' * 64, 1), ('../main', digest, 64)]:
        invalid = run(rev, checksum)
        assert invalid.returncode == expected_code, 'validação do wrapper foi alterada'
        assert 'gerador-ficticio-ok' not in invalid.stdout, 'gerador executado sem validação'
    assert not list(workspace.iterdir()), 'wrapper deixou artefatos no checkout'

print('Wrapper validado: cache absoluto, ambiente isolado e validação preservada.')
PY

grep -q 'https://www.rook.com.br/api/acquisition/' "$WORKFLOW" || fail "workflow não valida a rota de aquisição"
grep -q 'k8s/production/cron/publish-scheduled.yaml' "$WORKFLOW" || fail "workflow não aplica o CronJob"
if grep -qi 'vercel deploy\|vercel --prod\|lp-homolog\|rook-homolog' "$WORKFLOW"; then
  fail "workflow de produção referencia Vercel deploy ou homologação"
fi

python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if d.get("git",{}).get("deploymentEnabled",{}).get("main") is False else 1)' "$VERCEL_JSON" \
  || fail "vercel.json não desliga o deploy automático da main"

printf 'Contrato da landing de produção validado.\n'
