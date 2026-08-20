/**
 * Conteúdo da home.
 *
 * Existe como fonte única porque o redesenho divide a página em componentes:
 * sem isto, o texto se espalharia por muitos arquivos e a próxima alteração
 * de copy passaria a ser uma caça.
 *
 * v5 (18/08/2026): copy e disposição alinhados ao preview aprovado com Daniel
 * (plaza-flora-cinder-sky.grok.me). O texto do preview é a fonte de verdade;
 * os números do restaurante-exemplo continuam derivando de EXEMPLO_DRE.
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
  label: "— Inteligência financeira para food service",
  headlinePlain: "Faturar não é ",
  headlineEmphasis: "lucrar.",
  primaryLabel: "Ver o diagnóstico do meu restaurante",
  primaryHref: "/diagnostico/",
  secondaryLabel: "Testar 7 dias",
  secondaryHref: "/planos/",
} as const;

export const HERO_PARAGRAPH: Paragraph = [
  { text: "Num setor de " },
  { text: "R$ 495 bilhões", strong: true },
  { text: ", 6 em cada 10 casas não lucram. O Rook lê a operação, interpreta as seis etapas e aponta, " },
  { text: "em reais", strong: true },
  { text: ", a próxima decisão." },
];

/* ─── Tabuleiro · Casa exemplo (a vitrine sob o hero) ─── */

export const SHOWCASE = {
  label: "Tabuleiro · Casa exemplo",
  live: "Ao vivo",
  vendas: "Vendas",
  cmv: "Compras · CMV",
  resultado: "Resultado do mês",
} as const;

/* ─── O método ─── */

export const METHOD = {
  label: "— O método",
  headlinePlain: "Coleta. Interpreta. ",
  headlineEmphasis: "Decide.",
  intro: "Autoridade de quem vive controladoria há duas décadas — agora na tela, todo dia.",
  cards: [
    {
      step: "Coleta",
      title: "Lê o que a casa já produz",
      desc: "PDV, ERP, Open Finance, SEFAZ, eSocial e adquirentes entram no mesmo tabuleiro — sem recadastrar a operação.",
    },
    {
      step: "Interpretação",
      title: "Seis etapas, um diagnóstico",
      desc: "Vendas, impostos, custos, despesas, dívidas e resultado. Em cada uma, o Rook mostra onde a margem escapa.",
    },
    {
      step: "Decisão",
      title: "Recomendação em reais",
      desc: "Não é um painel para contemplar. É a próxima decisão do gestor, com impacto em R$ e acompanhamento no WhatsApp.",
    },
  ],
} as const;

/* ─── De onde vêm os números ─── */

export const DATA_SOURCES = {
  label: "— De onde vêm os números",
  headlinePlain: "Não é só o sistema da casa. É ",
  headlineEmphasis: "tudo que a operação já emite.",
  intro:
    "Open Finance monta o fluxo de caixa pelo extrato. A SEFAZ entrega a nota. O eSocial, a folha. A adquirente, a taxa. O PDV continua no salão.",
  statement: {
    title: "Central de Dados · Extratos bancários",
    doc: "Extrato Stone · 01/07 a 31/07/2026 · Casa exemplo",
    summary: [
      { label: "Saldo anterior", value: "R$ 41.560" },
      { label: "Créditos", value: "R$ 198.640", meta: "338 txns" },
      { label: "Débitos", value: "R$ 171.080", meta: "214 txns" },
      { label: "Saldo atual", value: "R$ 69.120" },
    ],
    classifiedTitle: "Classificação automática",
    classified: [
      { label: "Receita de Vendas", txns: 34, value: "R$ 186.410" },
      { label: "Folha de Pagamento", txns: 18, value: "R$ 82.560" },
      { label: "Taxas de Cartão", txns: 12, value: "R$ 12.230" },
      { label: "Utilidades", txns: 4, value: "R$ 4.180" },
      { label: "Impostos", txns: 2, value: "R$ 37.152" },
    ],
    badge: "Classificação 78%",
  },
} as const;

