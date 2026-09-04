# ROO-1207 — Experimento `lp_asaflow_v1`: contratação direta × atendimento assistido

Fonte da verdade da hipótese, da janela e da decisão do experimento. A
configuração do chatbot e do formulário fica no AsaFlow; o código fica em
`src/lib/lp-experiment.mjs`, `src/middleware.ts` e
`src/components/plans/AsaflowAssistedCta.tsx`.

## Hipótese

Em `/planos`, trocar o CTA "Testar por 7 dias" (checkout direto no app) por
"Falar com o Rook agora" (chat do AsaFlow, com o formulário como alternativa)
aumenta a taxa de **contrato pago/ativado por sessão elegível**. Preço, copy da
oferta e layout não mudam; só a ação primária.

## Desenho

| Item | Definição |
| :-- | :-- |
| `experiment_id` | `lp_asaflow_v1` |
| Variantes | `direct` (A, controle) e `assisted` (B) |
| Unidade de randomização | navegador, por cookie first-party `rook_lp_exp` (90 dias) |
| Elegibilidade | visitante da home ou de `/planos` com o catálogo disponível; homolog não conta (tracking desligado) |
| Alocação | sorteio no middleware, na primeira visita; a porcentagem vem de `LP_ASAFLOW_ASSISTED_PCT` |
| Persistência | o cookie vence o sorteio nas visitas seguintes; `/` e `/planos` compartilham o cookie |
| Kill switch | `LP_ASAFLOW_ASSISTED_PCT=0` (ou ausente): todo mundo vê a A e o cookie é apagado |
| QA | `?lp_exp=assisted` ou `?lp_exp=direct` força a variante (não passa pelo kill switch) |

A Variante B só existe com `NEXT_PUBLIC_ASAFLOW_WIDGET_SRC` e
`NEXT_PUBLIC_ASAFLOW_FORM_URL` definidas. Sem as duas, a porcentagem vale 0.

## Métricas

| Papel | Métrica | Onde |
| :-- | :-- | :-- |
| **Primária** | contrato pago/ativado por sessão elegível | billing canônico do Rook, por `experiment_id`/`variant` (depende da ROO-1206 para fechar a atribuição server-side) |
| Secundárias | `cta_click`, `chat_open`, `form_view`, `generate_lead`, `app_handoff{destino=contratar}` por variante | GA4, via GTM |
| Guardrails | `integration_error`; CLS/LCP/INP de `/planos` | GA4; Speed Insights/Lighthouse |

`app_handoff` com `destino=contratar` é o `checkout_start` da issue — não há
evento separado para não contar a mesma saída duas vezes.

Nenhum evento carrega dado pessoal: a allowlist em `src/lib/tracking-events.mjs`
lança exceção para qualquer campo fora de `experiment_id`, `variant`,
`page_type`, `destination`, `plan`, `channel`, `component`, `error_code`.

## Tamanho de amostra (preencher antes de ligar 50/50)

Fórmula para duas proporções, α = 5 % bicaudal, poder 80 %:

```
n por variante ≈ 2 × (1,96 + 0,84)² × p × (1 − p) / (MDE_absoluto)²
```

| Entrada | Valor | Quem preenche |
| :-- | :-- | :-- |
| Conversão basal `p` (contratos pagos ÷ sessões elegíveis, 30 dias anteriores) | ______ | Gabriel, a partir do GA4 + billing |
| MDE absoluto aprovado | ______ | Gabriel |
| `n` por variante | ______ | derivado |
| Sessões elegíveis/dia em `/planos` | ______ | GA4 |
| Duração estimada (≥ 2 semanas inteiras, para cobrir sazonalidade semanal) | ______ | derivado |

Regra de encerramento: só há "vencedor" com `n` atingido nas duas variantes e
diferença significativa na métrica primária. Sem amostra mínima, o resultado é
**inconclusivo** — não "a B está ganhando".

## Rollout

1. Deploy com `LP_ASAFLOW_ASSISTED_PCT=0` (padrão). Nada muda para o visitante.
2. Preencher `NEXT_PUBLIC_ASAFLOW_WIDGET_SRC` e `NEXT_PUBLIC_ASAFLOW_FORM_URL` na Vercel.
3. Validar em preview com `?lp_exp=assisted`: chat, formulário, fallback (bloquear o script no DevTools), `dataLayer` sem PII.
4. `LP_ASAFLOW_ASSISTED_PCT=10` em produção → redeploy → smoke test.
5. `LP_ASAFLOW_ASSISTED_PCT=50` **com aprovação de Gabriel** → redeploy.
6. Rollback: `LP_ASAFLOW_ASSISTED_PCT=0` → redeploy (~1 min). O middleware apaga o cookie de quem estava na B.

Decisão de 04/09/2026: a porcentagem mora em variável de ambiente, e mudar
exige redeploy. A issue pedia rollback "sem novo deploy"; o custo de Edge
Config (dependência nova + store na Vercel) não se justifica para um número
que muda três vezes na vida do experimento.

## GTM

As tags novas estão descritas em `docs/gtm-container-spec.md`, seção
"Experimento AsaFlow". Publicar o contêiner antes do passo 4.

## Pendências conhecidas

- **Snippet do widget.** O código só carrega o script de `NEXT_PUBLIC_ASAFLOW_WIDGET_SRC` no primeiro clique. Quando o snippet oficial do canal `Chat - Cadastro Site` chegar, verificar se ele expõe uma API de "abrir" e chamá-la em `AsaflowAssistedCta.tsx` (marcado com `ponytail:`). Hoje `chat_open` significa "script carregou".
- **`generate_lead` do formulário AsaFlow.** O formulário roda em iframe de outra origem; sem `postMessage` do fornecedor não há como saber que a submissão terminou. O lead fica visível no próprio AsaFlow (com `utm_*`, `landing_url`, `referrer`, `experiment_id` e `variant` na URL do embed — confirmar que o AsaFlow os captura).
- **Atribuição server-side do contrato pago** pertence à ROO-1206.

## Decisão

| Data | Decisão | Quem |
| :-- | :-- | :-- |
| ______ | manter / interromper / iterar | Gabriel |
