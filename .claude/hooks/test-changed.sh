#!/usr/bin/env bash
# PostToolUse (Write|Edit) — roda a suíte node:test correspondente ao módulo tocado.
#
# POR QUE ISTO EXISTE, E POR QUE NÃO É UM HOOK DE LINT
#
# 1. Não há ESLint utilizável aqui. O script é `next lint` e não existe
#    .eslintrc nem eslint.config.* no repositório — um hook de lint passaria
#    falso-verde. Se um dia adotarem config, aí sim vale acrescentar.
#
# 2. A arquitetura do repo foi feita exatamente para isto: a lógica vive em
#    .mjs sem dependências, com .d.mts ao lado, para `node --test` rodar direto
#    sem build de TS. Um teste leva menos de 1s. É o gate mais barato que existe
#    aqui e o único que valida comportamento.
#
# 3. `src/lib/<nome>.mjs` → `tests/<nome>.test.mjs`, por nome. Sem par, sai
#    calado — não é erro, a maioria dos .ts é glue de efeito.
#
# 4. tracking-events é a fronteira LGPD (o formulário de planos coleta nome,
#    e-mail, telefone e CNPJ e nada disso pode chegar ao GA4/Meta). O wrapper
#    src/lib/tracking.ts também dispara essa suíte, porque quebrar o allowlist
#    de fora do .mjs é igualmente possível.
#
# 5. billing-catalog fica fora: o snapshot expira em 7 dias e a suíte está no
#    FORA_DO_GATE do CI justamente por isso. Falharia por data, não por código.
#
# 6. async + asyncRewake no settings.json: não trava a edição, e o exit 2
#    acorda o Claude quando um teste realmente quebra.
#
# 7. O filtro é escrito contra o reporter `spec`, que é o que o node 24 usa
#    aqui mesmo com a saída em pipe (`✖ nome`, `ℹ fail N`, e as linhas de
#    AssertionError). Filtro de TAP (`not ok`) não casa nada nesta saída — sai
#    o bloco do erro sem o nome do teste que caiu. Os stacks ficam de fora de
#    propósito: nome do teste + mensagem da asserção bastam para agir.
set -uo pipefail

REPO="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

payload=$(cat)
file_path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')
[ -n "$file_path" ] || exit 0

case "$file_path" in
  /*) abs="$file_path" ;;
  *)  abs="${REPO}/${file_path}" ;;
esac
[ -f "$abs" ] || exit 0

rel="${abs#"$REPO"/}"
suite=""

case "$rel" in
  src/lib/tracking.ts|src/lib/tracking-events.mjs)
    suite="tests/tracking-events.test.mjs" ;;
  src/lib/*.mjs)
    nome=$(basename "$rel" .mjs)
    [ "$nome" = "public-billing-catalog" ] && exit 0   # snapshot com validade — ver nota 5
    suite="tests/${nome}.test.mjs" ;;
  *) exit 0 ;;
esac

[ -f "${REPO}/${suite}" ] || exit 0

cd "$REPO" || exit 0
if ! saida=$(node --test "$suite" 2>&1); then
  {
    echo "Suíte quebrada após editar ${rel}:  node --test ${suite}"
    echo
    printf '%s\n' "$saida" | grep -E '^✖ |^ℹ (pass|fail) |^ +[A-Za-z]+Error' | head -30
  } >&2
  exit 2
fi
exit 0