/*
 * A captura viva (brief do Gabriel, §5.2 — docs/brief-gabriel-conversao-20260818.md):
 * cada fonte abre um mock da Central de Dados, não um card genérico. Os números
 * fecham entre si e com EXEMPLO_DRE: a folha de R$ 82.560 é 20% da receita; os
 * créditos de R$ 198.640 do extrato são o bruto das adquirentes, e o líquido de
 * R$ 186.410 é a "Receita de Vendas" classificada no extrato.
 */

export interface SourceTab {
  id: "openfinance" | "sefaz" | "esocial" | "adquirentes" | "pdv";
  tab: string;
}

export const SOURCE_TABS: readonly SourceTab[] = [
  { id: "openfinance", tab: "Open Finance" },
  { id: "sefaz", tab: "SEFAZ" },
  { id: "esocial", tab: "eSocial" },
  { id: "adquirentes", tab: "Adquirentes" },
  { id: "pdv", tab: "PDV, ERP, delivery" },
];

export const SEFAZ_MOCK = {
  title: "Central de Dados · SEFAZ",
  doc: "NF-e de compra · 11/08/2026 · Casa exemplo",
  aceite: {
    warning: "Aguardando seu aceite — o XML expira na SEFAZ em 174 dias.",
    action: "Confirmar operação",
  },
  partes: [
    { label: "Emitente", value: "Distribuidora Serra Ltda" },
    { label: "Destinatário", value: "Casa exemplo" },
  ],
  tributos: [
    { label: "Produtos", value: "R$ 3.314" },
    { label: "ICMS", value: "R$ 593" },
    { label: "PIS", value: "R$ 27" },
    { label: "COFINS", value: "R$ 126" },
  ],
  categoriasTitle: "Resumo por categoria — na extração",
  categorias: [
    { label: "Laticínios", pct: 68, value: "R$ 2.256", itens: "5 itens" },
    { label: "Mercearia", pct: 25, value: "R$ 830", itens: "9 itens" },
    { label: "Proteínas", pct: 4, value: "R$ 134", itens: "2 itens" },
    { label: "Limpeza", pct: 3, value: "R$ 55", itens: "1 item" },
  ],
  itens: [
    { label: "ÓLEO DE SOJA 900ML", categoria: "Mercearia", value: "R$ 47,86" },
    { label: "AÇÚCAR CRISTAL 5KG", categoria: "Mercearia", value: "R$ 31,52" },
    { label: "LEITE CONDENSADO", categoria: "Laticínios", value: "R$ 704,94" },
  ],
} as const;

export const ESOCIAL_MOCK = {
  title: "Central de Dados · eSocial",
  doc: "Eventos do eSocial · sem recadastrar colaborador",
  badge: "Folha lida na origem",
  summary: [
    { label: "Vínculos", value: "18" },
    { label: "Folha do mês", value: "R$ 82.560" },
    { label: "CMO sobre a receita", value: "20,0%" },
  ],
  setores: [
    { label: "Cozinha · 8 vínculos", value: "R$ 38.400" },
    { label: "Salão · 7 vínculos", value: "R$ 29.680" },
    { label: "Administrativo · 3 vínculos", value: "R$ 14.480" },
  ],
} as const;

export const ADQUIRENTES_MOCK = {
  title: "Central de Dados · Faturas de cartão",
  doc: "Stone + Rede · liquidação do período",
  badge: "Conciliado",
  summary: [
    { label: "Venda bruta", value: "R$ 198.640" },
    { label: "Taxas", value: "R$ 12.230", tone: "out" },
    { label: "Caiu na conta", value: "R$ 186.410", tone: "in" },
  ],
  adquirentes: [
    { label: "Stone · 62% do volume", value: "taxa 3,19%" },
    { label: "Rede · 38% do volume", value: "taxa 2,89%" },
  ],
} as const;

