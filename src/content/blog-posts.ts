import type { BlogPost } from "@/lib/blog-types";

export const localBlogPosts: BlogPost[] = [
  {
    id: "local-cmv-restaurantes-calculo",
    slug: "cmv-restaurantes-como-calcular",
    title: "O que é CMV em restaurantes e como calcular corretamente",
    subtitle: "A métrica que mostra quanto das vendas é consumido por insumos.",
    excerpt:
      "CMV é o percentual da receita que o restaurante gasta com mercadorias vendidas. Ele mostra se compras, perdas e precificação estão protegendo ou corroendo a margem.",
    directAnswer:
      "CMV em restaurantes é calculado dividindo o custo dos insumos vendidos pela receita líquida do período. Um restaurante que vende R$ 100 mil e consome R$ 34 mil em alimentos, bebidas e embalagens tem CMV de 34%.",
    contentMarkdown: `## Resumo para o dono de restaurante

CMV significa Custo da Mercadoria Vendida. No food service, ele responde a uma pergunta simples: de cada R$ 100 vendidos, quantos reais foram consumidos por ingredientes, bebidas, embalagens e itens diretamente ligados ao produto vendido?

Quando o CMV sobe, o restaurante pode até faturar bem, mas o lucro desaparece antes de chegar ao caixa. Por isso, o CMV deve ser acompanhado junto com vendas, impostos, despesas, folha, aluguel e resultado.

## Fórmula do CMV

A fórmula mais simples é:

| Indicador | Fórmula |
| --- | --- |
| CMV em R$ | Estoque inicial + compras - estoque final |
| CMV percentual | CMV em R$ / receita líquida |

Se você não tem estoque confiável, ainda dá para iniciar pelo controle de compras e pela receita líquida. Não é perfeito, mas é melhor do que decidir por sensação.

## Exemplo prático

Imagine um restaurante com:

- Receita bruta mensal: R$ 120.000
- Impostos e deduções estimadas: R$ 14.400
- Receita líquida: R$ 105.600
- Custo dos insumos vendidos: R$ 38.000

Nesse caso:

**CMV = R$ 38.000 / R$ 105.600 = 36,0%**

Esse número sozinho não diz tudo, mas acende uma pergunta: o restaurante está comprando caro, perdendo produto, vendendo com ficha técnica errada ou precificando mal?

## CMV baixo nem sempre significa lucro alto

Um erro comum é tratar CMV como única medida de saúde. Um restaurante pode ter CMV controlado e ainda perder dinheiro por causa de aluguel alto, folha pesada, imposto mal enquadrado ou dívidas caras.

Por isso, o Rook trata CMV como uma das seis casas do diagnóstico financeiro: vendas, compras, impostos, despesas, endividamento e resultado.

## Como o Rook usa esse indicador

O Rook organiza compras e vendas para mostrar o CMV em contexto. A leitura não para no percentual. O diagnóstico aponta fornecedores relevantes, categorias que pesam mais e oportunidades de decisão com impacto em reais.

> Nota metodológica: benchmarks por segmento devem ser publicados apenas quando houver amostra anônima suficiente. Antes disso, o mais seguro é usar o CMV como ferramenta de diagnóstico individual do restaurante.`,
    coverImageUrl: "/og-image-blog-template.png",
    coverImageAlt: "Diagnóstico financeiro do Rook para CMV em restaurantes",
    authorId: "rook-editorial",
    authorName: "Rook Editorial",
    authorRole: "Inteligência financeira para food service",
    category: "CMV e Compras",
    tags: ["cmv", "compras", "margem", "food service"],
    status: "published",
    primaryKeyword: "CMV restaurantes",
    seoTitle: "CMV em restaurantes: o que é e como calcular",
    seoDescription:
      "Entenda o que é CMV em restaurantes, como calcular corretamente e por que ele precisa ser analisado junto com margem, compras e DRE.",
    schemaFaq: [
      {
        question: "O que é CMV em restaurantes?",
        answer:
          "CMV é o custo da mercadoria vendida. Em restaurantes, representa quanto da receita líquida foi consumido por insumos, bebidas, embalagens e itens ligados ao produto vendido.",
      },
      {
        question: "Qual é a fórmula do CMV?",
        answer:
          "A fórmula clássica é estoque inicial mais compras menos estoque final. Para obter o percentual, divida o CMV em reais pela receita líquida do período.",
      },
    ],
    dataSources: [
      {
        title: "Metodologia Rook de diagnóstico financeiro",
        type: "methodology",
        note: "Estrutura editorial baseada nos seis pilares financeiros usados no produto Rook.",
      },
    ],
    methodologyNote:
      "Este artigo usa exemplo numérico didático. Benchmarks agregados devem ser publicados apenas com amostra anônima suficiente.",
    readingTimeMin: 5,
    publishedAt: "2026-06-11T09:00:00-03:00",
    createdAt: "2026-06-11T09:00:00-03:00",
    updatedAt: "2026-06-11T09:00:00-03:00",
  },
  {
    id: "local-reduzir-cmv-sem-cortar-qualidade",
    slug: "como-reduzir-cmv-sem-cortar-qualidade",
    title: "Como reduzir o CMV sem cortar qualidade: 7 alavancas práticas",
    subtitle: "Redução de custo boa não começa no prato do cliente. Começa na compra, ficha técnica e rotina.",
    excerpt:
      "Reduzir CMV sem cortar qualidade exige atacar desperdício, compras, ficha técnica, mix de vendas e negociação. Cortar ingrediente bom costuma ser a última alavanca, não a primeira.",
    directAnswer:
      "Para reduzir CMV sem cortar qualidade, comece por perdas, compras fora de curva, ficha técnica, porcionamento, fornecedores concentrados, mix de vendas e compras semanais. A qualidade cai quando o corte é feito no ingrediente antes do processo.",
    contentMarkdown: `## Resumo para o dono de restaurante

CMV alto não significa automaticamente que o restaurante precisa comprar ingrediente pior. Na maioria das operações, antes de mexer na qualidade, existem perdas invisíveis no processo.

O caminho mais seguro é procurar onde o dinheiro escapa sem gerar valor para o cliente.

## 1. Separe compra ruim de produto bom

Ingrediente bom pode estar caro por negociação ruim, compra em dia errado, pedido emergencial ou falta de comparação histórica. Antes de trocar o produto, entenda se você está pagando acima do seu próprio padrão.

## 2. Controle categorias, não apenas o total

CMV total ajuda, mas esconde o problema. Carnes, laticínios, bebidas, descartáveis e hortifruti se comportam de formas diferentes. Uma categoria pode estar saudável enquanto outra consome toda a margem.

## 3. Revise ficha técnica dos campeões de venda

Não adianta revisar 80 itens de uma vez. Comece pelos produtos mais vendidos. Se os itens de maior volume tiverem ficha errada, o impacto aparece todos os dias.

## 4. Olhe para perdas recorrentes

Perda por validade, preparo excessivo, erro de porcionamento e retrabalho não aparece como "desperdício" no extrato bancário. Aparece como CMV alto.

## 5. Negocie concentração de fornecedor

Fornecedor concentrado pode ser bom quando gera poder de barganha. Mas também pode virar dependência. Se um fornecedor representa grande parte do CMV, ele merece acompanhamento separado.

## 6. Compare preço pago com histórico

O melhor benchmark inicial é o próprio restaurante. Antes de comparar com o mercado inteiro, pergunte: por que paguei mais caro nesta semana do que no meu histórico recente?

## 7. Conecte CMV ao DRE

Reduzir CMV só importa se melhora resultado. Se a redução piora experiência, derruba venda ou aumenta retrabalho, a conta pode virar contra o restaurante.

## Exemplo de decisão

Um restaurante com R$ 100.000 de receita líquida e CMV de 38% gasta R$ 38.000 em insumos. Uma redução de 3 pontos percentuais representa R$ 3.000 por mês antes de considerar outros efeitos.

| Receita líquida | CMV atual | CMV alvo | Diferença mensal |
| --- | --- | --- | --- |
| R$ 100.000 | 38% | 35% | R$ 3.000 |

Esse é o tipo de decisão que precisa aparecer em reais, não apenas em percentual.`,
    coverImageUrl: "/og-image-blog-template.png",
    coverImageAlt: "Alavancas para reduzir CMV sem cortar qualidade",
    authorId: "rook-editorial",
    authorName: "Rook Editorial",
    authorRole: "Inteligência financeira para food service",
    category: "CMV e Compras",
    tags: ["cmv", "compras", "qualidade", "fornecedores"],
    status: "published",
    primaryKeyword: "reduzir CMV restaurante",
    seoTitle: "Como reduzir CMV sem cortar qualidade",
    seoDescription:
      "Veja 7 alavancas práticas para reduzir CMV em restaurantes sem sacrificar qualidade, experiência do cliente ou margem futura.",
    schemaFaq: [
      {
        question: "Dá para reduzir CMV sem piorar a qualidade?",
        answer:
          "Sim. Antes de trocar ingredientes, o restaurante deve atacar perdas, ficha técnica, porcionamento, compras fora de curva e concentração de fornecedores.",
      },
      {
        question: "Qual alavanca de CMV deve vir primeiro?",
        answer:
          "Normalmente, a primeira alavanca é entender categorias e produtos de maior impacto. Revisar os campeões de venda costuma gerar resultado mais rápido do que revisar todo o cardápio.",
      },
    ],
    dataSources: [
      {
        title: "Exemplo numérico didático",
        type: "example",
        note: "Valores simulados para demonstrar impacto financeiro de pontos percentuais de CMV.",
      },
    ],
    methodologyNote:
      "Os cálculos usam exemplos simples para tomada de decisão. Cada operação deve validar sazonalidade, regime tributário, cardápio e mix de vendas.",
    readingTimeMin: 6,
    publishedAt: "2026-06-11T10:00:00-03:00",
    createdAt: "2026-06-11T10:00:00-03:00",
    updatedAt: "2026-06-11T10:00:00-03:00",
  },
  {
    id: "local-dre-restaurantes-faturamento-lucro",
    slug: "dre-restaurantes-faturamento-lucro",
    title: "DRE para restaurantes: como saber se o faturamento virou lucro",
    subtitle: "Casa cheia e caixa movimentado não bastam. A DRE mostra o que realmente sobrou.",
    excerpt:
      "A DRE organiza receita, impostos, custos, despesas e resultado para mostrar se o restaurante está lucrando de verdade. Sem ela, faturamento alto pode mascarar margem baixa.",
    directAnswer:
      "DRE para restaurantes é o demonstrativo que transforma faturamento em leitura de lucro. Ela parte da receita, desconta impostos, CMV, despesas, folha, aluguel e outros custos até chegar ao resultado operacional.",
    contentMarkdown: `## Resumo para o dono de restaurante

Faturar não é lucrar. A frase parece simples, mas a maior parte das decisões ruins nasce exatamente dessa confusão.

A DRE ajuda o restaurante a sair do "o movimento foi bom" para "quanto sobrou depois de pagar o que precisa ser pago".

## O que entra em uma DRE de restaurante

Uma DRE bem organizada costuma separar:

| Bloco | O que responde |
| --- | --- |
| Receita | Quanto entrou em vendas |
| Impostos | Quanto saiu antes da margem operacional |
| CMV | Quanto os produtos vendidos consumiram |
| Despesas | Quanto custa manter a operação funcionando |
| Endividamento | Quanto o caixa suporta em parcelas e juros |
| Resultado | Quanto sobrou no fim |

## Por que olhar só o caixa engana

O caixa mostra movimento. A DRE mostra resultado. Um restaurante pode vender mais em um mês e lucrar menos se comprou caro, fez promoção sem margem, pagou imposto acima do necessário ou assumiu parcelas que apertam a operação.

## Exemplo simplificado

| Linha | Valor |
| --- | --- |
| Receita bruta | R$ 120.000 |
| Impostos e deduções | -R$ 14.400 |
| Receita líquida | R$ 105.600 |
| CMV | -R$ 38.000 |
| Despesas operacionais | -R$ 52.000 |
| Resultado antes de dívidas | R$ 15.600 |

Esse exemplo mostra um ponto importante: a pergunta não é apenas "quanto vendi?". A pergunta é "o que sobrou depois que a operação inteira passou pela mesa?".

## Como o Rook transforma DRE em decisão

O Rook organiza os pilares financeiros e traduz cada área em leitura prática. A ideia não é entregar uma planilha bonita. É mostrar onde a margem está vazando e qual decisão tem impacto financeiro.

## Quando revisar a DRE

O ideal é olhar mensalmente, mas com comparação histórica. Um mês isolado pode ter sazonalidade, evento, reforma, compra de estoque ou despesa não recorrente. A tendência é mais importante que o susto.`,
    coverImageUrl: "/og-image-blog-template.png",
    coverImageAlt: "DRE para restaurantes e diagnóstico financeiro do Rook",
    authorId: "rook-editorial",
    authorName: "Rook Editorial",
    authorRole: "Inteligência financeira para food service",
    category: "Gestão Financeira",
    tags: ["dre", "lucro", "faturamento", "gestão financeira"],
    status: "published",
    primaryKeyword: "DRE restaurante",
    seoTitle: "DRE para restaurantes: faturamento, margem e lucro",
    seoDescription:
      "Entenda como a DRE ajuda restaurantes a separar faturamento de lucro e acompanhar impostos, CMV, despesas e resultado.",
    schemaFaq: [
      {
        question: "Para que serve a DRE em restaurantes?",
        answer:
          "A DRE mostra se o faturamento virou lucro ao organizar receita, impostos, CMV, despesas e resultado em uma visão única.",
      },
      {
        question: "Com que frequência devo olhar a DRE?",
        answer:
          "O ideal é revisar a DRE mensalmente e comparar com meses anteriores para separar tendência de eventos pontuais.",
      },
    ],
    dataSources: [
      {
        title: "Estrutura de diagnóstico Rook",
        type: "methodology",
        note: "Modelo de leitura por pilares: vendas, compras, impostos, despesas, endividamento e resultado.",
      },
    ],
    methodologyNote:
      "Exemplo simplificado para educação financeira. A DRE real deve considerar particularidades contábeis, regime tributário e plano de contas da empresa.",
    readingTimeMin: 5,
    publishedAt: "2026-06-11T11:00:00-03:00",
    createdAt: "2026-06-11T11:00:00-03:00",
    updatedAt: "2026-06-11T11:00:00-03:00",
  },
];
