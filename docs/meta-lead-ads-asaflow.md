# Meta Lead Ads → AsaFlow

## Fluxo

O cron da Vercel chama `GET /api/cron/meta-leads/` a cada dez minutos. A rota exige `Authorization: Bearer <CRON_SECRET>` e não aceita chamadas sem `CRON_SECRET` configurado.

A barra final é obrigatória. Com `trailingSlash: true` no `next.config.mjs`, o caminho sem barra responde 308 para a versão com barra, e o cron da Vercel não segue redirect (a execução termina no 308, sem chegar à rota e sem log). O teste `cron da Vercel aponta para a rota com barra final` protege essa regra. Em chamadas manuais, use também a URL com barra, para não depender de redirect.

Quando habilitado, o processo consulta cada formulário configurado na Graph API da Meta, usando o cursor `after` construído localmente. Cada rodada lê no máximo dez páginas por formulário e considera somente leads dentro do lookback. Os campos são normalizados no servidor; telefone e e-mail são os identificadores usados na busca exata de contato no AsaFlow.

Antes de qualquer escrita, a integração faz o dedupe durável no pipeline pago. Se a leitura do ledger falhar ou vier com formato inválido, a rodada é abortada em modo fail-closed e nenhum contato ou negócio é criado. Para um lead novo, o contato existente é reutilizado quando e-mail (case-insensitive) e telefone normalizado coincidirem. Contato novo recebe a chave idempotente compartilhada com a aquisição do site. Depois o negócio é criado com a chave `rook-meta-lead-<id-do-lead>` e confirmado por uma leitura que verifica o vínculo do contato.

A descrição do negócio tem um contrato deliberado: leads reais começam com `Lead Meta Ads recebido em ...`; leads sem `ad_id` começam com `Teste de integração Meta (sem anúncio) ...`, sem o texto que dispara a automação de WhatsApp. O consentimento é conservador: somente uma resposta marcada em `custom_disclaimer_responses` produz `sim`.

Cada rodada inicia no máximo 20 leads novos (`META_SYNC_MAX_LEADS_PER_RUN`) e para de iniciar leads após 40 s (`META_SYNC_TIME_BUDGET_MS`), dentro do `maxDuration` de 60 s. O excedente aparece em `skipped.max_leads_per_run` ou `skipped.time_budget` e entra na rodada seguinte; uma gravação em andamento nunca é interrompida por esse limite.

## Automações do AsaFlow afetadas

O negócio nasce no funil `Tráfego pago · Rook`, etapa `Lead recebido`, e aciona as automações já ativas desse funil:

- **F1e** (`6b2bc2c0`): cria a tarefa de primeiro contato, notifica o responsável e move para `Primeiro contato`. Dispara também para negócios `[TESTE]`.
- **F1w** (`70b7329e`): um minuto depois, envia o template oficial `rook_primeiro_contato_v1` pelo WhatsApp **ao lead**, somente se a descrição contiver `Lead Meta Ads recebido`, houver telefone e a descrição não contiver `Consentimento WhatsApp: não.`. Lead de teste (sem `ad_id`) não contém a frase e não recebe mensagem.

Consequência: em `live`, todo lead real com consentimento recebe WhatsApp automático. Antes de ligar `live`, o conteúdo do template e o canal precisam estar aprovados para a promessa do formulário BF26 ("nosso time envia seu acesso ao grupo pelo WhatsApp").

Os UTMs gravados são fixos (`meta` / `paid_social` / `bf2026`) e `utm_content` recebe o `ad_id`. Por isso `META_LEAD_FORM_IDS` deve listar apenas formulários da BF26; um formulário de outra campanha exige parametrizar o `utm_campaign` antes.

## Variáveis de ambiente

- `META_LEADS_SYNC_ENABLED`: precisa ser exatamente `true`. Qualquer outro valor desliga sem fazer rede.
- `META_LEADS_ACCESS_TOKEN`: obrigatório quando habilitado. Vai somente no cabeçalho `Authorization: Bearer ...` da Meta.
- `META_LEAD_FORM_IDS`: IDs separados por vírgula; cada ID precisa ter de 5 a 25 dígitos.
- `META_LEADS_SYNC_MODE`: exatamente `live` habilita escrita; qualquer outro valor é `dry_run`.
- `META_LEADS_LOOKBACK_HOURS`: inteiro com padrão 72, limitado entre 1 e 168 horas.
- `META_LEADS_OWNER_USER_ID`: UUID opcional para `ownerUserId`; UUID inválido é ignorado e sinalizado no relatório.
- `ASAFLOW_ACQUISITION_API_KEY`: chave já usada pelas aquisições do site. É obrigatória em `live`; em `dry_run`, se ausente, o AsaFlow é pulado.
- `CRON_SECRET`: segredo obrigatório da rota cron.

Formulário atual: `BF26 · Black Rook 2026 · Form v1`, ID `1369744858574783` (Página Rook System, criado em 19/11/2026). O formulário da Meta é imutável; uma nova versão gera outro ID, que precisa ser adicionado a `META_LEAD_FORM_IDS`.