export const PDV_MOCK = {
  title: "Infraestrutura de dados · Central de Dados",
  doc: "O PDV, o ERP e o delivery entram aqui — e cruzam com nota, banco e maquininha.",
  badge: "Julho 2026",
  tiles: [
    { value: "47", label: "Notas de compra" },
    { value: "312", label: "Notas de venda" },
    { value: "3", label: "Extratos bancários" },
    { value: "2", label: "Faturas de cartão" },
  ],
  note: "Conferência cruzada: PDV × NFC-e × adquirente × extrato.",
} as const;

/* ─── O setor ─── */

export const SECTOR = {
  label: "— O setor em que o Rook opera",
} as const;

export interface SectorStat {
  value: string;
  label: string;
  source: string;
}

export const SECTOR_STATS: readonly SectorStat[] = [
  { value: "R$ 495 bi", label: "O tamanho do setor", source: "Abrasel, 2025" },
  { value: "60%", label: "Dos bares e restaurantes não geram lucro", source: "Abrasel, 2025" },
  { value: "39%", label: "Ainda controlam na planilha ou no caderno", source: "Conta Simples + Visa, 2024" },
  { value: "62,7%", label: "Das empresas fecham em 5 anos", source: "IBGE, 2024" },
];

/**
 * O restaurante-exemplo da home. Um só, um período só — os gráficos da
 * vitrine e os painéis do tabuleiro saem daqui.
 *
 * Validado por Daniel em 13/08/2026 como reconhecível para a operação. Ainda
 * é exemplo, não é cliente: se algum dia for ancorado em dado medido, trocar
 * aqui e conferir se os painéis continuam fechando.
 */
export const EXEMPLO_DRE = {
  receita: 412_800,
  linhas: [
    { label: "Impostos", pct: 9.0 },
    { label: "CMV", pct: 31.0 },
    { label: "Despesas", pct: 36.0 },
    { label: "Dívidas", pct: 9.0 },
  ],
  /** 100 − 9 − 31 − 36 − 9. */
  margemPct: 15.0,
} as const;

/* ─── Manifesto ─── */

export const MANIFESTO = {
  label: "— A pergunta de quase todo dono",
  headlinePlain: "Você sabe quanto ",
  headlineEmphasis: "sobrou",
  headlineTail: " no final do mês?",
} as const;

export const MANIFESTO_PARAGRAPHS: readonly Paragraph[] = [
  [
    { text: "Movimento no caixa é " },
    { text: "percepção", strong: true },
    { text: ". Lucro é " },
    { text: "realidade", strong: true },
    {
      text: ". Entre os dois, o dinheiro passa por seis etapas. Em cada uma, a margem pode escapar sem você ver.",
    },
  ],
];

export interface Contrast {
  contrast: string;
  desc: string;
}

export const CONTRASTS: readonly Contrast[] = [
  {
    contrast: "Receita ≠ Lucro",
    desc: "Crescer 30% em vendas e ainda perder dinheiro acontece todo mês. Sem visão por linha de DRE, ninguém sabe em qual etapa a margem se perdeu.",
  },
  {
    contrast: "Movimento ≠ Margem",
    desc: "Fila no salão e delivery cheio não pagam aluguel. Decidir pelo número certo — e não pela sensação de movimento — muda o resultado do mês.",
  },
  {
    contrast: "Dívida ≠ Estratégia",
    desc: "Financiamento pode ser alavanca ou armadilha. Sem saber por que a parcela existe e como ela será paga, o caixa queima em silêncio.",
  },
];

/* ─── O tabuleiro (seis etapas em abas) ─── */

export const BOARD = {
  label: "— O tabuleiro",
  headlinePlain: "A casa inteira, na ",
  headlineEmphasis: "mesma tela.",
  intro:
    "Vendas, CMV, imposto, folha, dívida e o que sobrou — o número que o gestor usa para decidir o mês.",
} as const;

export interface BoardTab {
  id: "vendas" | "cmv" | "impostos" | "despesas" | "dividas" | "resultado";
  tab: string;
  sub: string;
}

