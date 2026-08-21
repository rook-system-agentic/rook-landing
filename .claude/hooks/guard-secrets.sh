#!/usr/bin/env bash
# PreToolUse (Write|Edit) — nega escrita em arquivo de ambiente com valor real.
#
# POR QUE ISTO EXISTE
# Este repositório não tem gitleaks no pre-commit (não tem husky). Então não há
# rede de segurança nenhuma depois desta: um secret escrito por agente vai para
# o disco, para o contexto da sessão e para o transcript, e só é pego se um
# humano olhar o diff.
#
# O .gitignore ignora .env, .env.local e .env*.local. O único template do
# repositório é .env.local.example — com placeholders — e continua liberado.
# Bloquear na intenção, não na consequência.
set -uo pipefail

payload=$(cat)
file_path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')
[ -n "$file_path" ] || exit 0

base=$(basename "$file_path")

# Único template do repositório — libera explicitamente.
[ "$base" = ".env.local.example" ] && exit 0

case "$base" in
  .env|.env.local|.env.development|.env.development.local|.env.test|.env.test.local|.env.production|.env.production.local|.env.*.local)
    jq -n --arg b "$base" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("Escrita bloqueada em \($b): arquivo de ambiente com valor real (.gitignore linhas 4-6). Secrets não vão para o disco nem para o contexto do agente, e este repositório não tem gitleaks no pre-commit para pegar depois. Variável nova: documente o placeholder em .env.local.example e peça ao humano para preencher o valor real.")
      }
    }'
    ;;
esac
exit 0
