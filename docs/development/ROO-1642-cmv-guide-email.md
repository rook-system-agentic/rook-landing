# ROO-1642 — Guia CMV: LP e entrega transacional por email

**Status: Em desenvolvimento.** Este documento acompanha as PRs e não certifica a funcionalidade como homologada ou ativa. Solicitante/aprovador: Gabriel Abdala. Vídeo v2 e brindes originais intactos. Desenvolvimento aceito em 28/10/2026; integração de cada PR, mudanças de ambiente e envios reais precisam de autorização correspondente.

## Objetivo e fontes da verdade

`/guia-cmv/` apresenta o Guia Prático CMV Rook e a planilha de apoio. A pessoa cadastra nome, email, telefone com DDD e nome do restaurante. A aplicação grava uma solicitação educativa, separada de pedido financeiro/comercial, e envia dois anexos em um email transacional via Resend. Não usa n8n, conta/senha, URL pública de download, cookie de liberação, newsletter ou dependência síncrona do CRM.

Regras e validação ficam nos módulos `src/lib/cmv-guide*` e APIs do `rook-landing`; schema/RLS/RPCs ficam na migration ROO-1642 de **rook-system**, proprietário do banco. `public.cmv_guide_requests` guarda o pedido e o estado do envio; Resend confirma o envio/entrega; bucket privado guarda as versões dos brindes. Linear ROO-1642 guarda critérios de aceite e aprovações. Não criar uma segunda migration destes objetos na landing nem duplicar dados na newsletter.

## Interfaces

GET `/api/cmv-guide/` emite o desafio antiabuso. POST na mesma rota recebe `submissionId`, os quatro campos, `commercialContactRequested` opcional e `antiBot`. A API valida limites/tipos, origem e desafio distribuído e grava o pedido. Não dispara o email durante o POST. Uma resposta de sucesso só existe depois da gravação confirmada. `queued` significa **pedido salvo, envio pendente**; `provider_accepted` não equivale a entrega. O formulário mantém campos em falhas; repetição usa a identidade e dados da tentativa, renovando somente o desafio.

POST `/api/internal/cmv-guide-dispatch/` aceita apenas Bearer `CMV_GUIDE_DISPATCH_SECRET`. Recupera até duas pendências do ambiente exato em paralelo, envia anexos privados com Resend e reconcilia até dois recibos de email já aceito. O acionador só recebe contagens sanitizadas, nunca os dados do formulário ou anexos.

`queued → processing → provider_accepted → delivered` é o caminho positivo. Falhas transitórias ficam em retry com backoff e teto; falha permanente/devolução ficam visíveis para operação. Resultado ambíguo fora da janela de idempotência precisa de reconciliação, não de disparo indiscriminado com uma chave nova. Não há download desbloqueado na LP.

## Configuração por ambiente — nenhuma alteração automática

Todas as variáveis abaixo são server-side, salvo o `NEXT_PUBLIC_ENV` já adotado no site. Não usar prefixo `NEXT_PUBLIC_` para key, remetente interno ou segredo. O `.env.local.example` só declara valores vazios/desativados e não configura qualquer deployment.

| Configuração | Regra |
|---|---|
| `CMV_GUIDE_ENABLED` | `true` habilita cadastro; ausente/false bloqueia sem sucesso simulado. |
| `CMV_GUIDE_DELIVERY_ENABLED` | `true` habilita o despachante; ausente/false não claim/envia. |
| `CMV_GUIDE_ENV` | `homolog` ou `production`, alinhado a `NEXT_PUBLIC_ENV`. |
| `CMV_GUIDE_SUPABASE_URL` e `CMV_GUIDE_SUPABASE_SERVICE_ROLE_KEY` | Projeto dedicado do ambiente; sem fallback ao banco de leitura do blog. |
| `CMV_GUIDE_ABUSE_SECRET` | HMAC próprio, aleatório, >=32 caracteres; módulo distribuído existente usando client CMV. |
| `CMV_GUIDE_DISPATCH_SECRET` | Aleatório, >=32 caracteres; diferente por ambiente; não é CONTENT_AUTOMATION_SECRET. |
| `RESEND_API_KEY` | Chave existente/restrita de envio; conferir configuração e quota, sem rotacionar para ativar a LP. |
| `CMV_GUIDE_FROM` | Endereço válido no domínio verificado; sugestão `Rook <materiais@rook.com.br>` sujeita a teste. |
| `CMV_GUIDE_REPLY_TO` | Opcional; apenas um canal monitorado confirmado. Não presumir recebimento de respostas pelo Resend. |
| `CMV_GUIDE_TEST_EMAIL` | Obrigatório em HML; somente este destinatário é autorizado, não redirecionar cadastro de terceiros. |

