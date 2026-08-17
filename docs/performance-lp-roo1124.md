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