export const BOARD_TABS: readonly BoardTab[] = [
  { id: "vendas", tab: "Vendas", sub: "Turno, canal e o dia que paga o mês." },
  { id: "cmv", tab: "Compras / CMV", sub: "O real contra a meta, com limite de compras." },
  { id: "impostos", tab: "Impostos", sub: "O que foi apurado no período." },
  { id: "despesas", tab: "Despesas", sub: "Vendas, pessoal e administrativas." },
  { id: "dividas", tab: "Endividamento", sub: "Por que a parcela existe e como será paga." },
  { id: "resultado", tab: "Resultado", sub: "O que sobrou depois das seis etapas." },
];

/** Aba Vendas: turnos de ontem somam os R$ 17,4 mil do último dia da série. */
export const BOARD_VENDAS = {
  turnosTitle: "Por turno · ontem",
  turnos: [
    { label: "Almoço", valor: "R$ 6.210" },
    { label: "Jantar", valor: "R$ 8.940" },
    { label: "Delivery", valor: "R$ 2.250" },
  ],
  melhorDia: { label: "Melhor dia", valor: "Sáb · R$ 18.800" },
  piorDia: { label: "Pior dia", valor: "Seg · R$ 9.000" },
} as const;

/**
 * Aba Compras/CMV: inflação de insumo e limite semanal (brief §5.4).
 *
 * O limite semanal deriva do CMV do DRE em LpBoard — 31% da receita,
 * proporcional a 7 dos 31 dias do mês = R$ 28.896. Usado + disponível fecham
 * nesse total, e o disponível bate com o informe semanal do WhatsApp
 * (BRIEFING.messages).
 */
export const BOARD_CMV = {
  insumosTitle: "Inflação de insumo · 30 dias",
  insumos: [
    { label: "Filé mignon", delta: "+8,4%", note: "3 notas · mesmo fornecedor" },
    { label: "Azeite extra", delta: "+12,1%", note: "Acima do segmento" },
    { label: "Cerveja long neck", delta: "+1,2%", note: "Dentro da faixa" },
  ],
  limiteTitle: "Limite semanal de compras",
  limiteUsado: "R$ 19.420 usados",
  limiteDisponivel: "R$ 9.476 disponíveis",
} as const;

/** Aba Impostos: a alíquota é o percentual do DRE; o resto é contexto. */
export const BOARD_IMPOSTOS = {
  bigLabel: "Alíquota efetiva no período",
  note: "A alíquota sai do CNPJ e da UF do estabelecimento. Sem planilha paralela — o impacto aparece em reais na DRE.",
} as const;

/**
 * Aba Endividamento. O caixa do período é o saldo atual do extrato
 * (DATA_SOURCES.statement) e a cobertura é caixa ÷ parcelas
 * (69.120 ÷ 37.152 ≈ 1,9×) — o mesmo restaurante, o mesmo período.
 */
export const BOARD_DIVIDAS = {
  bigLabel: "Parcelas do mês",
  rows: [
    { label: "4 contratos ativos", value: "capital de giro + equipamentos" },
    { label: "Caixa do período", value: "R$ 69.120" },
    { label: "Cobertura das parcelas", value: "1,9×" },
  ],
} as const;

/* ─── O briefing da casa ─── */

export const BRIEFING = {
  label: "— O briefing da casa",
  headlinePlain: "Todo dia às 7h, o resumo no ",
  headlineEmphasis: "WhatsApp.",
  intro:
    "Não é chat. É o informe da operação: faturamento, compras e budget restante. Segunda-feira chega o limite da semana. Dia 1, o fechamento. O Rook.AI — a inteligência que cruza esses dados e responde o gestor — fica dentro da plataforma.",
  ctaLabel: "Quero o resumo no WhatsApp",
  ctaHref: "/planos/",
  note: "Opt-in no onboarding, direto no seu WhatsApp.",
  /** O número real do canal (Twilio), como no preview aprovado — brief §5.5. */
  contactName: "Rook",
  contactNumber: "+55 61 3686-6728",
  messages: [
    {
      time: "hoje · 07:10",
      lines: [
        "Bom dia. Segue o resumo diário do restaurante Casa exemplo referente a 17/08/2026.",
        "Faturamento ontem: R$ 17.400,00",
        "Acumulado no mês: R$ 198.640,00",
        "Compras ontem: R$ 5.380,00",
        "Budget restante: R$ 22.140,00",
        "Acesse o dashboard para mais detalhes.",
      ],
      button: "Abrir Dashboard",
    },
    {
      time: "seg · 07:00",
      lines: [
        "Bom dia. Segue o limite de compras semanal do restaurante Casa exemplo para a semana 11/08 a 17/08.",
        "Limite semanal: R$ 28.896,00",
        "Já utilizado: R$ 19.420,00",
        "Disponível: R$ 9.476,00",
        "Acompanhe suas compras no app.",
      ],
      button: "Ver Compras",
    },
  ],
} as const;