A landing HML atualmente é publicada no projeto Vercel `rook-landing-hml` como Preview de `homolog`, em `https://lp.homolog.rook.com.br`, e está intencionalmente sem banco do blog. A configuração CMV dedicada não exige reconfigurar `SUPABASE_URL` global e não deve retirar esse isolamento. Banco HML permitido: projeto `hsaehgdbzqgqehkfzofz`; produção: `fzvhgucgfmhnisaqellu`. Aliases permitidos precisam refletir exatamente a allowlist de ambiente do código; registrar o hostname efetivo no preflight, sem copiar valores de chaves para evidências.

Confirmar no banco HML também a existência das RPCs do antiabuso distribuído da captação. Ausência de schema/configuração é bloqueio real, não motivo para substituir por um Map em memória. Aplique a migration ROO-1642 pelo trilho oficial do proprietário, em janela autorizada, preservando versão/ledger. Inspecione o delta pendente antes de permitir que um rollout aplique migrations de outras issues.

A migration exige executor e owners das RPCs com `rolsuper` ou `rolbypassrls`, pois usa FORCE RLS sem policy de acesso direto. A recusa deve interromper o deploy; não contornar concedendo acesso direto à tabela. No pós-flight HML, conferir owners e os grants reais e executar as RPCs com caller `service_role`. Os testes portáteis em `rook-system/supabase/tests/cmv-guide/` cobrem SQL e integração com os adapters da landing, mas PGlite não comprova claims concorrentes entre duas sessões reais.

Variáveis Preview de homologação e Production do site não são intercambiáveis. Alterações exigem novo deployment pelo fluxo oficial da landing; não promover o build HML para produção, pois `NEXT_PUBLIC_ENV` está embutido no bundle.

## Brindes privados

Criar, em operação autorizada, bucket **privado** `cmv-guide-private` no mesmo projeto do ambiente. Nenhuma policy pública de leitura ou URL permanente. Upload de duas cópias imutáveis:

| Objeto | Bytes | SHA256 |
|---|---:|---|
| `cmv-guide-v2/Guia_Pratico_CMV_Rook.pdf` | 237658 | `a856f3a96bcb49721f6f25685ff33864438107e050606d834385cfb3ce135b7a` |
| `cmv-guide-v2/Planilha_Apoio_Guia_Pratico_CMV_Rook.xlsx` | 35909 | `02dadc3fa73a43f319da50ff4ba8f69b2b9aadd6fc25379d10adf9ea9294f5c4` |

Não incluir PDF/XLSX/vídeo no Git/public nem usar upload público para resolver acesso. O backend lê com credencial server-side, confere tamanho/hash e envia Base64 no `content` do Resend. Falta ou corrupção impede envio e fica observável sem registrar os bytes. Mudança de material exige versão/chave nova e decisão sobre solicitações anteriores; nunca substituir bytes por baixo da mesma versão.

Anexos podem ser encaminhados por quem os recebeu. Esta barreira condiciona a entrega inicial ao cadastro; não é DRM, verificação formal de identidade ou impedimento de compartilhamento posterior.

## Recuperação nativa da fila

`scripts/dispatch-cmv-guide.mjs` aciona somente os hosts canônicos fixos, não segue redirect com Bearer e tem timeout. `.github/workflows/cmv-guide-delivery.yml` propõe recuperação a cada dez minutos e dispatch manual, com concorrência serial por ambiente. Mesmo manual depende da flag explícita correspondente:

| Ambiente | Repository variable | Repository secret |
|---|---|---|
| Homolog | `CMV_GUIDE_HML_DISPATCH_ENABLED=true` | `CMV_GUIDE_HML_DISPATCH_SECRET` (mesmo segredo no backend HML) |
| Produção | `CMV_GUIDE_PROD_DISPATCH_ENABLED=true` | `CMV_GUIDE_PROD_DISPATCH_SECRET` (mesmo segredo no backend produtivo) |

Sem flags, todos os jobs pulam. Nenhuma flag/secret/workflow foi ativado nesta implementação. Sem cron habilitado, o pedido pode ser gravado e permanecer pendente: **não lançar campanha com cadastro ligado e recuperação ausente**. O lote inicial é de duas mensagens por rodada (capacidade nominal de até 12 novas mensagens/hora, reduzida por retries); validar demanda/latência antes de campanha e aumentar somente após teste de budget/provedor. A cadência proposta é dez minutos; o visitante não recebe uma promessa de envio instantâneo. GitHub Actions pode atrasar agendas e não é garantia de SLA. Caso se exija latência garantida/volume alto, reavaliar o agendador, sem adicionar n8n apenas por hábito.

