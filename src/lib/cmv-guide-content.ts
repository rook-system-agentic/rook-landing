export const CMV_GUIDE_CONTENT = {
  hero: {
    eyebrow: "MATERIAL GRATUITO · PARA RESTAURANTES",
    title: "Entenda o CMV. Comece com os seus números.",
    lead:
      "Receba o Guia Prático de CMV e a planilha de apoio da Rook. Aprenda a organizar estoque, compras e vendas para fazer o primeiro cálculo do seu restaurante.",
  },
  introduction: {
    eyebrow: "ANTES DA PLANILHA",
    title: "CMV não é só um percentual.",
    paragraphs: [
      "É uma leitura do caminho entre o estoque, as compras e o que foi vendido. Um número sem período, inventário ou rotina de conferência pode parecer preciso e ainda assim orientar a decisão errada.",
      "O material da Rook organiza o primeiro cálculo e mostra o que observar depois dele — sem transformar um exemplo em benchmark para todos os restaurantes.",
    ],
  },
  principles: [
    {
      number: "01",
      title: "Comece pelo período",
      text: "Compare estoque inicial, compras e estoque final do mesmo intervalo. Misturar datas é a forma mais rápida de perder a leitura.",
    },
    {
      number: "02",
      title: "Use a fórmula inteira",
      text: "CMV = estoque inicial + compras − estoque final. O resultado só explica a operação quando as três partes estão disponíveis.",
    },
    {
      number: "03",
      title: "Leia junto da venda",
      text: "O percentual ajuda a comparar períodos, mas a decisão depende também da receita, do mix, dos preços e da margem que o restaurante precisa preservar.",
    },
  ],
  form: {
    // ROO-1642 v3 (aprovada em 04/11/2026): a seção vende o resultado e mostra
    // o material antes de pedir os dados. Números e seções vêm do próprio guia
    // (10 páginas) e da planilha (6 abas); nada de benchmark ou prova inventada.
    eyebrow: "— MATERIAL GRATUITO · PDF + EXCEL",
    title: {
      before: "Receba o guia e a planilha e ",
      highlight: "encontre as fugas",
      after: " do seu CMV.",
    },
    description:
      "Um guia de 10 páginas e uma planilha que calcula sozinha. Você chega ao primeiro CMV do mês com os seus números, não com média de mercado.",
    preview: {
      sheetTitle: "Planilha de apoio",
      sheetTabs: "6 abas",
      rows: [
        ["CMV Mensal", "32,0%"],
        ["Insumos · Muçarela", "+R$ 1,80"],
        ["Impacto 1 ponto", "R$ 4.000"],
        ["Orçamento semanal", "R$ 28.574"],
      ],
      badge: "GRÁTIS",
      caption: "Valores ilustrativos",
    },
    insideTitle: "O que vem dentro",
    inside: [
      "A fórmula completa e a diferença entre CMV teórico e real",
      "Por que a ficha técnica engana: o caso da muçarela",
      "Quanto vale 1 ponto de CMV no seu faturamento",
      "Orçamento semanal de compras pela metodologia Rook",
      "Um plano simples para os próximos 30 dias",
    ],
    steps: [
      { number: "01", text: "Preencha os 4 campos" },
      { number: "02", text: "Receba por e-mail em alguns minutos" },
      { number: "03", text: "Comece pela aba Leia-me" },
    ],
    card: {
      title: "Para onde enviamos o material?",
      description: "São 4 campos e leva menos de um minuto.",
      submit: "Quero o guia e a planilha",
      trust: "Grátis · sem cartão · sem compromisso",
      // Precisa bater com CMV_GUIDE_FROM do ambiente (remetente real do envio).
      sender: "materiais@rook.com.br",
    },
    success: {
      prepTitle: "Enquanto isso, separe 3 números do último mês:",
      prepItems: ["Estoque inicial", "Compras do mês", "Estoque final"],
      prepNote: "É o que a planilha pede para o primeiro cálculo de CMV.",
      calculatorLabel: "Enquanto espera, teste a Calculadora de CMV\u00a0→",
    },
  },
} as const;
