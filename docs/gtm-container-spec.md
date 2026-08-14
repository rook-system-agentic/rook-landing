# Contêiner GTM-M8ZJ3WTV — o que criar para a LP (ROO-1117)

⚠️ **Este contêiner é compartilhado com `app.rook.com.br`.** Toda tag abaixo
leva condição de hostname. Tag sem condição dispara também no app, que já envia
`page_view` manualmente — o app passaria a contar cada tela duas vezes.

## Variáveis

| Nome | Tipo | Configuração |
| :-- | :-- | :-- |
| `dlv - page_type` | Variável da camada de dados | Nome: `page_type` |
| `dlv - plano` | Variável da camada de dados | Nome: `plano` |
| `dlv - ab_variant` | Variável da camada de dados | Nome: `ab_variant` |
| `dlv - destino` | Variável da camada de dados | Nome: `destino` |

## Gatilhos

| Nome | Tipo | Condição |
| :-- | :-- | :-- |
| `LP - todas as páginas` | Visualização de página | `Page Hostname` igual a `www.rook.com.br` |
| `LP - lead comercial` | Evento personalizado | Nome `generate_lead` **e** `Page Hostname` igual a `www.rook.com.br` |
| `LP - diagnóstico concluído` | Evento personalizado | Nome `diagnostic_complete` **e** `Page Hostname` igual a `www.rook.com.br` |
| `LP - newsletter` | Evento personalizado | Nome `newsletter_signup` **e** `Page Hostname` igual a `www.rook.com.br` |
| `LP - saída para o app` | Evento personalizado | Nome `app_handoff` **e** `Page Hostname` igual a `www.rook.com.br` |

## Tags

> 📌 **Templates necessários:** As quatro tags `Meta - *` usam o tipo "Pixel do Facebook", que não é nativo do GTM. Antes de criar essas tags, instale o template oficial "Meta Pixel" pela Galeria de Templates da comunidade (ícone de Lego, no canto superior direito). Alternativa: use tags de HTML personalizado com o código do pixel.

| Nome | Tipo | ID | Gatilho | Observação |
| :-- | :-- | :-- | :-- | :-- |
| `GA4 - configuração LP` | Google Tag | `G-M93QYWQ84F` | `LP - todas as páginas` | Parâmetro `page_type` = `{{dlv - page_type}}`. Permite separar no relatório entre home, planos, blog, diagnóstico e calculadora sem depender da URL. Manda a LP para a propriedade unificada. |
| `GA4 - generate_lead` | Evento GA4 | `GA4 - configuração LP` | `LP - lead comercial` | Tag de configuração: `GA4 - configuração LP`. Parâmetro `plano` = `dlv - plano` |
| `GA4 - diagnostic_complete` | Evento GA4 | `GA4 - configuração LP` | `LP - diagnóstico concluído` | Tag de configuração: `GA4 - configuração LP`. Parâmetro `ab_variant` = `dlv - ab_variant` |
| `GA4 - newsletter_signup` | Evento GA4 | `GA4 - configuração LP` | `LP - newsletter` | Tag de configuração: `GA4 - configuração LP`. Sem parâmetro. |
| `GA4 - app_handoff` | Evento GA4 | `GA4 - configuração LP` | `LP - saída para o app` | Tag de configuração: `GA4 - configuração LP`. Parâmetro `destino` = `dlv - destino` |
| `Meta - PageView` | Pixel do Facebook | `1088278284898303` | `LP - todas as páginas` | |
| `Meta - Lead` | Pixel do Facebook | `1088278284898303` | `LP - lead comercial` | Evento `Lead` |
| `Meta - CompleteRegistration` | Pixel do Facebook | `1088278284898303` | `LP - diagnóstico concluído` | Evento `CompleteRegistration` — **não** usar `Lead`, para não misturar intenção comercial com uso de ferramenta |
| `Meta - Subscribe` | Pixel do Facebook | `1088278284898303` | `LP - newsletter` | Evento `Subscribe` |
| `Google Ads - conversão` | Conversão do Google Ads | `AW-7866728846` | `LP - lead comercial` | Rótulo de conversão vem da conta do Ads |
| `Clarity` | HTML personalizado | `x4y25y8xz4` | `LP - todas as páginas` | |

## Depois de publicar

No GA4, marcar como evento-chave (conversão): `generate_lead` e
`diagnostic_complete`. Coletar o evento **não** o torna conversão.

## Ordem de publicação

1. Criar e publicar tudo acima **antes** do deploy do código. Nada dispara — a
   LP ainda não carrega o contêiner.
2. Só então mergear o PR do código.

Isso troca a medição num instante só: sem janela sem medição e sem janela
medindo em dobro.

## Consentimento por tag: a Meta exige configuração manual

As tags `GA4 - configuração LP`, `GA4 - generate_lead`,
`GA4 - diagnostic_complete`, `GA4 - newsletter_signup` e `GA4 - app_handoff`
são nativas do Google e respeitam o sinal do Consent Mode sozinhas —
nenhuma configuração adicional é necessária nelas.

**As quatro tags `Meta - PageView`, `Meta - Lead`,
`Meta - CompleteRegistration` e `Meta - Subscribe` NÃO respeitam o Consent
Mode automaticamente.** Elas usam o template de comunidade "Pixel do
Facebook" (ver nota de templates acima), que o GTM trata como tag de
terceiro: sem configuração explícita, disparam do mesmo jeito mesmo com a
publicidade recusada.

Em cada uma das quatro tags `Meta - *`: abrir o editor da tag →
Configurações avançadas → Configurações de consentimento → marcar "Exigir
consentimento adicional para disparo desta tag" → adicionar `ad_storage`.
Sem isso, o pixel dispara mesmo quando o visitante clica em "Recusar anúncios".

⚠️ **`Google Ads - conversão` recebe a mesma checagem, mas não silencia por
completo.** Marque "Exigir consentimento adicional para disparo desta tag" →
`ad_storage` nela também, igual às quatro da Meta. Isso reduz o disparo — a
tag deixa de rodar quando o consentimento é negado, dentro do GTM. Mas por
desenho do próprio Consent Mode, o `gtag` do Google Ads envia, à parte do
GTM, um ping sem cookie para modelagem de conversão mesmo com `ad_storage`
negado. Não existe checagem que feche essa porta — é comportamento do
Google, não do contêiner.

⚠️ **Ordem: este passo só pode ser feito depois que o PR do consentimento
estiver em produção.** Se a checagem acima for marcada antes do deploy, as
tags da Meta e a de `Google Ads - conversão` passam a exigir um sinal de
consentimento (`ad_storage`) que o site ainda não emite — e param de disparar
em silêncio, inclusive para visitantes que aceitariam a publicidade. A
sequência correta:

1. Publicar o contêiner completo (seção "Ordem de publicação" acima) e
   mergear o PR do código de consentimento.
2. Confirmar em produção que o Consent Mode está emitindo `ad_storage` e que
   o banner de cookies funciona.
3. Só então voltar ao GTM e marcar a checagem de consentimento (`ad_storage`)
   nas quatro tags `Meta - *` e na tag `Google Ads - conversão`.

Sem o passo 3, a página de privacidade — que diz que sem consentimento a Meta
e o Google Ads não gravam cookies nem usam os dados para publicidade —
descreve uma promessa que a configuração do contêiner ainda não cumpre para o
pixel da Meta. Para o Google Ads, mesmo com o passo 3 feito, o ping sem
cookie da modelagem de conversão continua: a página não promete o contrário,
porque fala em não gravar cookie e não usar dado para publicidade, não em não
emitir nenhum sinal.
