#!/usr/bin/env bash
set -euo pipefail

KUBECTL=${KUBECTL:-kubectl}
NS=${NS:-rook-production}
SB_NS=${SB_NS:-supabase-production}
EXPECTED_IMAGE=rook-lp:prod-a7b1a939
EXPECTED_SHA=a7b1a939e39a4afd7a05cf15f0733fad74bf1651
EXPECTED_HOMOLOG_IMAGE=ghcr.io/rook-system-agentic/rook-lp:sha-58f9ca122997bd6565f0af87bb5f6edb6a50fb9a

fail() {
  printf 'ERRO: %s\n' "$1" >&2
  exit 1
}

"$KUBECTL" -n "$NS" wait --for=condition=available deployment/rook-lp --timeout=120s >/dev/null

image=$("$KUBECTL" -n "$NS" get deployment rook-lp -o jsonpath='{.spec.template.spec.containers[0].image}')
test "$image" = "$EXPECTED_IMAGE" || fail "imagem ativa difere do commit publicado"
source_sha=$("$KUBECTL" -n "$NS" get deployment rook-lp -o jsonpath='{.metadata.annotations.rooksystem\.com/source-revision}')
test "$source_sha" = "$EXPECTED_SHA" || fail "anotação de origem difere do commit publicado"

test "$("$KUBECTL" -n "$NS" get ingress --no-headers 2>/dev/null | wc -l)" -eq 0 \
  || fail "há Ingress no namespace candidato"
test "$("$KUBECTL" -n "$NS" get cronjob --no-headers 2>/dev/null | wc -l)" -eq 0 \
  || fail "há CronJob no namespace candidato"
service_type=$("$KUBECTL" -n "$NS" get service rook-lp -o jsonpath='{.spec.type}')
test "$service_type" = ClusterIP || fail "Service da landing não é ClusterIP"

if "$KUBECTL" -n "$NS" get secret rook-lp-production-env -o jsonpath='{.data.RESEND_API_KEY}' | grep -q .; then
  fail "RESEND_API_KEY não deve estar ativa durante a validação privada"
fi

"$KUBECTL" -n "$NS" exec -i deployment/rook-lp -- node - <<'JS'
const checks = [
  ["home", "http://127.0.0.1:3000/", 200, {}],
  ["blog", "http://127.0.0.1:3000/api/blog/status", 200, {}],
  ["artigo", "http://127.0.0.1:3000/blog/melhor-forma-controle-estoque-restaurante/", 200, {}],
  ["conteúdo protegido", "http://127.0.0.1:3000/api/content/publish", 401, { method: "POST" }],
];

for (const [name, url, expected, options] of checks) {
  const response = await fetch(url, options);
  if (response.status !== expected) {
    throw new Error(`${name}: HTTP ${response.status}, esperado ${expected}`);
  }
  if (name === "blog") {
    const body = await response.json();
    if (body.source !== "live" || body.degraded !== false || body.remotePostCount < 1) {
      throw new Error(`blog sem origem live: ${JSON.stringify(body)}`);
    }
    console.log(`blog: source=${body.source} remote=${body.remotePostCount} served=${body.servedPostCount}`);
  } else {
    console.log(`${name}: HTTP ${response.status}`);
  }
}

let externalBlocked = false;
try {
  await fetch("https://example.com/", { signal: AbortSignal.timeout(5000) });
} catch {
  externalBlocked = true;
}
if (!externalBlocked) throw new Error("egress externo permitido");
console.log("egress externo: bloqueado");
JS

"$KUBECTL" -n "$SB_NS" wait --for=condition=available deployment --all --timeout=180s >/dev/null
"$KUBECTL" -n "$SB_NS" rollout status statefulset/supabase-supabase-db --timeout=180s >/dev/null

DB_PASSWORD=$("$KUBECTL" -n "$SB_NS" get secret supabase-db -o jsonpath='{.data.password}' | base64 -d)
if ! "$KUBECTL" -n "$SB_NS" exec statefulset/supabase-supabase-db -- \
  env PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -U postgres -d postgres -Atqc 'select current_user' \
  | grep -qx postgres; then
  unset DB_PASSWORD
  fail "credencial atual do PostgreSQL não autentica"
fi
unset DB_PASSWORD

for deployment in rook-web rook-admin rook-marketing; do
  "$KUBECTL" -n "$NS" wait --for=condition=available "deployment/$deployment" --timeout=120s >/dev/null
done
worker_replicas=$("$KUBECTL" -n "$NS" get deployment rook-worker -o jsonpath='{.spec.replicas}')
test "$worker_replicas" = 0 || fail "worker candidato foi ativado"

homolog_image=$("$KUBECTL" -n rook-homolog get deployment rook-lp -o jsonpath='{.spec.template.spec.containers[0].image}')
test "$homolog_image" = "$EXPECTED_HOMOLOG_IMAGE" || fail "landing de homologação foi alterada"

printf 'Landing candidata: commit exato, rotas internas e blog live; sem Ingress, cron ou egress externo.\n'
