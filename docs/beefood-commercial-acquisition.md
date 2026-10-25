# Cadastro comercial da parceria BeeFood

A LP externa pode usar seu próprio formulário e chamar diretamente o cadastro
comercial do site Rook. O CORS de `/api/acquisition/` autoriza somente a origem
`https://rook-beefood-parceria-20261023.gabriel-abdala.chatgpt.site`, além da
própria origem do endpoint e da origem pública em `SITE_ORIGIN` (para proxies
com HTTP/host interno). Não há liberação global nem uso de cookies ou
credenciais de CRM no navegador. Chamadas sem `Origin` continuam seguindo o
contrato público anterior; CORS não é autenticação.

## Contrato do navegador

1. Conservar um `submissionId` UUID v4 e os mesmos dados durante uma tentativa.
2. Fazer `GET https://www.rook.com.br/api/acquisition/` com `credentials: 'omit'`
   e `cache: 'no-store'` para obter `token`, `difficulty` e `expiresInSeconds`.
3. Resolver a prova no navegador com `solveCommercialLeadChallenge`, usando o
   mesmo algoritmo de `src/lib/commercial-lead-challenge-client.mjs`.
4. Fazer `POST` JSON para a mesma URL, com `credentials: 'omit'`, os campos
   validados pelo cadastro e `antiBot: {token, solution}`. Não usar um proxy:
   o desafio continua vinculado ao IP observado no GET e no POST.
5. Mostrar confirmação somente para HTTP `201` e `{success: true}`. Após uma
   falha, buscar outra prova e repetir o mesmo UUID e dados; não criar outra
   solicitação automaticamente.

Campos obrigatórios: `name`, `company`, `email`, `phone`, `cityId` (IBGE da lista
oficial), `segment`, `revenueBand`, `usesErp` (`yes` ou `no`), `consent: true` e
`submissionId`. `segment: 'other'` exige `segmentOther`; `usesErp: 'yes'` exige
`erp`, e `erp: 'other'` exige `erpOther`. Para BeeFood, pode-se usar
`erp: 'other', erpOther: 'BeeFood'` quando o visitante confirmar esse sistema.
Uma solicitação comercial usa `intent: 'demo'`, sem campos de simulação.
`revenueBand` aceita `up_to_50k`, `50k_to_100k`, `100k_to_250k`, `250k_to_500k`
e `above_500k` (faturamento bruto mensal; R$ 250 mil é o limite do plano Knight,
inclusive). Os valores anteriores a 24/10/2026 (`up_to_100k`, `100k_to_200k`,
`200k_to_300k`, `above_300k`) continuam aceitos para não quebrar a integração,
mas a LP parceira deve migrar: `200k_to_300k` atravessa o limite do Knight e não
indica plano. Fonte: `REVENUE_BANDS` e `LEGACY_REVENUE_BANDS` em
`src/lib/acquisition-input.mjs`.

As fontes de seleção são `culinary-segments.mjs`, `acquisition-input.mjs` e
`src/data/municipalities.json`. O consentimento é “Quero receber contato da
equipe sobre o Rook, conforme a Política de Privacidade.”, com link para
`https://www.rook.com.br/privacidade/`.

A atribuição aceita `utm_source: 'beefood'`, `utm_medium: 'parceria'` e
`utm_campaign: 'rook-beefood'`; usar `capturePath: '/'` e
`attribution.landing_path: '/'` para a raiz da LP. A atribuição é autodeclarada
e normalizada pelo servidor; não é prova de identidade da parceria.

## Respostas e limites preservados

- `400`: JSON, prova inválida/expirada ou nonce já consumido; renovar a prova.
- `403`: origem ou pré-verificação não permitida.
- `409`: UUID já registrado com outros dados; retomar os dados originais.
- `413`: corpo acima de 16 KiB.
- `422`: campos inválidos, com `fieldErrors`.
- `429`: limite de IP/identidade, respeitando `Retry-After` exposto ao navegador.
- `503`: configuração, fornecedor, espera de confirmação ou reconciliação;
  não equivale a sucesso. `Retry-After` pode estar presente.

O limite distribuído continua em 20 por IP e 5 por identidade a cada 15 minutos.
A prova tem dificuldade 3, duração de 10 minutos e consumo único. O ledger,
deduplicação de contato, idempotência e confirmação de vínculo no Asaflow não
foram alterados. Uma origem com outro domínio, subdomínio, protocolo ou porta
não herda a permissão; um novo endereço da LP exige revisão da allowlist.

## Verificação e publicação

Os testes executam a rota real com transportes substituídos: pré-verificação e
origens negadas não criam desafio nem alcançam CRM; erros preservam CORS; uma
prova real rejeita outro IP e replay. Não há criação de leads na rede.

Executar `pnpm exec tsc --noEmit`, `pnpm test:ci` e
`bash k8s/production/tests/verify-lp.sh`. O fluxo normal é branch de trabalho →
`homolog` → `main`, conforme `CLAUDE.md`. O código deste contrato foi integrado
em `homolog` pelo [PR #176](https://github.com/rook-system-agentic/rook-landing/pull/176),
no commit `a2522499c9411340db4bb2b19fcbd2862bbd778f`.

A promoção isolada usa `hotfix/beefood-commercial-form`, baseada na `main`,
com somente os dois commits de CORS já integrados em homologação e esta nota
de estado. O `Base Guard` permite `hotfix/*`; esta seleção evita levar as
mudanças pendentes de SEO da ROO-1557.

A comprovação real de GET/OPTIONS em homologação foi concluída em
23/10/2026, após o deploy do commit `a2522499c9411340db4bb2b19fcbd2862bbd778f`
às 16:41 UTC, sem enviar POST nem criar cadastros:

- GET com origem parceira: `200`, desafio e `Access-Control-Allow-Origin`
  exatamente igual à origem da LP.
- GET com origem nativa `https://lp-homolog.rooksystem.com.br`: `200`, desafio
  e `Access-Control-Allow-Origin` exatamente igual à origem nativa.
- GET com origem inválida: `403`, sem `Access-Control-Allow-Origin`.
- OPTIONS da parceira para POST e Content-Type: `204`, origem exata e sem
  `Access-Control-Allow-Credentials`.
- OPTIONS com origem inválida ou header Authorization: `403`.

Essa comprovação confirma CORS e emissão do desafio; não é evidência de
recebimento de um cadastro real no CRM.

O merge para `homolog` dispara sua publicação; a `main` publica a produção
pela Vercel. Testes locais e um PR de promoção em rascunho não provam publicação
nem recebimento de um cadastro real no CRM. Não promover outras mudanças,
credenciais ou flags junto com esta correção.