/* ─── Inteligência viva (Rook.AI) ─── */

export const INTELLIGENCE = {
  label: "— Inteligência viva",
  headlinePlain: "O Rook.AI mora no ",
  headlineEmphasis: "produto.",
  context: "Casa exemplo · à la carte · Julho 2026",
  qa: [
    {
      q: "Por que o CMV fechou 2 pontos acima da meta?",
      a: "CMV do período: 31,0% contra meta de 29,0%. São R$ 8.256 a mais no mês. A proteína puxou: filé +8,4% em 30 dias, em três notas do mesmo fornecedor — acima do preço médio do segmento à la carte.",
    },
    {
      q: "E o mercado?",
      a: "No seu grupo de casas semelhantes, o CMV mediano está em 29,4%. Vocês estão 1,6 p.p. acima. Próxima decisão: renegociar o filé ou ajustar a ficha dos 4 pratos que mais vendem. Impacto estimado: R$ 4.100 / mês.",
    },
  ],
  productParagraph:
    "O Rook.AI é a inteligência do negócio. Interliga o que a casa já emite e responde o gestor no momento da pergunta — com o número, o contexto e o que fazer agora. Sem esperar o fechamento. Sem montar a planilha.",
  ctaLabel: "Ver o diagnóstico da minha casa",
  ctaHref: "/diagnostico/",
} as const;

/* ─── Parceiros e integrações ─── */

export interface Partner {
  name: string;
  categoria: string;
  /**
   * Caminho em `public/partners/`. `null` renderiza o nome em tipografia.
   *
   * A ausência de arquivo não é lacuna a esconder: é o estado de quem ainda
   * não teve o logo obtido de fonte oficial. Basta colocar o arquivo e
   * preencher este campo para o logo aparecer.
   */
  logo: string | null;
  /** Dimensões intrínsecas do arquivo, para reservar espaço e não deslocar o layout. */
  w?: number;
  h?: number;
}

/*
 * ROO-1124: os logos de bitmap são .webp já reduzidos ao tamanho de tela (a
 * placa exibe no máximo 116×36). Os .png originais continuam em
 * `public/partners/` como fonte — se alguém precisar gerar outro tamanho,
 * gera a partir deles, não do WebP. O `w`/`h` aqui é a dimensão real do
 * arquivo servido, e é o que reserva o espaço antes da imagem chegar.
 * Logo em SVG fica em SVG: escala sozinho e não tem o que reduzir.
 */
export const PARTNERS: readonly Partner[] = [
  { name: "Omie", categoria: "ERP", logo: "/partners/omie.png", w: 134, h: 46 },
  { name: "Conta Azul", categoria: "ERP", logo: "/partners/conta-azul.svg", w: 139, h: 18 },
  { name: "Saipos", categoria: "PDV", logo: "/partners/saipos.svg", w: 161, h: 51 },
  { name: "iFood", categoria: "Delivery", logo: "/partners/ifood.webp", w: 120, h: 120 },
  { name: "Cardápio Web", categoria: "Delivery", logo: "/partners/cardapio-web.webp", w: 240, h: 156 },
  { name: "Stone", categoria: "Adquirente", logo: "/partners/stone.webp", w: 152, h: 44 },
  // Sem arquivo: userede.com.br responde 302 e não entrega o SVG. Colocar em
  // public/partners/rede.svg e preencher `logo` faz o logo aparecer sozinho.
  { name: "Rede", categoria: "Adquirente", logo: null },
];

