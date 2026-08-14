# Design v4 da landing page — decisões e armadilhas

Escrito em 14/08/2026, ao fim do redesenho (ROO-1103). Não é manual de estilo:
é o registro do que foi decidido e **por quê**, com ênfase no que parece errado
à primeira vista e não é. Quem for mexer aqui provavelmente vai querer
"corrigir" algumas destas coisas.

---

## Como a home foi escolhida

Três variações concorrentes foram construídas e comparadas no Claude Design:
editorial refinado, produto vivo e scroll cinematográfico. A escolha foi um
híbrido: **base "produto vivo"**, com o **funil das seis etapas** da variação
cinematográfica encaixado entre o hero e o manifesto.

O pacote com as três variações vive fora deste repositório, em
`rook-lp-variants`, e **está desatualizado** desde então — os números dos
gráficos foram corrigidos aqui e não lá. Se voltar a ser usado para iterar,
sincronizar antes.

---

## Regras de movimento

### 1. O estado final é o estado padrão

Nenhuma regra base deixa conteúdo em `opacity: 0` esperando gatilho. Só os
keyframes fazem isso, no `from`.

**Por quê:** com `animation-delay` e preenchimento `backwards`, o elemento fica
no estado `from` durante toda a espera. Na primeira versão, o quarto número do
setor ("62,7%") saía **invisível** nas capturas — e, na página real, ficaria
escondido por meio segundo. Numa página de conversão, conteúdo que depende de
gatilho para existir é conteúdo que às vezes não existe.

Por isso `lp-rise` anima **só deslocamento**, sem opacidade. Opacidade vale
para o que é decorativo (réguas, halos), onde não há informação a esconder.

### 2. A contagem dos números renderiza o valor final no HTML

`LpCountUp` é componente cliente, mas o valor correto já vai no HTML servido; o
JavaScript só assume depois de montar. Sem JS, com `prefers-reduced-motion`,
sem `IntersectionObserver` ou com o componente quebrado, o número certo está lá.

Verificado nos três modos, e não presumido.

### 3. Gráfico que se desenha usa cortina, não tracejado

`stroke-dasharray` é a técnica óbvia para "linha se desenhando" e **não
funciona aqui**. Com `vectorEffect="non-scaling-stroke"`, o navegador mede o
tracejado em pixels de tela, enquanto o caminho vive em unidades do viewBox
esticado por `preserveAspectRatio="none"`. Os dois nunca batem e o traço sai
**com buracos**. `pathLength` normalizado tem o mesmo sintoma.

A cortina (`clip-path: inset(...)`) é imune à escala e ainda revela linha e
área juntas. Vale para `.lp-spark` (hero) e `.lp-gap` (manifesto).

### 4. `prefers-reduced-motion` mostra tudo, não congela

A faixa de parceiros vira **grade estática com os sete logos**, em vez de parar
no meio escondendo metade. Toda a camada de movimento vive dentro de
`@media (prefers-reduced-motion: no-preference)`, então desligar é o padrão
seguro.

---

## Paleta e escopo

A paleta nasceu escopada só na home (`body:has([data-lp-home])`) e depois foi
promovida para `:root`/`.dark`, valendo no site inteiro.

Os `--lp-*` são espelho dos `--color-*`. Um nome só seria mais limpo; unificar
significaria reescrever seis componentes por estética, então ficam os dois, com
o espelho declarado num lugar só no `globals.css`.

**`heading-hero` é menor que a manchete da home** (4rem contra 5,2rem). Não é
descuido: a home diz "Faturar não é lucrar." e cabe em duas linhas; as outras
páginas têm frases inteiras, que no mesmo corpo viravam quatro linhas e
empurravam o conteúdo para fora da tela.

---

## Os números dos gráficos

Todos os gráficos do hero e o funil descrevem **o mesmo restaurante no mesmo
período**, derivados de `EXEMPLO_DRE` em `src/lib/lp-content.ts`:

| Linha | % | Valor |
|---|---|---|
| Receita | 100,0% | 412.800 |
| (−) Impostos | 9,0% | 37.152 |
| (−) CMV | 31,0% | 127.968 |
| (−) Despesas | 36,0% | 148.608 |
| (−) Dívidas | 9,0% | 37.152 |
| **(=) Resultado** | **15,0%** | **61.920** |

