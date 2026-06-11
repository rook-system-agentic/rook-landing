import type { BlogPost } from "@/lib/blog-types";

export const localBlogPosts: BlogPost[] = [
  {
    id: "local-cmv-restaurantes-calculo",
    slug: "cmv-restaurantes-como-calcular",
    title: "O que e CMV em restaurantes e como calcular corretamente",
    subtitle: "A metrica que mostra quanto das vendas esta sendo consumido por insumos.",
    excerpt:
      "CMV e o percentual da receita que o restaurante gasta com mercadorias vendidas. Ele mostra se compras, perdas e precificacao estao protegendo ou corroendo a margem.",
    directAnswer:
      "CMV em restaurantes e calculado dividindo o custo dos insumos vendidos pela receita liquida do periodo. Um restaurante que vende R$ 100 mil e consome R$ 34 mil em alimentos, bebidas e embalagens tem CMV de 34%.",
    contentMarkdown: `## Resumo para o dono de restaurante

CMV significa Custo da Mercadoria Vendida. No food service, ele responde uma pergunta simples: de cada R$ 100 vendidos, quantos reais foram consumidos por ingredientes, bebidas, embalagens e itens diretamente ligados ao produto vendido?

Quando o CMV sobe, o restaurante pode ate faturar bem, mas o lucro desaparece antes de chegar ao caixa. Por isso o CMV deve ser acompanhado junto com vendas, impostos, despesas, folha, aluguel e resultado.

## Formula do CMV

A formula mais simples e:

| Indicador | Formula |
| --- | --- |
| CMV em R$ | Estoque inicial + compras - estoque final |
| CMV percentual | CMV em R$ / receita liquida |

Se voce nao tem estoque confiavel, ainda da para iniciar pelo controle de compras e pela receita liquida. Nao e perfeito, mas e melhor do que decidir por sensacao.

## Exemplo pratico

Imagine um restaurante com:

- Receita bruta mensal: R$ 120.000
- Impostos e deducoes estimadas: R$ 14.400
- Receita liquida: R$ 105.600
- Custo dos insumos vendidos: R$ 38.000

Nesse caso:

**CMV = R$ 38.000 / R$ 105.600 = 36,0%**

Esse numero sozinho nao diz tudo, mas acende uma pergunta: o restaurante esta comprando caro, perdendo produto, vendendo com ficha tecnica errada ou precificando mal?

## CMV baixo nem sempre significa lucro alto

Um erro comum e tratar CMV como unica medida de saude. Um restaurante pode ter CMV controlado e ainda perder dinheiro por causa de aluguel alto, folha pesada, imposto mal enquadrado ou dividas caras.

Por isso o Rook trata CMV como uma das seis casas do diagnostico financeiro: vendas, compras, impostos, despesas, endividamento e resultado.

## Como o Rook usa esse indicador

O Rook organiza compras e vendas para mostrar o CMV em contexto. A leitura nao para no percentual. O diagnostico aponta fornecedores relevantes, categorias que pesam mais e oportunidades de decisao com impacto em reais.

> Nota metodologica: benchmarks por segmento devem ser publicados apenas quando houver amostra anonima suficiente. Antes disso, o mais seguro e usar o CMV como ferramenta de diagnostico individual do restaurante.`,
    coverImageUrl: "/og-image-blog-template.png",
    coverImageAlt: "Diagnostico financeiro do Rook para CMV em restaurantes",
    authorId: "rook-editorial",
    authorName: "Rook Editorial",
    authorRole: "Inteligencia financeira para food service",
    category: "CMV e Compras",
    tags: ["cmv", "compras", "margem", "food service"],
    status: "published",
    primaryKeyword: "CMV restaurantes",
    seoTitle: "CMV em restaurantes: o que e e como calcular",
    seoDescription:
      "Entenda o que e CMV em restaurantes, como calcular corretamente e por que ele precisa ser analisado junto com margem, compras e DRE.",
    schemaFaq: [
      {
        question: "O que e CMV em restaurantes?",
        answer:
          "CMV e o custo da mercadoria vendida. Em restaurantes, representa quanto da receita liquida foi consumido por insumos, bebidas, embalagens e itens ligados ao produto vendido.",
      },
      {
        question: "Qual e a formula do CMV?",
        answer:
          "A formula classica e estoque inicial mais compras menos estoque final. Para obter o percentual, divida o CMV em reais pela receita liquida do periodo.",
      },
    ],
    dataSources: [
      {
        title: "Metodologia Rook de diagnostico financeiro",
        type: "methodology",
        note: "Estrutura editorial baseada nos seis pilares financeiros usados no produto Rook.",
      },
    ],
    methodologyNote:
      "Este artigo usa exemplo numerico didatico. Benchmarks agregados devem ser publicados apenas com amostra anonima suficiente.",
    readingTimeMin: 5,
    publishedAt: "2026-06-11T09:00:00-03:00",
    createdAt: "2026-06-11T09:00:00-03:00",
    updatedAt: "2026-06-11T09:00:00-03:00",
  },
  {
    id: "local-reduzir-cmv-sem-cortar-qualidade",
    slug: "como-reduzir-cmv-sem-cortar-qualidade",
    title: "Como reduzir o CMV sem cortar qualidade: 7 alavancas praticas",
    subtitle: "Reducao de custo boa nao começa no prato do cliente. Comeca na compra, ficha tecnica e rotina.",
    excerpt:
      "Reduzir CMV sem cortar qualidade exige atacar desperdicio, compras, ficha tecnica, mix de vendas e negociacao. Cortar ingrediente bom costuma ser a ultima alavanca, nao a primeira.",
    directAnswer:
      "Para reduzir CMV sem cortar qualidade, comece por perdas, compras fora de curva, ficha tecnica, porcionamento, fornecedores concentrados, mix de vendas e compras semanais. A qualidade cai quando o corte e feito no ingrediente antes do processo.",
    contentMarkdown: `## Resumo para o dono de restaurante

CMV alto nao significa automaticamente que o restaurante precisa comprar ingrediente pior. Na maioria das operacoes, antes de mexer na qualidade, existem perdas invisiveis no processo.

O caminho mais seguro e procurar onde o dinheiro escapa sem gerar valor para o cliente.

## 1. Separe compra ruim de produto bom

Ingrediente bom pode estar caro por negociacao ruim, compra em dia errado, pedido emergencial ou falta de comparacao historica. Antes de trocar o produto, entenda se voce esta pagando acima do seu proprio padrao.

## 2. Controle categorias, nao apenas o total

CMV total ajuda, mas esconde o problema. Carnes, laticinios, bebidas, descartaveis e hortifruti se comportam de formas diferentes. Uma categoria pode estar saudavel enquanto outra consome toda a margem.

## 3. Revise ficha tecnica dos campeoes de venda

Nao adianta revisar 80 itens de uma vez. Comece pelos produtos mais vendidos. Se os itens de maior volume tiverem ficha errada, o impacto aparece todos os dias.

## 4. Olhe para perdas recorrentes

Perda por validade, preparo excessivo, erro de porcionamento e retrabalho nao aparece como "desperdicio" no extrato bancario. Aparece como CMV alto.

## 5. Negocie concentracao de fornecedor

Fornecedor concentrado pode ser bom quando gera poder de barganha. Mas tambem pode virar dependencia. Se um fornecedor representa grande parte do CMV, ele merece acompanhamento separado.

## 6. Compare preco pago com historico

O melhor benchmark inicial e o proprio restaurante. Antes de comparar com o mercado inteiro, pergunte: por que paguei mais caro nesta semana do que no meu historico recente?

## 7. Conecte CMV ao DRE

Reduzir CMV so importa se melhora resultado. Se a reducao piora experiencia, derruba venda ou aumenta retrabalho, a conta pode virar contra o restaurante.

## Exemplo de decisao

Um restaurante com R$ 100.000 de receita liquida e CMV de 38% gasta R$ 38.000 em insumos. Uma reducao de 3 pontos percentuais representa R$ 3.000 por mes antes de considerar outros efeitos.

| Receita liquida | CMV atual | CMV alvo | Diferenca mensal |
| --- | --- | --- | --- |
| R$ 100.000 | 38% | 35% | R$ 3.000 |

Esse e o tipo de decisao que precisa aparecer em reais, nao apenas em percentual.`,
    coverImageUrl: "/og-image-blog-template.png",
    coverImageAlt: "Alavancas para reduzir CMV sem cortar qualidade",
    authorId: "rook-editorial",
    authorName: "Rook Editorial",
    authorRole: "Inteligencia financeira para food service",
    category: "CMV e Compras",
    tags: ["cmv", "compras", "qualidade", "fornecedores"],
    status: "published",
    primaryKeyword: "reduzir CMV restaurante",
    seoTitle: "Como reduzir CMV sem cortar qualidade",
    seoDescription:
      "Veja 7 alavancas praticas para reduzir CMV em restaurantes sem sacrificar qualidade, experiencia do cliente ou margem futura.",
    schemaFaq: [
      {
        question: "Da para reduzir CMV sem piorar a qualidade?",
        answer:
          "Sim. Antes de trocar ingredientes, o restaurante deve atacar perdas, ficha tecnica, porcionamento, compras fora de curva e concentracao de fornecedores.",
      },
      {
        question: "Qual alavanca de CMV deve vir primeiro?",
        answer:
          "Normalmente a primeira alavanca e entender categorias e produtos de maior impacto. Revisar os campeoes de venda costuma gerar resultado mais rapido do que revisar todo o cardapio.",
      },
    ],
    dataSources: [
      {
        title: "Exemplo numerico didatico",
        type: "example",
        note: "Valores simulados para demonstrar impacto financeiro de pontos percentuais de CMV.",
      },
    ],
    methodologyNote:
      "Os calculos usam exemplos simples para tomada de decisao. Cada operacao deve validar sazonalidade, regime tributario, cardapio e mix de vendas.",
    readingTimeMin: 6,
    publishedAt: "2026-06-11T10:00:00-03:00",
    createdAt: "2026-06-11T10:00:00-03:00",
    updatedAt: "2026-06-11T10:00:00-03:00",
  },
  {
    id: "local-dre-restaurantes-faturamento-lucro",
    slug: "dre-restaurantes-faturamento-lucro",
    title: "DRE para restaurantes: como saber se o faturamento virou lucro",
    subtitle: "Casa cheia e caixa movimentado nao bastam. A DRE mostra o que realmente sobrou.",
    excerpt:
      "A DRE organiza receita, impostos, custos, despesas e resultado para mostrar se o restaurante esta lucrando de verdade. Sem ela, faturamento alto pode mascarar margem baixa.",
    directAnswer:
      "DRE para restaurantes e o demonstrativo que transforma faturamento em leitura de lucro. Ela parte da receita, desconta impostos, CMV, despesas, folha, aluguel e outros custos ate chegar ao resultado operacional.",
    contentMarkdown: `## Resumo para o dono de restaurante

Faturar nao e lucrar. A frase parece simples, mas a maior parte das decisoes ruins nasce exatamente dessa confusao.

A DRE ajuda o restaurante a sair do "o movimento foi bom" para "quanto sobrou depois de pagar o que precisa ser pago".

## O que entra em uma DRE de restaurante

Uma DRE bem organizada costuma separar:

| Bloco | O que responde |
| --- | --- |
| Receita | Quanto entrou em vendas |
| Impostos | Quanto saiu antes da margem operacional |
| CMV | Quanto os produtos vendidos consumiram |
| Despesas | Quanto custa manter a operacao funcionando |
| Endividamento | Quanto o caixa suporta em parcelas e juros |
| Resultado | Quanto sobrou no fim |

## Por que olhar so o caixa engana

O caixa mostra movimento. A DRE mostra resultado. Um restaurante pode vender mais em um mes e lucrar menos se comprou caro, fez promocao sem margem, pagou imposto acima do necessario ou assumiu parcelas que apertam a operacao.

## Exemplo simplificado

| Linha | Valor |
| --- | --- |
| Receita bruta | R$ 120.000 |
| Impostos e deducoes | -R$ 14.400 |
| Receita liquida | R$ 105.600 |
| CMV | -R$ 38.000 |
| Despesas operacionais | -R$ 52.000 |
| Resultado antes de dividas | R$ 15.600 |

Esse exemplo mostra um ponto importante: a pergunta nao e apenas "quanto vendi?". A pergunta e "o que sobrou depois que a operacao inteira passou pela mesa?".

## Como o Rook transforma DRE em decisao

O Rook organiza os pilares financeiros e traduz cada area em leitura pratica. A ideia nao e entregar uma planilha bonita. E mostrar onde a margem esta vazando e qual decisao tem impacto financeiro.

## Quando revisar a DRE

O ideal e olhar mensalmente, mas com comparacao historica. Um mes isolado pode ter sazonalidade, evento, reforma, compra de estoque ou despesa nao recorrente. A tendencia e mais importante que o susto.`,
    coverImageUrl: "/og-image-blog-template.png",
    coverImageAlt: "DRE para restaurantes e diagnostico financeiro do Rook",
    authorId: "rook-editorial",
    authorName: "Rook Editorial",
    authorRole: "Inteligencia financeira para food service",
    category: "Gestao Financeira",
    tags: ["dre", "lucro", "faturamento", "gestao financeira"],
    status: "published",
    primaryKeyword: "DRE restaurante",
    seoTitle: "DRE para restaurantes: faturamento, margem e lucro",
    seoDescription:
      "Entenda como a DRE ajuda restaurantes a separar faturamento de lucro e acompanhar impostos, CMV, despesas e resultado.",
    schemaFaq: [
      {
        question: "Para que serve a DRE em restaurantes?",
        answer:
          "A DRE mostra se o faturamento virou lucro ao organizar receita, impostos, CMV, despesas e resultado em uma visao unica.",
      },
      {
        question: "Com que frequencia devo olhar a DRE?",
        answer:
          "O ideal e revisar a DRE mensalmente e comparar com meses anteriores para separar tendencia de eventos pontuais.",
      },
    ],
    dataSources: [
      {
        title: "Estrutura de diagnostico Rook",
        type: "methodology",
        note: "Modelo de leitura por pilares: vendas, compras, impostos, despesas, endividamento e resultado.",
      },
    ],
    methodologyNote:
      "Exemplo simplificado para educacao financeira. A DRE real deve considerar particularidades contabeis, regime tributario e plano de contas da empresa.",
    readingTimeMin: 5,
    publishedAt: "2026-06-11T11:00:00-03:00",
    createdAt: "2026-06-11T11:00:00-03:00",
    updatedAt: "2026-06-11T11:00:00-03:00",
  },
];