O token precisa pertencer a quem anuncia na conta e administra a Página, com `ads_management`, `leads_retrieval`, `pages_show_list`, `pages_read_engagement` e `pages_manage_ads` (`pages_manage_metadata` só seria necessário para webhooks, que esta integração não usa). Recomendação: token de usuário do sistema do Business Manager, atribuído à Página e à conta de anúncios, sem expiração curta. Sem `ads_management`, a Meta pode omitir `ad_id`; nesse caso leads reais seriam tratados como teste (falha segura: nenhum WhatsApp, mas o negócio nasce com `[TESTE]`). O primeiro lead real da UAT deve confirmar `test: 0`.

O token é configurado diretamente na Vercel pelo responsável da conta. Nunca deve ser colado em chat, ticket, terminal ou commit.

Os valores fixos, mantidos como fonte de verdade no código, são:

- Graph API: `https://graph.facebook.com/v26.0`.
- AsaFlow API: `https://app.asaflow.com.br/api/v1`.
- Pipeline: `Tráfego pago · Rook`, ID `9f41600c-e4b1-42d6-b629-5c5d3e98ccd8`.
- Estágio inicial: `Lead recebido`, ID `0b3e252d-d708-4170-bd39-361b69eac8bd`.

## Ativação segura

Os crons da Vercel só rodam no deployment de produção. A homologação (`lp.homolog.rook.com.br`, projeto `rook-landing-hml`, Preview da branch `homolog`) não roda cron: a rota precisa ser chamada manualmente com `Authorization: Bearer <CRON_SECRET>`. Em 19/11/2026 esse Preview não tinha `CRON_SECRET` nem chave do AsaFlow, então a UAT em HML cobre só a leitura da Meta em `dry_run`. Como o AsaFlow tem um único tenant, a gravação só é testável em produção, com o lead da ferramenta de teste (negócio `[TESTE]`, sem WhatsApp).

Não deixe HML e produção em `live` lendo o mesmo formulário ao mesmo tempo: as duas rodadas poderiam ler o ledger vazio juntas. Depois da UAT, desligue o HML (`META_LEADS_SYNC_ENABLED` diferente de `true`).

1. Configure `META_LEADS_SYNC_ENABLED=true`, o token, os IDs dos formulários e `CRON_SECRET`.
2. Mantenha `META_LEADS_SYNC_MODE=dry_run` e, opcionalmente, configure a chave do AsaFlow. O dry-run faz somente `GET` na Meta e nas leituras do AsaFlow; `created` permanece zero.
3. Confira o relatório sem PII: contagens de leads, chaves de campos, consentimento agregado, dedupe e códigos de erro.
4. Gere um lead com a Ferramenta de Teste de Anúncios de Cadastro da Meta (sem `ad_id`) e confira no dry-run: `fetched ≥ 1`, `test ≥ 1`, `fieldKeys` com `email`, `full_name`, `phone_number`, `você_é…` (ou equivalente) e `nome_do_restaurante`, `consentShape.checked ≥ 1`.
5. Após validar o volume e o funil, troque para `META_LEADS_SYNC_MODE=live` e faça o redeploy. Primeira rodada: `created = 1` para o lead de teste (negócio `[TESTE]`, sem WhatsApp). Segunda rodada: `alreadySynced = 1` e `created = 0` (prova do dedupe durável). Depois, marque o negócio de teste como perdido com `Teste ou duplicado`.
6. Monitore as primeiras rodadas, especialmente `asaflow_dedupe_unavailable`, `contact_ambiguous`, `time_budget` e os códigos de idempotência.

## Riscos conhecidos

- A Página tem uma "Entrega de leads automatizada" pré-existente (`Rook System Conexão com CRM · Make`), herdada da operação anterior. Se continuar ativa, os mesmos leads também saem para esse cenário do Make. Deve ser revisada pelo responsável da conta; esta integração não depende dela.
- Contato existente só é reutilizado quando e-mail **e** telefone coincidem (mesma regra da aquisição do site). Mesmo e-mail com telefone diferente gera um contato novo.

## Rollback

Para interromper a sincronização, remova ou altere `META_LEADS_SYNC_ENABLED` para qualquer valor diferente de `true` e faça um novo deploy. A rota passa a responder `status: "disabled"` com HTTP 200 e não realiza chamadas externas. Não é necessário revogar imediatamente as chaves para desligar o polling.

## Fonte de verdade e privacidade

A deduplicação do Meta Lead é o `meta_lead_id` persistido em `properties` dos negócios do pipeline pago. As chaves idempotentes e a confirmação final complementam esse ledger; nenhuma memória local da função é usada como fonte de verdade.

Relatórios e logs nunca incluem nomes, e-mails, telefones, restaurantes, tokens, mensagens de erro da Meta ou corpos de resposta do AsaFlow. O relatório pode conter apenas contagens, códigos curtos e nomes de chaves de `field_data`; valores de campos permanecem fora dele. O token da Meta nunca é colocado em URL, query string, corpo, log ou relatório.
