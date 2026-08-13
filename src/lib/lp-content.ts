/**
 * Conteúdo da home.
 *
 * Existe como fonte única porque o redesenho v4 divide a página em seis
 * componentes: sem isto, o texto se espalharia por seis arquivos e a próxima
 * alteração de copy passaria a ser uma caça.
 *
 * O texto é o mesmo da home anterior, palavra por palavra. A única alteração
 * autorizada foi o e-mail de contato, que estava como contato@rooksystem.com.br
 * (autorizado por Daniel em 13/08/2026).
 */

export const CONTACT_EMAIL = "contato@rook.com.br";

/* ─── Texto corrido com ênfase ─── */

export interface Segment {
  text: string;
  strong?: boolean;
}

export type Paragraph = readonly Segment[];

/* ─── Hero ─── */

export const HERO = {
  label: "— Sistema de Inteligência Financeira e Gestão para Restaurantes",
  headlinePlain: "Faturar não é ",
  headlineEmphasis: "lucrar.",
  sourcesLine: "Setor: Abrasel, 2025 · Mortalidade: IBGE, empresas brasileiras, 2024",
} as const;

export const HERO_PARAGRAPH: Paragraph = [
  { text: "Num setor que movimenta " },
  { text: "R$ 495 bilhões por ano", strong: true },
  {
    text: ", aproximadamente 60% dos bares e restaurantes não geram lucro. O que separa as empresas que sobrevivem das que lucram e prosperam é a gestão pelos números corretos. ",
  },
  {
    text: "O Rook é a inteligência financeira que te apoia na coleta, análise e interpretação desses dados.",
    strong: true,
  },
];

export interface SectorStat {
  value: string;
  label: string;
  source: string;
}

export const SECTOR_STATS: readonly SectorStat[] = [
  { value: "R$ 495 bi", label: "O tamanho do setor", source: "Abrasel, 2025" },
  { value: "39%", label: "Controlam contas na planilha ou caderno", source: "Conta Simples + Visa, 2024" },
  { value: "37%", label: "Com contas em atraso", source: "Abrasel, mai/2025" },
  { value: "62,7%", label: "Das empresas fecham em 5 anos", source: "IBGE, 2024" },
];

export interface ModuleBlock {
  title: string;
  bullets: readonly string[];
}

export const MODULES: readonly ModuleBlock[] = [
  {
    title: "Vendas e Tributos",
    bullets: [
      "Faturamento diário, semanal e mensal, com pacote completo de indicadores de performance",
      "Projeções ajustadas para suporte ao planejamento operacional",
      "Comunicação ativa via WhatsApp para acompanhamento diário, semanal e mensal",
      "Análise mensal dos impostos apurados",
    ],
  },
  {
    title: "Compras (CMV)",
    bullets: [
      "Compras diárias, semanais e mensais com pacote completo de indicadores de performance e controle",
      "CMV real vs. meta por período, com limite de compras",
      "Monitoramento de preços dos insumos com alerta de inflação",
    ],
  },
  {
    title: "Despesas",
    bullets: [
      "Despesas com vendas — análise e comparação com benchmarking",
      "Despesas com pessoal — monitoramento do Custo de Mão de Obra (CMO) com indicadores de produtividade",
      "Despesas administrativas — clareza sobre ocupação, serviços, manutenções e gastos gerais",
    ],
  },
  {
    title: "Resultados",
    bullets: [
      "DRE gerencial, fluxo de caixa realizado e projeções de receita e compras",
      "Score de saúde financeira e liquidez",
      "Análise de endividamento",
    ],
  },
];

/* ─── Funil das seis etapas ─── */

/**
 * As seis etapas pelas quais o dinheiro passa, encenadas como funil.
 *
 * Não acrescenta informação: encena o parágrafo do manifesto sobre a margem
 * escapando a cada etapa.
 *
 * Cada valor é o que SOBRA depois da etapa, e a série é a mesma DRE que o
 * módulo "Resultados" do hero mostra em números — ver EXEMPLO_DRE abaixo. As
 * duas peças ficam a poucos pixels uma da outra na página; se contarem
 * histórias diferentes sobre o mesmo dinheiro, um contador percebe em dez
 * segundos.
 *
 * "dívidas" e "resultado" fecham no mesmo 15% de propósito: depois de pagar as
 * dívidas, o que sobra É o resultado. A última barra tem tratamento visual
 * próprio para ler como destino, não como mais uma dedução.
 */
