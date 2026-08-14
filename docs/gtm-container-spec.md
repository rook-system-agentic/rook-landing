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
