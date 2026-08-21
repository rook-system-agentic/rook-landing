# Contêiner GTM-M8ZJ3WTV — tags da LP (ROO-1117)

⚠️ **Este contêiner é compartilhado com `app.rook.com.br`.** Toda tag abaixo
leva condição de hostname. Tag sem condição dispara também no app, que já envia
`page_view` manualmente — o app passaria a contar cada tela duas vezes.

**Estado: publicado na versão 4 do contêiner, em 21/08/2026.** As tabelas
abaixo descrevem o que está no ar, verificado lendo o
`gtm.js?id=GTM-M8ZJ3WTV` servido. Duas tags previstas ainda faltam, ver
"Pendências".

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

> 📌 **A Meta não tem template mantido no GTM.** O template de comunidade
> "Pixel do Facebook" está arquivado pela própria Meta. As quatro tags
> `Meta - *` são **HTML personalizado** com o código do pixel, com
> "Suportar document.write" desmarcado. A ordem é segura sem sequenciamento:
> `Meta - PageView` (que faz o `fbq('init')`) dispara na visualização de
> página, e os três eventos só existem depois de uma interação.

| Nome | Tipo | ID | Gatilho | Observação |
| :-- | :-- | :-- | :-- | :-- |
| `GA4 - configuração LP` | Google Tag | `G-M93QYWQ84F` | `LP - todas as páginas` | ⚠️ **Não é uma tag nova: é a Google Tag que já existia no contêiner.** Ela disparava em *Inicialização*, sem condição de hostname. Ganhou o parâmetro de configuração `page_type` = `{{dlv - page_type}}` e passou a usar `LP - todas as páginas`. Criar uma segunda Google Tag com o mesmo `G-M93QYWQ84F` daria **dois `page_view` na LP** — duas chamadas de `config` para o mesmo ID de medição. O app não perde nada com a restrição de hostname: ele carrega o próprio `gtag/js?id=G-M93QYWQ84F` no código, com `send_page_view: false`, e manda o `page_view` à mão. A restrição na verdade **encerrou uma contagem em dobro que já existia no app**. Sobre `page_type`: o `Header` navega com `next/link` (troca de rota sem recarregar o documento), o gatilho de visualização de página dispara uma vez por carregamento, e o script que empurra `page_type` não reexecuta na troca de rota. Hoje isso separa no relatório pela **página de entrada da sessão**, não página a página. |
| `GA4 - generate_lead` | Evento GA4 | `G-M93QYWQ84F` | `LP - lead comercial` | ID de medição declarado direto na tag. Parâmetro `plano` = `{{dlv - plano}}` |
| `GA4 - diagnostic_complete` | Evento GA4 | `G-M93QYWQ84F` | `LP - diagnóstico concluído` | Parâmetro `ab_variant` = `{{dlv - ab_variant}}` |
| `GA4 - newsletter_signup` | Evento GA4 | `G-M93QYWQ84F` | `LP - newsletter` | Sem parâmetro. |
| `GA4 - app_handoff` | Evento GA4 | `G-M93QYWQ84F` | `LP - saída para o app` | Parâmetro `destino` = `{{dlv - destino}}` |
| `Meta - PageView` | HTML personalizado | `1088278284898303` | `LP - todas as páginas` | Código base do pixel: `fbq('init')` + `fbq('track','PageView')` |
| `Meta - Lead` | HTML personalizado | `1088278284898303` | `LP - lead comercial` | `fbq('track','Lead')` |
| `Meta - CompleteRegistration` | HTML personalizado | `1088278284898303` | `LP - diagnóstico concluído` | `fbq('track','CompleteRegistration')` — **não** usar `Lead`, para não misturar intenção comercial com uso de ferramenta |
| `Meta - Subscribe` | HTML personalizado | `1088278284898303` | `LP - newsletter` | `fbq('track','Subscribe')` |
| `Google Ads - remarketing` | Google Tag | `AW-7866728846` | `LP - todas as páginas` | Repõe o que o código fazia antes com `gtag('config','AW-…')` em toda página. Sem ela, o público de remarketing para de ser alimentado. |
| `Google Ads - vinculador de conversões` | Vinculador de conversões | — | `LP - todas as páginas` | Preserva o `gclid` do clique. Sem ela a conversão não é atribuída à campanha. |

## Faltando no contêiner (verificado na versão 4)

| O que | Efeito de estar faltando |
| :-- | :-- |
| `Clarity` · HTML personalizado · projeto `x4y25y8xz4` · `LP - todas as páginas` | A LP está **sem gravação de sessão desde 17/08/2026**: o script saiu do código no PR #86 e nunca entrou no contêiner. O projeto `x4y25y8xz4` é o da LP; o app usa outro (`x4ynw4yaek`), não confunda. |
| Conversão de lead no Google Ads | O `AW-7866728846` está no ar como Google Tag (remarketing), mas **nenhuma conversão é registrada**. Duas saídas: criar a tag "Conversão do Google Ads" no gatilho `LP - lead comercial` (o rótulo vem de *Objetivos → Conversões* na conta do Ads), **ou** importar o evento-chave `generate_lead` do GA4 como conversão no Ads. A segunda não cria tag nenhuma e é suficiente para a campanha otimizar. |

## Depois de publicar — três passos no GA4, não um

**1. Evento-chave.** Marcar `generate_lead` e `diagnostic_complete` como
evento-chave. Coletar o evento **não** o torna conversão.