export const FUNNEL_STAGES: readonly { stage: string; remaining: number }[] = [
  { stage: "vendas", remaining: 100 },
  { stage: "impostos", remaining: 91 },
  { stage: "custos", remaining: 60 },
  { stage: "despesas", remaining: 24 },
  { stage: "dívidas", remaining: 15 },
  { stage: "resultado", remaining: 15 },
];

/**
 * O restaurante-exemplo da home. Um só, um período só — todos os quatro
 * gráficos do hero e o funil saem daqui.
 *
 * Validado por Daniel em 13/08/2026 como reconhecível para a operação. Ainda
 * é exemplo, não é cliente: se algum dia for ancorado em dado medido, trocar
 * aqui e conferir se o funil continua fechando.
 */
export const EXEMPLO_DRE = {
  receita: 412_800,
  linhas: [
    { label: "Impostos", pct: 9.0 },
    { label: "CMV", pct: 31.0 },
    { label: "Despesas", pct: 36.0 },
    { label: "Dívidas", pct: 9.0 },
  ],
  /** 100 − 9 − 31 − 36 − 9. Confira contra a última etapa do funil. */
  margemPct: 15.0,
} as const;

/* ─── Manifesto ─── */

export const MANIFESTO = {
  label: "— A pergunta de quase todo dono de restaurante",
  headlinePlain: "Você sabe quanto ",
  headlineEmphasis: "sobrou",
  headlineTail: " no final do mês?",
} as const;

export const MANIFESTO_PARAGRAPHS: readonly Paragraph[] = [
  [
    { text: "Movimento no caixa é uma " },
    { text: "percepção", strong: true },
    { text: ". Lucro é " },
    { text: "uma realidade", strong: true },
    {
      text: ". Entre os dois, o dinheiro passa por seis etapas: vendas, impostos, custos, despesas, dívidas e resultado. Em cada uma, a margem pode estar escapando sem você ver.",
    },
  ],
  [
    {
      text: "A maioria dos restaurantes joga sem enxergar o tabuleiro e sem uma estratégia clara para ganhar o jogo — planilhas superficiais, “feeling” do gerente, sem fundamento econômico, financeiro ou contábil.",
    },
  ],
  [
    { text: "O Rook organiza as " },
    { text: "seis etapas na mesma tela", strong: true },
    { text: ", trazendo visão, estratégia e controle." },
  ],
];

export interface Contrast {
  contrast: string;
  desc: string;
}

export const CONTRASTS: readonly Contrast[] = [
  {
    contrast: "Receita ≠ Lucro",
    desc: "O que entra no caixa não é o que fica no bolso — entre os dois há 6 etapas. Crescer 30% em vendas e ainda assim perder dinheiro acontece todo mês em food service: sem visão por linha de DRE, ninguém sabe em qual etapa a margem se perdeu.",
  },
  {
    contrast: "Movimento ≠ Margem",
    desc: "Filas no salão, delivery cheio, ticket bom — e a margem real pode ser positiva ou negativa. Decidir pelo número certo, e não pela sensação de movimento, muda o resultado do mês inteiro.",
  },
  {
    contrast: "Dívida ≠ Estratégia",
    desc: "Financiamento pode ser alavanca ou armadilha. Sem saber o porquê do endividamento e sem ter a certeza de como pagá-lo, o resultado é a queima insustentável de caixa.",
  },
];

/* ─── Planos ─── */

export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  note: string;
  highlighted: boolean;
}

export const PRICING = {
  label: "— Planos e preços",
  headlinePlain: "Quanto custa o ",
  headlineEmphasis: "Rook?",
  intro:
    "O enquadramento é por faturamento bruto mensal. Ambos os planos entregam acesso completo à plataforma. Teste grátis por 7 dias.",
  ctaLabel: "Ver detalhes e contratar →",
  ctaHref: "/planos/",
} as const;

export const PLANS: readonly Plan[] = [
  {
    name: "Knight",
    price: "R$ 479,90",
    period: "/mês",
    description: "Para estabelecimentos com faturamento mensal de até R$ 250 mil.",
    note: "Acesso completo à plataforma",
    highlighted: false,
  },
  {
    name: "Rook",
    price: "R$ 779,90",
    period: "/mês",
    description: "Para estabelecimentos com faturamento mensal acima de R$ 250 mil.",
    note: "Acesso completo à plataforma",
    highlighted: true,
  },
];