export const PARTNERS_SECTION = {
  label: "— Integrações",
  headlinePlain: "Funciona com o que você ",
  headlineEmphasis: "já usa.",
  intro:
    "O PDV, o ERP e o delivery da casa entram no mesmo tabuleiro. Se o seu ainda não está na lista, peça.",
  ctaLabel: "Não encontrou o seu sistema? Solicite a integração →",
} as const;

/* ─── Oferta ─── */

export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  note: string;
  highlighted: boolean;
}

export const PRICING = {
  label: "— Oferta",
  headlinePlain: "Quanto custa o ",
  headlineEmphasis: "Rook?",
  intro:
    "Mesmo acesso nos dois planos. A diferença é o faturamento do estabelecimento. 7 dias de teste.",
  cardCtaLabel: "Testar 7 dias",
  ctaLabel: "Ver detalhes →",
  ctaHref: "/planos/",
} as const;

export const PLANS: readonly Plan[] = [
  {
    name: "Knight",
    price: "R$ 479,90",
    period: "/mês",
    description: "Até R$ 250 mil de faturamento mensal.",
    note: "7 dias de teste",
    highlighted: false,
  },
  {
    name: "Rook",
    price: "R$ 779,90",
    period: "/mês",
    description: "Acima de R$ 250 mil de faturamento mensal.",
    note: "7 dias de teste",
    highlighted: true,
  },
];

export const CHESS_ADDON = {
  label: "Chess · Add-on",
  description:
    "Para redes: consolidação de grupo e visão multiunidade, somada ao plano escolhido. Cobrança por grupo.",
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
    q: "O que o Rook faz, na prática?",
    a: "Organiza as seis etapas entre o caixa e o bolso — vendas, impostos, custos, despesas, dívidas e resultado — e devolve um diagnóstico com recomendação em reais. É inteligência financeira para o gestor decidir, todo dia.",
  },
  {
    q: "Preciso trocar o sistema que já uso?",
    a: "Não. O Rook lê os dados que a operação já produz e cruza com os documentos fiscais. Se o seu sistema ainda não está na lista de integrações, peça — a gente prioriza pelo volume de indicações.",
    cta: {
      label: "Solicite a integração aqui.",
      href: `mailto:${CONTACT_EMAIL}?subject=Solicita%C3%A7%C3%A3o%20de%20integra%C3%A7%C3%A3o%20com%20ERP`,
    },
  },
  {
    q: "Quanto custa?",
    a: "Knight R$ 479,90/mês até R$ 250 mil de faturamento. Rook R$ 779,90/mês acima disso. Mesmo acesso nos dois. Chess é add-on de redes, R$ 279,90/mês por grupo. 7 dias de teste, uma vez por CNPJ.",
  },
  {
    q: "Funciona em qualquer cidade?",
    a: "Sim. 26 estados + DF. O cálculo tributário considera a UF do estabelecimento pelo CNPJ.",
  },
  {
    q: "Posso testar sem cartão?",
    a: "O diagnóstico e a calculadora de CMV são gratuitos e sem cartão. O teste de 7 dias da plataforma pede cartão válido; se cancelar antes, a primeira cobrança não ocorre.",
  },
];

/* ─── CTA final ─── */

export const CTA = {
  label: "— Pronto para ver os seus números",
  headlinePlain: "Comece pelo ",
  headlineEmphasis: "diagnóstico.",
  headlineTail: " Sem cartão.",
  intro:
    "Em dois minutos você vê se o restaurante está no lucro ou no prejuízo — e quanto precisa faturar para virar o mês.",
  primaryLabel: "Fazer meu diagnóstico",
  primaryHref: "/diagnostico/",
  secondaryLabel: "Sou restaurante à la carte",
  secondaryHref: "/diagnostico/",
} as const;
