# Performance da LP no celular — diagnóstico e correções (ROO-1124)

> Medições feitas em 17/08/2026 contra **produção** (`www.rook.com.br`), com
> Chrome headless em viewport de 390×844, DPR 3 e User-Agent de Android.
> Todo número neste documento foi medido; nenhum foi estimado.
> A parte de **indexação** da issue (canonical, sitemap, robots) é da ROO-1125 e
> não foi tocada aqui — exceto por um achado que está registrado no fim, para
> quem estiver naquela issue.

---

## 1. O ponto de partida

PageSpeed Insights, mobile, home:

| Métrica | Valor |
|---|---|
| Score | 60 |
| FCP | 3,0 s |
| LCP | 7,6 s |
| TBT | 410 ms |

Oportunidades apontadas: cache, JavaScript legado, solicitações que bloqueiam
renderização, entrega de imagens.

O PageSpeed simula uma rede de celular ruim (≈1,6 Mbit/s, 150 ms de latência) e
um processador 4× mais lento. A medição local não tem esse freio, então os
tempos absolutos abaixo são muito menores — servem para descobrir **o que** a
página faz, não **quanto tempo** ela leva no celular de quem visita.

Medido localmente, sem freio de rede:

| | |
|---|---|
| Requisições totais | 43 |
| Requisições para terceiros | 17, em **12 hosts distintos** |
| HTML | 19,7 KB comprimido (149 KB descomprimido) |
| CSS | 7,5 KB comprimido (32,4 KB descomprimido) |
| JS da home (First Load) | 100 KB |
| TTFB / FCP / LCP / load | 192 / 328 / 328 / 392 ms |
| **Elemento do LCP** | um `<p>` — **texto**, não imagem |

Dois fatos dessa tabela mudam a leitura da issue:

1. **O LCP é texto.** É o parágrafo do hero ("Num setor que movimenta R$ 495
   bilhões…"). Otimizar imagem, sozinho, não move o LCP — imagem nenhuma é o
   elemento maior da primeira tela. O que atrasa esse parágrafo é o que disputa
   a rede e a linha principal com ele.
2. **O JavaScript próprio não é o problema.** 100 KB na home é pequeno. O
   `polyfills-*.js` que o Next gera sai com `noModule`, então o Chrome moderno
   nem baixa — confirmado: ele não aparece no registro de rede. O "JavaScript
   legado" que o PageSpeed aponta vem do código de terceiro (fbevents.js,
   clarity, gtag), que não é nosso para reescrever, só para adiar.

---

## 2. Os achados

### 2.1 — As fontes do site nunca carregaram