export const CHESS_ADDON = {
  label: "Chess · Add-on",
  description:
    "Para redes e franquias: consolidação de grupo e visão multiunidade, somada ao plano escolhido acima.",
  price: "+ R$ 279,90",
  period: "/mês",
} as const;

/* ─── FAQ ─── */

export interface FaqItem {
  q: string;
  a: string;
  cta?: { label: string; href: string };
}

export const FAQ = {
  label: "— Perguntas",
  headlinePlain: "Antes de ",
  headlineEmphasis: "começar.",
  intro:
    "As dúvidas mais comuns dos donos de restaurante que estão avaliando o Rook. Não encontrou o que precisa?",
  ctaLabel: "Enviar e-mail →",
} as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    q: "Quanto custa o Rook System?",
    a: "O Rook tem dois planos base: Knight (R$ 479,90/mês) para restaurantes com faturamento de até R$ 250 mil/mês, e Rook (R$ 779,90/mês) para faturamento acima de R$ 250 mil/mês. Ambos oferecem acesso completo à plataforma. Para redes e franquias, há o add-on Chess (R$ 279,90/mês por grupo econômico). Todos incluem 7 dias de teste grátis.",
  },
  {
    q: "Como funciona o Rook?",
    a: "O Rook coleta, analisa e interpreta os dados financeiros e fiscais do seu restaurante, classificando cada linha com base em metodologia contábil e traduzindo tudo em um diagnóstico. Pelo fluxo de caixa ou pelo DRE, você recebe recomendações direcionadas à construção do seu lucro.",
  },
  {
    q: "Funciona em qualquer cidade do Brasil?",
    a: "Sim. O Rook opera em todos os 26 estados + Distrito Federal. O cálculo tributário considera a UF do estabelecimento automaticamente — você só precisa ter o cadastro do CNPJ correto.",
  },
  {
    q: "É seguro? Quem mais vê meus dados?",
    a: "Os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Cada empresa tem seu próprio ambiente isolado — ninguém vê seus números fora da sua equipe. O Rook está adequado à LGPD.",
  },
  {
    q: "Preciso mudar de contador?",
    a: "Não. O Rook é uma inteligência de performance para o dono — ele não substitui o contador.",
  },
  {
    q: "Preciso trocar o sistema que já uso?",
    a: "Não. O Rook não substitui seu PDV ou ERP — nossa metodologia lê seus dados e traduz seu resultado. Para aumentar ainda mais a nossa capacidade de análise, possuímos integração com os principais ERPs do mercado.",
    cta: {
      label: "Caso seu ERP ainda não tenha integração, solicite aqui.",
      href: `mailto:${CONTACT_EMAIL}?subject=Solicita%C3%A7%C3%A3o%20de%20integra%C3%A7%C3%A3o%20com%20ERP`,
    },
  },
  {
    q: "Posso testar antes de pagar?",
    a: "Sim. O período de teste dura 7 dias, é oferecido uma vez por Empresa/CNPJ e exige um cartão válido. Se você cancelar antes do término, a primeira cobrança não será realizada.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "A oferta padrão tem cobrança mensal recorrente em reais. O plano Knight custa R$ 479,90/mês e o Rook custa R$ 779,90/mês. Ao final do período de teste de 7 dias, a mensalidade do plano contratado é cobrada no meio de pagamento cadastrado.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O cancelamento pode ser solicitado pela plataforma ou pelo suporte, com antecedência mínima de 15 dias do fim do ciclo, e produz efeitos ao final do período pago.",
  },
];

/* ─── CTA final ─── */

export const CTA = {
  label: "— Pronto para ver os seus números?",
  headlinePlain: "Teste por ",
  headlineEmphasis: "7 dias.",
  intro:
    "Escolha o plano adequado ao faturamento do seu estabelecimento. Organizações multiunidade também podem contratar o módulo Chess.",
  primaryLabel: "Ver planos e testar →",
  primaryHref: "/planos/",
  secondaryLabel: "Conhecer o produto",
  secondaryHref: "/funcionalidades/",
} as const;
