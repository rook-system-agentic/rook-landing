export const CMV_GUIDE_CONTENT = {
  // LP viva (04/11/2026): hero e introdução passam a mostrar a conta, não só
  // descrevê-la. Todos os números vêm do exemplo ilustrativo do guia e da
  // planilha (abas Insumos, CMV Mensal, Impacto 1 Ponto e Orçamento Semanal).
  hero: {
    eyebrow: "GUIA PRÁTICO DE CMV · PDF + EXCEL GRÁTIS",
    title: {
      before: "A muçarela subiu R$ 6 o quilo. ",
      highlight: "Quanto saiu da sua margem?",
    },
    lead:
      "O guia mostra a conta completa do CMV. A planilha faz essa conta por você: o CMV do mês, o impacto de cada insumo e quanto ainda dá para comprar na semana, com os números do seu restaurante.",
    cta: "Quero o guia e a planilha",
    secondary: "Ver a conta completa",
    chips: ["Guia de 10 páginas", "Planilha com 6 abas", "Grátis, por e-mail"],
    visual: {
      label: "A conta da muçarela",
      tag: "Exemplo do guia",
      bars: [
        { label: "3 meses atrás", value: "R$ 30/kg", amount: 30 },
        { label: "Hoje", value: "R$ 36/kg", amount: 36 },
      ],
      delta: "+20%",
      rows: [
        ["Ficha técnica (300 g por pizza)", "R$ 9,00"],
        ["Custo real hoje", "R$ 10,80"],
      ],
      total: { label: "Em 1.000 pizzas por mês", value: "+ R$ 1.800" },
      note: "Se o preço da pizza não mudou, essa diferença sai da margem.",
      cmvChip: { label: "CMV do mês", value: "34,0%", detail: "meta 32%" },
      budgetChip: { label: "Teto de compras da semana", value: "R$ 28.574" },
      caption: "Valores ilustrativos do guia e da planilha",
    },
  },
  introduction: {
    eyebrow: "ANTES DA PLANILHA",
    title: {
      before: "CMV não é só um percentual. ",
      highlight: "É onde a margem escapa.",
    },
    lead:
      "No exemplo da planilha, a conta completa dá 34,0% contra uma meta de 32%. Parecem só 2 pontos. Em um restaurante que fatura R$ 400 mil por mês, cada ponto vale R$ 4.000.",
    formula: {
      label: "A conta completa · exemplo da planilha",
      terms: [
        { op: "", label: "Estoque inicial", value: "R$ 30.000" },
        { op: "+", label: "Compras do mês", value: "R$ 118.760" },
        { op: "−", label: "Estoque final", value: "R$ 25.000" },
        { op: "=", label: "CMV do mês", value: "R$ 123.760" },
      ],
      gauge: {
        scaleMax: 40,
        real: 34,
        meta: 32,
        realLabel: "34,0% da receita líquida",
        metaLabel: "Meta 32%",
        base: "Receita líquida de R$ 364.000: R$ 400 mil de faturamento menos 9% de impostos.",
      },
    },
    impact: {
      label: "Quanto vale 1 ponto de CMV em R$ 400 mil de faturamento",
      items: [
        { value: "R$ 4.000", label: "1 ponto, por mês" },
        { value: "R$ 8.000", label: "2 pontos, por mês" },
        { value: "R$ 96.000", label: "2 pontos, em 12 meses" },
      ],
      note: "Valores ilustrativos, não são benchmark. A planilha refaz a conta com o faturamento e os insumos do seu restaurante.",
    },
  },
  principles: {
    title: "3 erros que escondem a fuga",
    items: [
      {
        number: "01",
        icon: "calendar",
        title: "Datas misturadas",
        mistake: "Compras de um mês comparadas com o estoque de outro.",
        fix: "O guia fecha estoque inicial, compras e estoque final no mesmo período.",
      },
      {
        number: "02",
        icon: "formula",
        title: "Compras no lugar do CMV",
        mistake: "Sem os estoques, o número sobe e desce sem explicar a operação.",
        fix: "A planilha usa a fórmula inteira e mostra o CMV real do mês.",
      },
      {
        number: "03",
        icon: "chart",
        title: "Percentual sem a venda",
        mistake: "Comparar o percentual sem olhar receita, mix e preço do cardápio.",
        fix: "A leitura sai sobre a receita líquida e contra a meta do seu restaurante.",
      },
    ],
    cta: "Fazer essa conta com os meus números",
  },
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
        ["CMV Mensal", "34,0%"],
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