Nada é digitado à mão: os reais saem dos percentuais, o CMV calcula a própria
distância até a meta, a variação semanal é computada da série diária.

**Por que isso importa.** A primeira versão tinha o funil dizendo que despesas
consomem 36% e o DRE ao lado dizendo 50,2% — e o DRE **não tinha linha de
impostos**, na página que defende que o dinheiro passa por seis etapas e que
impostos são a segunda. Duas peças a poucos pixels contando histórias
diferentes sobre o mesmo dinheiro. Derivar de uma fonte é o que impede a
contradição de voltar no próximo ajuste.

Os valores foram validados por Daniel em 13/08/2026 como reconhecíveis para a
operação. **Seguem sendo exemplo, não dado de cliente.**

---

## Parceiros

Sete: Omie, Conta Azul (ERP), Saipos (PDV), iFood, Cardápio Web (delivery),
Stone, Rede (adquirentes). Levantados do código, não de memória.

**Aparecem sem rótulo de estágio, por decisão explícita do PO** — e isso inclui
Stone e Rede, em homologação com o parceiro, e Saipos, que nunca teve cliente
conectado (CLAUDE.md §15). O componente aceita um campo de estágio; acrescentar
o rótulo depois é uma linha.

**ReceitaNet BX foi pedido e não entrou:** no repositório é apenas
`docs/research/receitanetbx-viability.md`, cuja conclusão é "baixa prioridade
para a Fase 1". Não é integração.

**Pluggy não está na vitrine** embora Open Finance apareça como fonte no
diagrama e a integração seja madura (`lib/pluggy/`, sete rotas, um cron). É
decisão em aberto: expor o fornecedor ou não.

### Logos de terceiro

Nenhum é recolorido ou filtrado — quase todo manual de marca proíbe, e é o que
mantém o uso defensável. A **placa branca** atrás resolve o contraste no tema
escuro sem tocar na arte.

A Rede está em wordmark tipográfico porque `userede.com.br` responde 302 e não
entrega o arquivo. Colocar `public/partners/rede.svg` e preencher o campo
`logo` faz o logo aparecer sozinho.

### A faixa tem três trilhas, não duas

Cada trilha mede ~1.352px (7 placas de 176px + 6 vãos de 20px) e a animação
desloca uma trilha inteira, então o conteúdo precisa cobrir deslocamento +
largura da tela. Duas trilhas dão 2.724px, insuficiente para 1.920px. Três dão
4.096px.

O buraco só aparece em parte do ciclo — capturar num instante qualquer passa
limpo por sorte. Conferir forçando o relógio da animação em vários pontos.

---

## Marca

`rook-logo-horizontal-light.png` é a **colorida** (tema claro e todo dado
estruturado); `rook-logo-horizontal.png` é a **branca** (tema escuro).

Antes de 14/08/2026 os dois arquivos tinham o **mesmo md5** — o tema escuro
exibia o logo marrom desde sempre. Ninguém percebia porque a troca por
`dark:hidden` funcionava; só não havia o que trocar.

**Cuidado ao mexer:** `blog/[slug]/page.tsx` usa logo de publisher em JSON-LD.
Apontar para a versão branca faria o Google receber um logo invisível.

---

## Armadilhas de ambiente que custaram tempo

Nenhuma é sobre esta base de código, mas todas apareceram trabalhando nela.

- **O observador do Tailwind trava.** Depois de muitas edições seguidas no
  servidor de desenvolvimento, ele para de emitir classes **novas**, enquanto
  as que já existem em outros arquivos seguem funcionando. O sintoma é um grid
  que colapsa para uma coluna **sem erro nenhum**, e leva direto à conclusão
  errada de que o valor arbitrário do Tailwind é o problema. `rm -rf .next` e
  reiniciar.
- **`npm run build` apaga o `.next` embaixo do `next dev`.** A página passa a
  servir sem CSS e com todos os chunks em 404. Parece regressão de estilo e não
  é.
- **Duas instâncias na mesma porta.** A segunda não sobe, a primeira continua
  respondendo, e as capturas saem de código velho. Conferir a porta antes de
  confiar numa captura.

---

## Onde está o resto

- Ambiente de homologação e o fluxo de branches: `k8s/homolog/README.md`
- Por que o rastreamento é desligado em homologação: `src/lib/tracking.ts`
- Fallback do blog e sua lacuna de observabilidade: ROO-1116