Schedules GitHub só executam a definição do branch default. Antes da primeira promoção do workflow a `main`, o UAT HML usa o endpoint autorizado diretamente com uma requisição controlada; não declarar cron HML ativo só por existir arquivo na branch. O workflow usa código de `homolog` para HML e `main` para produção. Não modifica a esteira de publicação de artigos/cron Vercel existente.

## Idempotência e concorrência

Submission UUID identifica o pedido; mesma identidade com payload diferente é conflito. RPCs de claim têm lease, limite e seleção do `record_kind`; um dispatcher não disputa o mesmo pedido silenciosamente. `prepare` fixa hash do envelope completo antes da chamada Resend. Retry com bytes/remetente/template diferentes vai para reconciliação sem disparar.

A chave Resend é determinística por versão, ambiente e solicitação. O Resend conserva sua chave por **24 horas**; a aplicação usa limite conservador de **23 horas** da primeira tentativa para repetição automática. Depois disso, interrompe e exige operação consciente de reconciliação. Não resetar `first_attempt_at` nem remover `provider_message_id` para tentar novamente.

Ao recuperar email aceito, consultar o ID retornado pelo Resend: evento `delivered` confirma entrega ao servidor destinatário, não leitura, caixa principal ou abertura do arquivo. `sent`/API aceita não são entrega. Falhas de confirmação não devem rebaixar um estado já entregue nem gerar outro envio.

## UAT e rollout incremental

**P0 — antes de qualquer lançamento:** revisar PRs e migration/RLS; autorizar integração/aplicação HML; provisionar variáveis e arquivos privados HML; conferir o destinatário de teste e usar somente dados sintéticos. Validar gravação dos quatro campos, integridade dos dois anexos, entrega confirmada e abertura PDF/Excel, além de negativa, duplicação, timeout, retry e ausência de newsletter/CRM/demonstração.

A evidencia registra ambiente, SHA, versão migration, IDs não pessoais, contagens e hashes; nenhum telefone/email de cliente, chave, anexos completos ou erro bruto em logs. Um mock de SMTP/Resend, teste Node ou screenshot de sucesso não é UAT de recebimento.

**P1 — produção:** após UAT e autorização, aplicar schema/config/storage no projeto produtivo e promover código pelo trilho oficial da landing. Confirmar deployment/SHA/host, flags de cadastro e entrega, recuperação da fila e remetente/quota. Repetir smoke controlado antes de apontar link do canal/publicar o Short. Retenção dos dados, texto de privacidade e uso de contato comercial precisam de validação do responsável da Rook; pedir o brinde não inscreve em recorrência.

**P2:** CRM/n8n podem consumir solicitações consentidas posteriormente, com um dono do envio. Não implementar consumidores duplicados nem bloquear entrega educativa caso o CRM esteja indisponível.

## Diagnóstico e recuperação

Query administrativa mínima, executada somente pelo administrador autorizado no editor SQL (a service_role da aplicação usa apenas RPCs, sem SELECT direto à tabela):

```sql
SELECT id, record_kind, delivery_status, attempts, next_attempt_at, last_error_code
FROM public.cmv_guide_requests
ORDER BY updated_at DESC
LIMIT 20;
```

O estado e erro sanitizado orientam intervenção; códigos permanentes não sofrem retry infinito. Para pedido ambíguo, reconcile o provider_message_id/registro de Resend antes de criar reenvio deliberado. Não enviar publicamente logs SQL ou dumps da tabela. Não construir interface administrativa genérica nesta versão.

Kill switch: desligar as duas flags do backend e as flags de agenda do ambiente. Isso bloqueia novos cadastros/claims futuros; não desfaz email já aceito nem garante cancelamento de chamada já em andamento. Em incidente, interromper a execução em curso quando aplicável e verificar seu estado antes de ligar novamente. Rollback de código preserva tabela e dados; não DROP, DELETE em massa ou reset do ledger. Correção de schema após integração usa migration nova.

## Pendências que não são sucesso

Ao abrir as PRs, o código e testes locais podem estar prontos; schema HML, configuração de runtime, uploads privados, recebimento real, integração de PRs e publicação ainda são etapas posteriores. Registrar resultados reais no resumo do PR e no Linear, sem marcar Done até aceite humano.