`src/app/globals.css` tinha, na linha 5:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Manrope:...&family=JetBrains+Mono:...');
```

O `@import` está **depois** das diretivas `@tailwind`. O Tailwind expande essas
diretivas no lugar, então no CSS publicado o `@import` termina no **byte 27.445
de 32.436** — depois de milhares de regras. A especificação do CSS manda o
navegador ignorar `@import` que não venha antes de qualquer regra.

Verificado no Chrome: **zero requisições** a `fonts.googleapis.com` e a
`fonts.gstatic.com`; `document.fonts` vazio. Manrope e JetBrains Mono nunca
chegaram a nenhum visitante. O site sempre renderizou na fonte do sistema.

Não é achado de performance — é achado de design que apareceu enquanto se
media performance. Está tratado na seção 4.

### 2.2 — O pixel do Meta era pré-carregado como imagem, na frente do CSS

A primeira tag do `<head>` em produção era:

```html
<link rel="preload" as="image" href="https://www.facebook.com/tr?id=...&noscript=1">
```

Antes da folha de estilo. O componente `MetaPixel` escrevia o pixel de fallback
como `<img>` de JSX dentro de `<noscript>`; o varredor de preload do Next
enxergava a imagem e a promovia para o topo do `<head>`.

Efeito: o celular abria conexão com o `facebook.com` (DNS + TCP + TLS, três
idas e voltas — ≈450 ms na rede que o PageSpeed simula) **na frente** do CSS que
pinta a tela, para buscar um pixel que só faz sentido quando o JavaScript está
desligado.

Efeito colateral, confirmado no registro de rede: com JavaScript ligado o
PageView do Meta disparava **duas vezes** — uma pelo preload do pixel, outra
pelo `fbq('track','PageView')`. Toda visita era contada em dobro no Meta.

### 2.3 — Doze hosts de terceiro na primeira tela

Hosts de terceiro tocados ao abrir a home:

| Origem | Hosts |
|---|---|
| Microsoft Clarity | `www.clarity.ms`, `scripts.clarity.ms`, `c.clarity.ms`, `i.clarity.ms` |
| Google | `www.googletagmanager.com`, `www.google.com.br`, `stats.g.doubleclick.net`, `ad.doubleclick.net` |
| Meta | `www.facebook.com`, `connect.facebook.net` |
| Microsoft Ads | `c.bing.com` |
| Cloudflare | `static.cloudflareinsights.com` |

Todas as tags estavam em `afterInteractive`, que carrega assim que a página
hidrata — ou seja, disputando a linha principal enquanto o celular ainda está
pintando a primeira tela. É de onde vem a maior parte do TBT de 410 ms.

### 2.4 — Imagens entregues no tamanho do arquivo original

`next.config.mjs` tem `images: { unoptimized: true }` — necessário porque a
imagem de homologação roda em k3s sem o otimizador do Next. Com ele,
`next/image` vira um `<img>` simples: **o arquivo vai para o celular exatamente
como está em `public/`**. Não há conversão de formato, não há redimensionamento,
não há `srcset`.

O que isso custava, medido:

| Arquivo | Dimensão real | Onde aparece | Tamanho na tela | Peso |
|---|---|---|---|---|
| `brand/rook-logo-horizontal-light.png` | 1961×664 | topo de toda página | 118×40 | 38.050 B |
| `brand/rook-icon.png` | 688×710 | núcleo do diagrama | ≈33×34 no celular | 48.224 B |
| `brand/rook-icon-branco.png` | 687×710 | mesma posição, tema escuro | escondido no tema claro | 9.997 B |
| `partners/cardapio-web.png` | 810×525 | faixa de parceiros | máx. 116×36 | 88.789 B |
| `partners/saipos.svg` | vetor | faixa de parceiros | máx. 116×36 | 22.675 B |

O logo do topo é o caso mais claro: um arquivo 16× mais largo que o espaço em
que ele é desenhado, baixado a cada visita.

Detalhe que não é óbvio: as duas artes do núcleo do diagrama (clara e escura)
são `<image>` dentro de um SVG, e `<image>` de SVG **baixa sempre as duas**. O
`display:none` do tema esconde uma, não impede o download.

### 2.5 — Nada em `public/` tinha cache

Medido em produção, para todos os arquivos de `public/`:

```
cache-control: public, max-age=0, must-revalidate
```

O que o Next gera (`/_next/static/*`) já vem com `immutable` de um ano, porque o
nome do arquivo carrega o hash do conteúdo. `public/` não passa por isso e
herdava o padrão. Resultado: logo, ícone da marca, logos de parceiro e favicons
voltavam a ser revalidados a cada visita, mesmo já estando na máquina de quem
visitou ontem. É a oportunidade "cache" do PageSpeed.

---

## 3. O que foi corrigido nesta entrega

### 3.1 — Artes reduzidas ao tamanho de tela, em WebP

Os `.png` originais **continuam em `public/`** como fonte para gerar outros
tamanhos no futuro. O que o navegador baixa agora é o `.webp`.

| Arquivo | Dimensão nova | Antes | Depois | Diferença |
|---|---|---:|---:|---:|
| `brand/rook-logo-horizontal-light` | 360×122 | 38.050 B | 9.846 B | −74,1% |
| `brand/rook-logo-horizontal` (tema escuro) | 368×120 | 31.660 B | 5.234 B | −83,5% |
| `brand/rook-icon` | 192×198 | 48.224 B | 4.938 B | −89,8% |
| `brand/rook-icon-branco` | 192×198 | 9.997 B | 2.154 B | −78,5% |
| `partners/cardapio-web` | 240×156 | 88.789 B | 13.764 B | −84,5% |
| `partners/ifood` | 120×120 | 5.880 B | 2.872 B | −51,2% |
| `partners/stone` | 152×44 | 3.152 B | 1.742 B | −44,7% |
| `partners/saipos.svg` (comprimido) | vetor | 10.910 B | 5.078 B | −53,5% |
| `partners/conta-azul.svg` (comprimido) | vetor | 2.417 B | 1.243 B | −48,6% |

`partners/omie.png` (1.005 B) ficou em PNG: em WebP o arquivo ficou **maior**.
Ninguém troca formato por doutrina.

Os SVG estão medidos comprimidos porque é texto e a rede comprime; os demais
estão medidos crus porque já são formatos comprimidos e a rede não os reduz.

Somando o que a home baixa:

- **Primeira tela** (logo do topo + as duas artes do diagrama): 96.271 B →
  16.938 B, **−79.333 B (−82,4%)**
- **Faixa de parceiros**, que carrega depois: 112.153 B → 25.704 B, **−86.449 B**
- **Total da home: 208.424 B → 42.642 B, −165.782 B (−79,5%)**

Os dois SVG passaram por minificação de precisão (`svgo --precision=2`). A
diferença foi conferida rasterizando as duas versões a 4× o tamanho de tela e
comparando pixel a pixel: as diferenças são de antisserrilhado nas bordas, e as
duas artes são indistinguíveis a olho. Nenhum logo de parceiro foi recolorido
nem teve filtro aplicado — a regra do `LpPartners` continua valendo.

### 3.2 — Cache de 30 dias para os arquivos estáticos de `public/`

Em `next.config.mjs`, via `headers()`: `/brand/*`, `/partners/*`, favicons,
manifesto e as artes de compartilhamento passam a sair com

```
Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```

**Por que 30 dias e não um ano:** o nome do arquivo em `public/` não carrega
hash do conteúdo. Com um ano, trocar uma arte mantendo o nome deixaria a arte
velha na máquina de quem já visitou por até um ano, sem jeito prático de forçar
a atualização. Trinta dias captura quase todo o ganho de cache e limita o
estrago. **Se precisar que uma arte nova apareça na hora, troque também o nome
do arquivo.**

O `X-Robots-Tag: noindex, nofollow` de homologação (ROO-1102) continua
funcionando — conferido no `routes-manifest.json` de um build com
`NEXT_PUBLIC_ENV=homolog`: as quatro regras de cache **mais** a de noindex.

### 3.3 — O pixel `<noscript>` do Meta deixou de virar preload

`MetaPixel` agora escreve o pixel de fallback como HTML cru
(`dangerouslySetInnerHTML`). O React não cria o elemento, então o varredor de
preload do Next não tem o que encontrar.

Conferido em build local com o pixel configurado: o `<head>` não cita mais o
`facebook.com`, e o `<noscript>` continua no corpo da página, intacto, para
quem navega sem JavaScript. O PageView em dobro também acaba.

### 3.4 — Microsoft Clarity passou para `lazyOnload`

De `afterInteractive` para `lazyOnload`: o Clarity só carrega depois do `load`,
com a página já na tela. Ele sozinho responde por 4 dos 12 hosts de terceiro.

**O que se perde:** o primeiro segundo da gravação de sessão e do mapa de calor.
**O que não se perde:** nada de conversão. Clarity é ferramenta de observação de
comportamento, não pixel de anúncio.

Por isso Google Analytics, Google Ads e Meta Pixel **continuam** em
`afterInteractive`: atribuição de campanha não pode chegar atrasada, e essa
troca teria custo comercial, não só técnico.

### 3.5 — Capa do artigo do blog com prioridade alta

Em `/blog/[slug]`, a capa é o maior elemento da primeira tela — é ela que define
o LCP daquela página. Ganhou `fetchPriority="high"` e `decoding="async"`. O
espaço já era reservado pelo `aspect-[3/2]`, então nada se desloca.

### 3.6 — A linha morta de `@import` saiu do CSS

Removida, com o motivo escrito no lugar dela. Não muda nada na tela: o navegador
já a ignorava. Muda o próximo desenvolvedor, que agora encontra a explicação
antes de "consertar" do jeito errado (ver 4.1).

---

## 4. O que NÃO foi feito, e por quê

### 4.1 — Trazer Manrope e JetBrains Mono de volta, via `next/font/google`

**Não é decisão de performance, é decisão de design.** O site inteiro renderiza
hoje em `system-ui`, e sempre renderizou. Ligar as fontes muda a aparência de
todas as páginas — inclusive das que já foram aprovadas assim.

Se a decisão for ligar, o caminho é **`next/font/google`**, nunca mover o
`@import` para o topo do CSS. A diferença:

| Caminho | O que acontece no celular |
|---|---|
| `@import` no topo do CSS | HTML → CSS → CSS do Google → arquivo da fonte. Dois hosts de terceiro novos (`fonts.googleapis.com` e `fonts.gstatic.com`) no caminho crítico da primeira pintura. **Piora o LCP.** |
| `next/font/google` | A fonte é baixada no build e servida do nosso domínio, com `preload` e `@font-face` embutido no CSS que já é baixado. Host novo: nenhum. |

Há uma guarda em `tests/performance-lp.test.mjs` que reprova qualquer `@import`
de fonte no CSS, justamente para esse "conserto" não passar despercebido.

### 4.2 — Ligar o otimizador de imagem do Next

`images: { unoptimized: true }` poderia virar
`unoptimized: process.env.NEXT_PUBLIC_ENV === 'homolog'` — na Vercel o
otimizador funciona e geraria `srcset` e AVIF sozinho. Não foi feito porque
homologação passaria a se comportar diferente de produção exatamente no ponto
que a issue quer medir, e homologação existe para conferir produção. As artes
pré-reduzidas desta entrega dão quase o mesmo ganho sem esse preço.

### 4.3 — O redirecionamento de `rook.com.br` para `www.rook.com.br`

Medido: `https://rook.com.br/` responde **308** e manda para
`https://www.rook.com.br/`. Todo visitante que digita o domínio paga uma ida e
volta extra, mais a abertura de conexão com um host diferente — na rede que o
PageSpeed simula, algo entre 300 ms e 600 ms antes de o HTML sequer começar.

Não é código: é configuração de domínio na Vercel/Cloudflare. Resolver significa
escolher **um** host oficial e servir direto nele.

> **Para quem estiver na ROO-1125:** a tag `<link rel="canonical">` da home
> aponta para `https://rook.com.br/` (o apex), mas a página é servida em
> `https://www.rook.com.br/`. O canonical aponta para uma URL que redireciona.
> Isso é da ROO-1125, não foi tocado aqui.

### 4.4 — Reduzir o HTML da home

O HTML da home tem 149 KB descomprimido (19,7 KB na rede). Boa parte é a faixa
de parceiros, que repete a lista três vezes para o laço do marquee não abrir
buraco. Dá para gerar as cópias por CSS em vez de por HTML, mas é mexer no
layout aprovado por ganho de poucos KB comprimidos. Fica registrado, não feito.

### 4.5 — Reduzir o número de tags de medição

Hoje são quatro (GA, Google Ads, Meta, Clarity) mais o Vercel Analytics. Cada
uma custa hosts e linha principal. Reduzir é decisão de marketing, não de
engenharia.

---

## 5. O que só o PageSpeed em produção confirma

Nada aqui foi medido com o freio de rede e de processador que o PageSpeed usa.
Então, com honestidade:

- **Espera-se ganho firme em "entrega de imagens" e em "cache"** — são bytes e
  cabeçalhos, medidos, e não dependem de simulação.
- **Espera-se ganho em TBT** pelo adiamento do Clarity, e em FCP pela remoção do
  preload do `facebook.com` na frente do CSS. O tamanho do ganho não dá para
  afirmar sem rodar o PageSpeed de novo.
- **O LCP de 7,6 s continua sem explicação completa.** O elemento é texto, o CSS
  tem 7,5 KB e o HTML 19,7 KB. Nenhuma dessas correções ataca uma causa
  identificada de 7,6 s. As suspeitas na ordem: o redirecionamento do apex
  (4.3), a disputa de linha principal com as tags de terceiro, e a variação do
  próprio PageSpeed. **Rodar o PageSpeed de novo depois do deploy é parte de
  fechar esta issue**, não formalidade.

---

## 6. Como refazer as artes

As artes foram geradas com `sharp` e `svgo` fora do projeto — nenhuma das duas
entrou como dependência, porque isso é tarefa de quando a arte muda, não de todo
build. A partir dos `.png` originais, que continuam em `public/`:

```bash
npx --yes sharp-cli -i public/brand/rook-logo-horizontal-light.png \
  -o public/brand/ resize 360 -- --format webp --quality 88
# larguras usadas: logo claro 360, logo escuro 368, ícones 192,
# cardapio-web 240, ifood 120, stone 152 (sem ampliar)

npx --yes svgo@3 -i public/partners/saipos.svg -o public/partners/saipos.svg \
  --precision=2 --multipass
```

A largura de cada arte é ~3× o tamanho em que ela aparece na tela, para cobrir
celular de tela densa. Qualidade 88 no WebP: abaixo disso começam a aparecer
artefatos nas bordas do logotipo.

---

## 7. As guardas

`tests/performance-lp.test.mjs` (roda com `pnpm test`). Elas leem o
código-fonte, e não o build: o que se protege é a decisão escrita no arquivo, e
ela precisa quebrar no momento em que é desfeita, não no deploy.

| Guarda | O que impede |
|---|---|
| `beforeInteractive` | tag de terceiro bloqueando a renderização |
| Clarity em `lazyOnload` | o Clarity voltar para a frente da fila |
| `<noscript>` do Meta | o pixel voltar a virar preload no `<head>` |
| cache em `next.config` | as regras de `Cache-Control` sumirem numa refatoração |
| arte acima de 20 KB | um PNG gigante voltar para dentro da marca |
| `@import` de fonte | o "conserto" errado da seção 4.1 |

Cinco das seis foram conferidas reprovando contra o código anterior a esta
entrega. A do `beforeInteractive` já passava — existe para o futuro, não para o
passado.

---

## 8. Segunda rodada — 21/08/2026: o LCP explicado e atacado

A seção 5 fechou com "o LCP de 7,6 s continua sem explicação completa". Esta
rodada explicou. Medições com Lighthouse 12 mobile (`--throttling-method=simulate`,
Chrome headless local) contra **produção**, nos dois hosts, antes e depois:

| Entrada | Score | FCP | LCP |
|---|---:|---:|---:|
| `rook.com.br` — antes | 90 | 2,8 s | 3,0 s |
| `rook.com.br` — depois | **93** | 2,6 s | **2,6 s** |
| `www.rook.com.br` — antes | 93 | 2,0 s | 2,1 s |
| `www.rook.com.br` — depois | **98** | 1,8 s | **2,0 s** |

O elemento do LCP continua sendo **texto** (o parágrafo do hero), com
`Load Delay` e `Load Time` em **zero**. Vale repetir porque é contraintuitivo e
custa tempo de quem chega nesta issue depois: **nenhum trabalho de imagem move
este LCP.** Ele é feito só de TTFB + render delay.

E o render delay, decomposto, não era CSS nem JavaScript nosso. Eram três coisas
que não estão em lugar nenhum deste repositório.

### 8.1 — O 308 do apex era respondido pela Vercel, na Virgínia

`https://rook.com.br/` respondia 308 com `x-vercel-id: iad1::…`. Ou seja: o
visitante em São Paulo abria conexão, atravessava até a Virgínia e voltava —
**só para ser informado de que o endereço certo tem `www`**. Conferido: o
ruleset `http_request_dynamic_redirect` da zona estava vazio, e os dois
registros (`rook.com.br` A proxiado, `www` CNAME proxiado) apontam para a Vercel.

Feito: uma **Redirect Rule do Cloudflare** passou a responder o 308 — agora 301
— na borda, sem tocar a origem.

```
expressão: http.host eq "rook.com.br"
           and not starts_with(http.request.uri.path, "/.well-known/")
ação:      redirect 301 → concat("https://www.rook.com.br", http.request.uri)
```

`http.request.uri` já carrega caminho **e** query string, então não há
`preserve_query_string` nem ramificação. Conferido: `rook.com.br/planos/?utm=x`
→ `301` para `https://www.rook.com.br/planos/?utm=x`, resposta **sem**
`x-vercel-id`.

**A exclusão de `/.well-known/` não é zelo decorativo.** A Vercel emite
certificado do apex por desafio HTTP em `/.well-known/acme-challenge/`. Sem essa
cláusula, o redirect engoliria o desafio e a renovação do certificado falharia —
em algum dia daqui a três meses, sem relação aparente com performance.

O redirecionamento da Vercel continua configurado e nunca mais é atingido. É
fallback, não redundância a limpar.

**O que isso NÃO resolve, e é importante:** o Lighthouse ainda cobra **760 ms**
de `redirects` (era 890 ms). O ganho foi só de 130 ms porque o modelo de rede
simulada cobra sobretudo a **abertura da segunda conexão** — DNS, TCP e TLS para
um host diferente — e não a ida à origem. No mundo real o ganho é maior do que o
modelo mostra, porque o RTT até `iad1` é real e o do simulador é fixo. Mas o
score do PageSpeed é o modelo. **Zerar esses 760 ms exige não redirecionar**, ou
seja escolher UM host oficial e servir direto nele — a decisão que a seção 4.3
registrou e que continua aberta. Ela é de produto e de SEO (a canonical é `www`
desde a ROO-1125, que consertou 13 páginas não indexadas), não de engenharia.

### 8.2 — O Cloudflare injetava um script síncrono para esconder o e-mail

O maior item isolado do render delay, e o mais invisível: **479 ms de
render-blocking** vindos de

```
https://www.rook.com.br/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js
```

Prioridade `High`, síncrono, **na frente da primeira pintura** — mais caro que a
folha de estilo inteira do site (170 ms). Ninguém escreveu essa tag: é o
**Email Address Obfuscation** do Cloudflare (`email_obfuscation: on` na zona).
Ele varre o HTML, acha `contato@rook.com.br` — que aparece no Footer, no LpFaq e
no LpPartners — troca por `<span data-cfemail>` e injeta o decodificador para
desfazer isso no navegador de quem visita.

Feito: `email_obfuscation` → **`off`**.

O que se perde: proteção contra scraper de e-mail. Que era simbólica — o mesmo
endereço está em `mailto:` em seis lugares do site, e `mailto:` o Cloudflare não
obfusca. Trocávamos meio segundo de LCP de todo visitante por um obstáculo que
qualquer scraper com uma regex vence.

Conferido depois: zero ocorrências de `email-decode` e de `__cf_email__` no HTML
servido, e os seis `mailto:contato@rook.com.br` intactos. O Lighthouse passou a
reportar **nenhum** recurso render-blocking nos dois hosts — sem o script, o CSS
de 8,2 KB sozinho fica abaixo do limiar.

### 8.3 — O HTML nunca era cacheado na borda

Toda resposta de página vinha com:

```
cache-control: public, max-age=0, must-revalidate
cf-cache-status: DYNAMIC
x-vercel-cache: HIT          ← já era prerender estático
age: 320885                  ← parado há 3,7 dias sem mudar
x-vercel-id: iad1::…
```

Um prerender estático, imutável entre deploys, fazendo round trip até a Virgínia
**a cada visita**. `cache_level` da zona está em `aggressive`, mas isso não
cacheia HTML: o Cloudflare ignora documento HTML no cache padrão
independentemente de cabeçalho.

Feito: uma **Cache Rule**.

```
expressão: ends_with(http.request.uri.path, "/")
           and not starts_with(http.request.uri.path, "/api/")
ação:      cache: true
           edge_ttl:    override_origin, 300 s
           browser_ttl: respect_origin
```

**Por que a barra final e não uma lista de rotas:** `trailingSlash: true` está no
`next.config.mjs`, então toda URL de *página* termina em `/` e nenhum *arquivo*
termina em `/`. Uma expressão distingue os dois sem enumerar rota nenhuma, e
rota nova entra sozinha. O preço é um acoplamento com o `next.config.mjs` que
mora no painel do Cloudflare e não no código — está travado por
`tests/performance-lp.test.mjs`, que é o único lugar do repositório onde essa
dependência existe escrita.

**`override_origin` é o ponto do exercício:** ele ignora o
`max-age=0, must-revalidate` que a Vercel emite. Sem isso a regra não faria nada.
`browser_ttl: respect_origin` mantém o navegador revalidando a cada navegação —
mas essa revalidação agora morre na borda de São Paulo, não em `iad1`.

**⚠️ CONSEQUÊNCIA OPERACIONAL: um deploy leva até 5 minutos para aparecer.** É o
preço dos 300 s de `edge_ttl`, e foi escolhido em vez de purge no deploy porque
5 minutos captura praticamente todo o ganho de cache (a home recebe visita
contínua) sem acoplar o pipeline de deploy a um token do Cloudflare. Se um dia
precisar aparecer na hora: purgue a URL no painel, ou baixe o TTL.

Conferido: `cf-cache-status` foi de `MISS`, `MISS` para `HIT` na terceira
requisição, e depois `HIT` em 10 de 10. TTFB real medido em 10 amostras caiu
para **76–84 ms** nos acertos de borda com conexão quente, contra 350–520 ms
antes — faixa que simplesmente não existia.

**O Lighthouse quase não credita isso**, e é bom saber antes de comparar scores:
o `timeToFirstByte` do modo `simulate` usa um RTT simulado fixo, então continua
marcando ~600 ms. O que melhorou de verdade aparece no observado — FCP
observado 384 ms → **270 ms**. Quem ganha é o visitante brasileiro, não a
planilha.

### 8.4 — O que foi medido e deliberadamente NÃO feito

**Reduzir o HTML da home.** Medido: 148.064 B crus, 19.036 B em brotli na rede.
**90.943 B — 61% do arquivo — são `<script>` inline**: o payload de flight do
RSC, a árvore React serializada que o App Router manda junto com o HTML para
hidratar. Encolher isso significa mexer nas fronteiras cliente/servidor de todos
os componentes da LP. Contra 19 KB comprimidos no fio, o ganho simulado é da
ordem de 50 ms. **Não vale o risco de reestruturar a página aprovada por 50 ms.**
Fica medido aqui para ninguém precisar medir de novo antes de recusar.

**Inline do CSS crítico.** Depois de 8.2 o Lighthouse não reporta mais recurso
render-blocking nenhum. Não há o que consertar.

**`content-visibility: auto` nas seções abaixo da dobra.** A página tem 10.017 px
de altura e 604 elementos, e `Style & Layout` + `Rendering` somam ~900 ms de
linha principal. Tentador — e desnecessário: o TBT está em **30 ms** e o CLS em
**0**. Não se otimiza o que já pontua 1.

### 8.5 — Onde isto mora agora

Três das quatro mudanças desta rodada **não estão neste repositório**. Ficam
registradas aqui porque é o único lugar onde alguém as vai procurar:

| Mudança | Onde | Objeto |
|---|---|---|
| `email_obfuscation: off` | zona `rook.com.br` (`fbe6a7d3736d749d6783dbbe15643f01`) | setting |
| Redirect do apex na borda | mesma zona | ruleset `http_request_dynamic_redirect` |
| Cache do HTML na borda | mesma zona | ruleset `http_request_cache_settings` |
| Guarda do `trailingSlash` | este repositório | `tests/performance-lp.test.mjs` |

Nenhum teste de código consegue ver as três primeiras. Se um dia o LCP piorar de
novo sem que ninguém tenha mexido no código, **é aqui que se olha primeiro** —
essas três configurações são as candidatas, nesta ordem.

---

## 9. A decisão do host oficial — `www.rook.com.br` (21/08/2026)

Decidido com o Daniel: **`www.rook.com.br` é o host oficial**, e o objetivo é que
ninguém passe pelo apex. Esta seção fecha o item que a 4.3 e a 8.1 deixaram
aberto.

### 9.1 — Quanto o apex custa, medido de verdade

O Lighthouse cobra 760 ms de `redirects`, mas é modelo. O número real, medido com
Navigation Timing em contexto novo do Chrome, mediana de 6 amostras cada:

| Entrada | TTFB | responseEnd |
|---|---:|---:|
| `https://rook.com.br/` | 364 ms | 393 ms |
| `https://www.rook.com.br/` | **84 ms** | **132 ms** |

**~280 ms de TTFB real**, por visita que entra pelo apex. (O `redirectEnd -
redirectStart` do Navigation Timing dá 0 porque o salto é entre origens
diferentes e a API o esconde; o custo aparece dentro do TTFB.)

O detalhe de conexão, capturado pelo CDP, mostra por que é tão caro:

```
301 https://rook.com.br/      → ip=172.66.171.27  h2  reused=false
200 https://www.rook.com.br/  → ip=104.20.29.107  h3  reused=false
```

**IP diferente e protocolo diferente.** O Cloudflare publica dois endereços
anycast; o Chrome resolve o segundo hostname por conta própria, cai no outro
endereço e negocia QUIC do zero. Não é um salto de HTTP — são duas conexões TLS
completas.

### 9.2 — A hipótese do certificado, e por que foi descartada

Vale registrar porque é convincente e está errada.

O apex serve um certificado que **não cobre** `www.rook.com.br`:

| Pacote | Tipo | Hosts |
|---|---|---|
| `b0fcbf2c…` | advanced | `rook.com.br`, `timebox.rook.com.br`, `*.timebox.rook.com.br` |
| `dc74ffcf…` | universal | `rook.com.br`, `*.rook.com.br` |

O pacote *advanced* — criado em 20/08/2026 para o `timebox`, incluindo o apex na
lista — ganha para o SNI do apex. Então quem entra pelo apex recebe um
certificado sem `www` nas SANs, o que **impede** o *connection coalescing* do
Chrome (reaproveitar a conexão aberta para o segundo hostname). A correção
parecia óbvia: tirar `rook.com.br` do pacote advanced, o apex volta ao universal,
que cobre os dois, e o salto deixa de custar handshake.

**Testado antes de mexer.** Controle: a partir do `www` (cujo certificado cobre
`*.rook.com.br`, portanto cobre `timebox.rook.com.br`), buscar
`timebox.rook.com.br` — mesmo certificado, mesmo pool de IP. Resultado:

```
200 https://www.rook.com.br/       → ip=104.20.29.107  reused=true
200 https://timebox.rook.com.br/   → ip=172.66.171.27  reused=false
```

**Não reusou.** O coalescing exige que o IP resolvido seja o mesmo da conexão
aberta, e com dois registros A o Chrome cai no outro. Corrigir o certificado
tornaria o coalescing *possível*, não confiável — e não se mexe em TLS de
produção por um ganho que a medição não confirma. **Não foi feito, de propósito.**

(O pacote advanced incluir o apex ainda é desalinhado com a intenção de quem o
criou para o `timebox`. É arrumação de configuração, não de performance.)

### 9.3 — "Acabar com o redirect" é acabar com o TRÁFEGO nele

A regra do apex **não pode ser removida**: gente digita `rook.com.br`, existe
backlink e material impresso apontando para lá, e sem a regra isso viraria erro.
O que se elimina é o tráfego que passa por ela. Estado de cada frente:

| Frente | Estado |
|---|---|
| Vercel: `www` primário, apex redireciona | ✅ já era |
| Cloudflare: 301 do apex respondido na borda | ✅ feito em 8.1 |
| `canonical` de toda rota | ✅ ver 9.4 |
| `robots.txt` → `Sitemap:` com www | ✅ conferido em produção |
| `sitemap.xml`: 15 URLs, 1 host só | ✅ conferido |
| Código: nenhuma origem escrita fora de `site-origin.ts` | ✅ travado por `tests/canonical-origin.test.mjs` |
| **Destino dos anúncios (Google Ads, Meta)** | ⚠️ **fora deste repositório — pendente** |
| **Contêiner GTM** | ⚠️ **fora deste repositório — pendente** |
| **Propriedade primária no Search Console** | ⚠️ **fora deste repositório — pendente** |

As três pendências são a parte que ainda vale 280 ms por clique, e nenhuma delas
se resolve com deploy. **Se um anúncio pago aponta para `rook.com.br`, cada
clique comprado paga o salto** — é o item de maior valor que sobrou, e depende de
quem administra as plataformas de mídia (ver ROO-1117, que já trata do GTM).

**E a partir de agora o PageSpeed se mede em `https://www.rook.com.br/`.** O
número do apex é estruturalmente pior e sempre vai ser: ele inclui um salto que
o host oficial não tem. Medir o apex e tratar como nota do site é medir a coisa
errada — foi o que fez o relatório de abertura desta rodada marcar 80.

### 9.4 — Três páginas mandavam o Google desindexá-las

Achado enquanto se auditava "tudo que aponta para o apex" — e o problema não era
o apex, era interno. Medido em produção:

| Rota | `<link rel="canonical">` servido |
|---|---|
| `/termos/` | `https://www.rook.com.br/` ← a **home** |
| `/privacidade/` | `https://www.rook.com.br/` ← a **home** |
| `/sobre/` | `https://www.rook.com.br/` ← a **home** |

As três diziam ao Google que a URL oficial delas era a home. O Google obedece: a
página sai do índice. É o mesmo mecanismo da ROO-1125 (canonical apontando para
URL que não é a da página), com origem interna em vez de vir do www.

**A causa não era das três páginas.** `app/layout.tsx` declarava
`alternates: { canonical: siteUrl() }`, e metadata de layout é **herdada** por
toda página que não declara a sua. O valor global transformava esquecimento em
canonical errada, e a próxima rota criada herdaria igual.

Corrigido pela causa: o `alternates` saiu do layout raiz e foi para
`app/page.tsx`, junto da home. Sem valor global, página que esquecer a sua fica
**sem** canonical — e sem canonical o Google auto-referencia a própria URL, que é
o certo. Errar por omissão custa nada; errar apontando para outra página custa a
indexação. As três páginas ganharam a canonical própria.

Conferido no HTML do `next build`: as sete rotas verificadas saem
auto-referentes. A trava tem duas metades — o layout raiz não pode declarar
`alternates`, e toda `page.tsx` precisa de canonical própria ou de um `layout.tsx`
irmão que a declare — e **as duas foram conferidas reprovando** contra o estado
anterior.

Fora do escopo, para quem estiver na ROO-1125: `/restaurantes/` e `/setores/`
tinham o mesmo defeito, já corrigido em `homolog` e ainda não promovido a `main`.
Em produção, hoje, as duas continuam apontando para a home.