**2. Dimensões personalizadas.** Sem isto os parâmetros são coletados e não
aparecem em relatório nenhum — só no DebugView e no Tempo real. Admin →
*Definições personalizadas* → escopo **Evento**, quatro entradas:
`page_type`, `plano`, `ab_variant`, `destino`.

**3. Medição entre domínios.** Admin → *Fluxos de dados* → o fluxo do
`G-M93QYWQ84F` → *Configurar as configurações da tag* → **Configurar seus
domínios**: incluir `rook.com.br` **e** `app.rook.com.br`. Sem isso, quem
sai da LP para o app começa sessão nova e vira dois usuários — o
`app_handoff` mede o clique, mas a atribuição se perde na porta, e a
"jornada mensurável ponta a ponta" não fecha.

## Ordem de publicação — o que era o plano, e o que aconteceu

O plano era publicar o contêiner **antes** do merge do código, para trocar a
medição num instante só: sem janela sem medição e sem janela medindo em dobro.

Na prática o PR #86 foi mergeado em 17/08 e o contêiner só foi publicado em
21/08. Consequência dos quatro dias: a LP ficou sem Meta Pixel, sem tag do
Google Ads e sem Clarity — as tags saíram do código e ainda não existiam no
contêiner. O GA4 continuou recebendo `page_view` só porque a Google Tag do
app disparava sem condição de hostname, e chegava sem `page_type`.

Fica registrado porque a ordem inversa não dá erro em lugar nenhum: nenhuma
tag falha, nenhum teste quebra, nenhum alerta dispara. O sintoma é número que
não existe, e número que não existe ninguém vê.

## Consentimento por tag: a Meta exige configuração manual

As tags `GA4 - configuração LP`, `GA4 - generate_lead`,
`GA4 - diagnostic_complete`, `GA4 - newsletter_signup` e `GA4 - app_handoff`
são nativas do Google e respeitam o sinal do Consent Mode sozinhas —
nenhuma configuração adicional é necessária nelas.

**As quatro tags `Meta - PageView`, `Meta - Lead`,
`Meta - CompleteRegistration` e `Meta - Subscribe` NÃO respeitam o Consent
Mode automaticamente.** São HTML personalizado, que o GTM trata como tag de
terceiro: sem configuração explícita, disparam do mesmo jeito mesmo com a
publicidade recusada.

⚠️ **Ordem: a checagem de consentimento abaixo só pode ser marcada depois
que o PR do consentimento estiver em produção.** Se for marcada antes do
deploy, as tags da Meta e as do Google Ads passam a exigir um sinal de
consentimento (`ad_storage`) que o site ainda não emite — e param de disparar
em silêncio, inclusive para visitantes que aceitariam a publicidade. Quem ler
com pressa e for direto à instrução abaixo, sem conferir a ordem, desliga as
tags de propósito. A sequência correta:

1. Mergear e fazer deploy do PR do código de consentimento.
2. Confirmar em produção que o Consent Mode está emitindo `ad_storage` e que
   o banner de cookies funciona.
3. Só então marcar a checagem de consentimento (`ad_storage`) nas quatro
   tags `Meta - *` e nas do Google Ads, como descrito abaixo.

⏱️ **O passo 3 é para fazer logo depois do 2, não na semana seguinte.** Entre
o deploy e o passo 3 existe uma janela em que a página de privacidade já
promete que sem consentimento a Meta não usa os dados para publicidade, e o
pixel ainda dispara. As tags do Google não têm essa janela: sendo nativas,
elas já obedecem o `ad_storage` negado no instante do deploy.

Em cada uma das quatro tags `Meta - *`: abrir o editor da tag →
Configurações avançadas → Configurações de consentimento → marcar "Exigir
consentimento adicional para disparo desta tag" → adicionar `ad_storage`.
Sem isso, o pixel dispara mesmo quando o visitante clica em "Recusar anúncios".

`Google Ads - remarketing` (e a tag de conversão, quando existir) recebe a
mesma checagem, mas não silencia por completo. Marque "Exigir consentimento
adicional para disparo desta tag" → `ad_storage` nelas também, igual às
quatro da Meta. Isso reduz o disparo — a tag deixa de rodar quando o
consentimento é negado, dentro do GTM. Mas por desenho do próprio Consent
Mode, o `gtag` do Google Ads envia, à parte do GTM, um ping sem cookie para
modelagem de conversão mesmo com `ad_storage` negado. Não existe checagem que
feche essa porta — é comportamento do Google, não do contêiner.

Sem o passo 3, a página de privacidade — que diz que sem consentimento a Meta
e o Google Ads não gravam cookies nem usam os dados para publicidade —
descreve uma promessa que a configuração do contêiner ainda não cumpre para o
pixel da Meta. Para o Google Ads, mesmo com o passo 3 feito, o ping sem
cookie da modelagem de conversão continua: a página não promete o contrário,
porque fala em não gravar cookie e não usar dado para publicidade, não em não
emitir nenhum sinal.

## Pendências

- **Separação por página real, não só por página de entrada.** Hoje
  `GA4 - configuração LP` produz um `page_view` por sessão, com `page_type`
  da página em que o visitante chegou, congelado pelo resto da visita — a
  navegação entre `/`, `/planos`, `/blog`, `/diagnostico` e
  `/calculadora-cmv` troca de rota via `next/link`, sem recarregar o
  documento, e nem o gatilho de visualização de página nem o script que
  empurra `page_type` reexecutam nessa troca. Medir página a página
  exigiria um gatilho de **History Change** no contêiner, mais um push de
  `page_type` na troca de rota (fora do escopo desta entrega).
