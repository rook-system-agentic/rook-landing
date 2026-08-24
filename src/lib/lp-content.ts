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
 *
 * v6 (24/08/2026): "o Rook na língua do dono". A página falava a língua de
 * quem já entende controladoria — DRE, p.p., "as seis etapas" — e o visitante
 * típico (dono-operador, no celular, entre dois turnos) não se reconhecia. Três
 * mudanças estruturais, todas com o mesmo motivo: o que convence está agora
 * ANTES do que explica.
 *
 *   1. A promessa concreta subiu para o hero. "Em dois minutos você vê se o
 *      restaurante está no lucro ou no prejuízo" era a melhor frase do site e
 *      só aparecia depois de ~8.000 px de scroll, no fecho. O hero abria com
 *      "interpreta as seis etapas" — abstração, no lugar onde se decide ficar.
 *   2. O artefato do hero deixou de ser uma DRE. Para quem controla no caderno
 *      (39% do setor, dado desta mesma página), um demonstrativo contábil em
 *      fonte mono é a planilha que ele evita. O informe do WhatsApp é
 *      cotidiano; a DRE desceu para o método, onde já há contexto para lê-la.
 *   3. Jargão nunca aparece sozinho. "Budget", "p.p." e "linha de DRE" saíram
 *      do texto corrido; as siglas de fonte de dados (SEFAZ, eSocial, Open
 *      Finance) viram benefício no título e crachá de credibilidade embaixo.
 *
 * O que NÃO mudou, de propósito: "Faturar não é lucrar." continua — virou a
 * assinatura de marca, acima da manchete, em vez de ser a manchete; e os
 * números do restaurante-exemplo seguem derivando de EXEMPLO_DRE.
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
  /** Assinatura de marca. Era a manchete até a v5; ver o cabeçalho do arquivo. */
  label: "— Faturar não é lucrar.",
  headlinePlain: "Você sabe ",
  headlineEmphasis: "quanto sobrou",
  headlineTail: " no fim do mês?",
  primaryLabel: "Fazer meu diagnóstico gratuito",
  primaryHref: "/diagnostico/",
  secondaryLabel: "Testar 7 dias",
  secondaryHref: "/planos/",
  /** Remove o risco na mesma linha de visão do botão. */
  micro: "2 minutos · Sem cartão · Resultado na hora",
} as const;

export const HERO_PARAGRAPH: Paragraph = [
  { text: "O Rook conecta as vendas, as notas e o banco do seu restaurante e te diz, " },
  { text: "todo dia", strong: true },
  { text: ", se a casa está no lucro — e o que fazer quando não está. Direto no seu " },
  { text: "WhatsApp, às 7h", strong: true },
  { text: "." },
];

/* ─── Tabuleiro · Casa exemplo (a vitrine, agora dentro do método) ─── */

export const SHOWCASE = {
  label: "Tabuleiro · Casa exemplo",
  live: "Ao vivo",
  vendas: "Vendas",
  cmv: "Compras · CMV",
  resultado: "Resultado do mês",
} as const;

/* ─── Como funciona (era "O método") ─── */

export const METHOD = {
  label: "— Como funciona",
  headlinePlain: "O Rook faz o trabalho que ",
  headlineEmphasis: "ninguém tem tempo de fazer.",
  intro:
    "Sem trocar de sistema, sem digitar nada e sem montar planilha. Em três passos, o dinheiro da casa fica visível.",
  cards: [
    {
      step: "1 · Conecta",
      title: "Com o que você já usa",
      desc: "O PDV, o delivery, a máquina de cartão, o banco, as notas e a folha entram sozinhos no Rook. Ninguém digita nada. Ninguém troca de sistema.",
    },
    {
      step: "2 · Enxerga",
      title: "Quanto sobrou, hoje",
      desc: "Vendas, compras, impostos, folha e dívidas se organizam no tabuleiro da casa — e o resultado do mês aparece em reais, sem esperar o fechamento do contador.",
    },
    {
      step: "3 · Decide",
      title: "O que fazer, em reais",
      desc: "O Rook.AI — o consultor digital da casa — aponta onde a margem está escapando e o que fazer agora: renegociar, ajustar a ficha, segurar a compra. Sempre com o impacto em R$ de cada decisão.",
    },
  ],
  /**
   * As siglas saíram do título e viraram crachá. Cada uma diz o que entrega
   * para o dono, não o nome do protocolo: quem lê "SEFAZ" e não sabe o que é
   * ainda entende "suas notas".
   */
  credentials: [
    { sigla: "Open Finance", o_que: "seu banco" },
    { sigla: "SEFAZ", o_que: "suas notas" },
    { sigla: "eSocial", o_que: "sua folha" },
    { sigla: "Adquirentes e PDVs", o_que: "suas vendas" },
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

/*
 * v6: os mesmos quatro números, outra moldura. Eram "o setor em que o Rook
 * opera" — tese de tamanho de mercado, escrita para investidor. Viraram "se
 * está difícil, não é só com você": a mesma estatística, lida como companhia
 * em vez de diagnóstico do visitante. O vilão é a falta de visão, nunca o dono.
 */
export const SECTOR = {
  label: "— Você não está sozinho",
  headlinePlain: "Se está difícil, ",
  headlineEmphasis: "não é só com você.",
  outro:
    "Não é falta de esforço — é decidir sem ver o número. O setor inteiro joga no escuro. Quem enxerga primeiro, ganha o jogo.",
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

/* ─── A dor espelhada (era "Manifesto") ─── */

export const MANIFESTO = {
  label: "— A dor de quase todo dono",
  headlinePlain: "Você trabalha demais para ",
  headlineEmphasis: "não saber quanto sobra.",
  headlineTail: "",
} as const;

export const MANIFESTO_PARAGRAPHS: readonly Paragraph[] = [
  [
    { text: "Movimento no caixa é " },
    { text: "sensação", strong: true },
    { text: ". Lucro é " },
    { text: "fato", strong: true },
    {
      text: ". Entre um e outro, o dinheiro passa por seis paradas — venda, imposto, insumo, despesa, dívida e o que sobra. Em qualquer uma delas a margem escapa sem fazer barulho.",
    },
  ],
];

/**
 * As três dores, na língua falada.
 *
 * Eram pares "Receita ≠ Lucro" — notação matemática num público que a página
 * mesma descreve como controlando no caderno. Viraram a frase que o dono diz
 * em voz alta; o argumento continua idêntico.
 */
export interface Pain {
  title: string;
  desc: string;
}

export const PAINS: readonly Pain[] = [
  {
    title: "Vendeu bem e não sobrou?",
    desc: "Crescer 30% em vendas e perder dinheiro acontece todo mês. Sem ver etapa por etapa — imposto, insumo, folha, despesa, dívida — ninguém sabe onde a margem se perdeu.",
  },
  {
    title: "Fila na porta não paga aluguel.",
    desc: "Salão cheio e delivery bombando dão sensação de mês bom. Decidir pela sensação é o jeito mais caro de administrar uma casa.",
  },
  {
    title: "A parcela come o caixa em silêncio.",
    desc: "Financiamento pode ser alavanca ou armadilha. Sem saber por que cada parcela existe e como ela será paga, o caixa queima sem você ver.",
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

export interface BriefingMessage {
  time: string;
  lines: readonly string[];
  button: string;
}

/**
 * O informe diário — o artefato do hero desde a v6.
 *
 * ATENÇÃO: este mock reproduz o template real enviado pelo Twilio, incluindo
 * "Budget restante". A palavra é jargão e a copy da página traduz ("quanto
 * você ainda pode gastar na semana"), mas o mock continua fiel ao que chega no
 * celular do cliente — trocar aqui sem trocar o template faria a página
 * mostrar uma mensagem que o produto não envia. Quando o template mudar no
 * rook-system, esta linha muda junto.
 */
export const HERO_MESSAGE: BriefingMessage = {
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
};

export const BRIEFING = {
  label: "— O briefing da casa",
  headlinePlain: "Todo dia às 7h, o resumo no ",
  headlineEmphasis: "WhatsApp.",
  intro:
    "Não é mais um aplicativo para abrir. É o informe da casa chegando onde você já está: quanto vendeu ontem, quanto comprou e quanto ainda pode gastar na semana. Segunda-feira chega o limite semanal de compras; dia 1, o fechamento do mês.",
  ctaLabel: "Quero o resumo no WhatsApp",
  ctaHref: "/planos/",
  note: "Você ativa no cadastro, no seu número. Sem spam — só o informe da sua casa.",
  /*
   * O CABEÇALHO DO MOCK NÃO CARREGA NÚMERO DE TELEFONE. (24/08/2026)
   *
   * Até aqui o mock exibia o número real do canal Twilio, como no preview
   * aprovado (brief §5.5). Enquanto vivia no meio da página passava batido; com
   * o informe subindo para o hero na v6, o número virou a segunda coisa mais
   * visível do site — e um número de canal automatizado exposto assim recebe o
   * que não deveria: resposta de quem acha que fala com atendimento, contato de
   * quem não é cliente, e o que mais vier de um número público na home.
   *
   * O canal é de saída, com opt-in no onboarding. Quem precisa falar com o Rook
   * tem o e-mail no rodapé e o formulário; o mock só precisa parecer o que é —
   * uma conversa de WhatsApp — e para isso o nome do remetente basta.
   *
   * `contactTag` é rótulo, não identificador: nada aqui deve voltar a ser algo
   * que o visitante consiga discar.
   */
  contactName: "Rook Insights",
  contactTag: "Conta comercial",
  /*
   * Só o informe semanal. O diário subiu para o hero na v6 (HERO_MESSAGE) e
   * repeti-lo aqui seria mostrar o mesmo bloco de texto duas vezes na mesma
   * página — a seção ganha ao ilustrar a mensagem que o hero não mostrou.
   */
  messages: [
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
  ] as readonly BriefingMessage[],
} as const;

/* ─── Inteligência viva (Rook.AI) ─── */

/*
 * v6: a manchete deixou de descrever o produto ("O Rook.AI mora no produto") e
 * passou a contar o caso que a conversa abaixo demonstra. É a melhor prova da
 * página — um vazamento achado, quantificado e resolvido — e estava anunciada
 * por uma frase sobre arquitetura de software.
 */
export const INTELLIGENCE = {
  label: "— O consultor digital da casa",
  headlinePlain: "O filé subiu 8% e ninguém te avisou. ",
  headlineEmphasis: "O Rook avisa",
  headlineTail: " — e diz o que fazer.",
  context: "Casa exemplo · à la carte · Julho 2026",
  qa: [
    {
      q: "Por que o CMV fechou 2 pontos acima da meta?",
      a: "CMV do período: 31,0% contra meta de 29,0%. São R$ 8.256 a mais no mês. A proteína puxou: filé +8,4% em 30 dias, em três notas do mesmo fornecedor — acima do preço médio do segmento à la carte.",
    },
    {
      q: "E o mercado?",
      a: "No seu grupo de casas semelhantes, o CMV mediano está em 29,4%. Vocês estão 1,6 ponto acima. Próxima decisão: renegociar o filé ou ajustar a ficha dos 4 pratos que mais vendem. Impacto estimado: R$ 4.100 / mês.",
    },
  ],
  productParagraph:
    "O Rook.AI é o consultor que mora dentro da plataforma. Você pergunta em português, como perguntaria ao seu contador — e ele responde com o número, o contexto do seu segmento e a próxima decisão. Sem esperar o fechamento, sem montar planilha, a qualquer hora.",
  /** Fecha o argumento em dinheiro: a economia contra a mensalidade. */
  payoff: [
    { text: "Uma decisão dessas devolve " },
    { text: "R$ 4.100 por mês", strong: true },
    { text: " para o caixa. É assim que o Rook paga a própria mensalidade — todo mês." },
  ] as Paragraph,
  ctaLabel: "Ver o diagnóstico da minha casa",
  ctaHref: "/diagnostico/",
} as const;

/* ─── Quem está por trás ─── */

/**
 * A prova humana possível hoje.
 *
 * Não há cliente referenciável para depoimento (Gabriel, 24/08/2026), e a
 * página inteira não tinha um rosto: a autoridade aparecia como "quem vive
 * controladoria há duas décadas" — sem nome, sem cara. Num setor que decide
 * por indicação, autoridade anônima não transfere confiança.
 *
 * A história é a mesma que a /sobre já conta. `person` está vazio de propósito:
 * a seção entrega o texto com ou sem retrato, e o bloco da pessoa só aparece
 * quando houver nome e foto reais (ver LpAuthority). Um rosto de banco de
 * imagem destruiria a confiança que a seção existe para construir.
 */
export const AUTHORITY = {
  label: "— Quem está por trás",
  headlinePlain: "O Rook começou em ",
  headlineEmphasis: "planilhas.",
  paragraphs: [
    "Por mais de vinte anos fizemos o trabalho que quase ninguém quer fazer: entrar onde a operação está apertando e olhar os números sem romantizar. Antes de existir produto, existia método.",
    "Ao olhar para restaurantes, o padrão se repetia: casa cheia, marca forte, bom faturamento — e o dono sem saber para onde o dinheiro ia. O Rook é esse método virado plataforma: o olhar do controller na tela do dono, todo dia.",
  ],
  ctaLabel: "Conheça o Rook por dentro",
  ctaHref: "/sobre/",
  /** Preencher com a pessoa real destrava a seção. Ver o comentário acima. */
  person: {
    name: "",
    role: "",
    photo: "",
  },
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
    "O PDV, o ERP e o delivery da casa entram no mesmo tabuleiro — sem recadastrar nada. Se o seu ainda não está na lista, peça.",
  ctaLabel: "Não encontrou o seu sistema? Solicite a integração →",
} as const;

/* ─── Oferta ─── */

export interface Plan {
  name: string;
  /** Faixa de faturamento — é o que diferencia os dois planos, então vem primeiro. */
  faixa: string;
  price: string;
  period: string;
  description: string;
  note: string;
  highlighted: boolean;
}

/*
 * v6: o preço ganhou âncora. R$ 479,90 no vácuo compete com "grátis" (a
 * planilha); ao lado do vazamento que a própria página acabou de mostrar —
 * R$ 8.256/mês de CMV fora da meta — ele compete com o prejuízo.
 *
 * "a partir de 6%" e não "6%": 479,90 é 5,8% de 8.256, mas 779,90 é 9,4%. O
 * "a partir de" é o que mantém a frase verdadeira nos dois planos.
 */
export const PRICING = {
  label: "— Oferta",
  headlinePlain: "Quanto custa o ",
  headlineEmphasis: "Rook?",
  intro:
    "Lembra o CMV 2 pontos fora da meta lá de cima? Ele custa R$ 8.256 por mês numa casa exemplo. O Rook custa a partir de 6% disso — e é o mesmo acesso completo nos dois planos: a diferença é só o faturamento da casa.",
  cardCtaLabel: "Testar 7 dias",
  ctaLabel: "Ver detalhes →",
  ctaHref: "/planos/",
  /** O cartão entra no início do teste — dizer isso aqui evita a surpresa no checkout. */
  note: "7 dias de teste nos dois planos. A data da primeira cobrança aparece antes de você confirmar.",
} as const;

export const PLANS: readonly Plan[] = [
  {
    name: "Para a sua casa",
    faixa: "Até R$ 250 mil/mês",
    price: "R$ 479,90",
    period: "/mês",
    description: "Até R$ 250 mil de faturamento mensal. Acesso completo.",
    note: "Plano Knight",
    highlighted: false,
  },
  {
    name: "Para a sua casa",
    faixa: "Acima de R$ 250 mil/mês",
    price: "R$ 779,90",
    period: "/mês",
    description: "Acima de R$ 250 mil de faturamento mensal. Acesso completo.",
    note: "Plano Rook",
    highlighted: true,
  },
];

export const CHESS_ADDON = {
  label: "Para redes",
  description:
    "Todas as suas casas numa tela só: consolidação de grupo e visão multiunidade, somada ao plano de cada casa. Cobrança por grupo.",
  price: "+ R$ 279,90",
  period: "/mês",
  note: "Add-on Chess",
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

/*
 * As duas últimas são da v6 e não são enfeite: "não sou bom com números" é a
 * objeção que o público desta página tem e não escreve no formulário, e
 * "quanto tempo isso me toma" é a segunda. As duas respostas são forças do
 * produto que a página não estava contando.
 */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    q: "O que o Rook faz, na prática?",
    a: "Conecta as vendas, as compras, as notas, o banco e a folha do seu restaurante num lugar só e mostra quanto sobrou no mês — em reais, todo dia. Quando algo foge da meta, ele avisa e diz o que fazer, com o impacto em R$ de cada decisão. O resumo diário chega às 7h no seu WhatsApp.",
  },
  {
    q: "Preciso trocar o sistema que já uso?",
    a: "Não. O Rook se conecta ao PDV, ao ERP e ao delivery que você já tem — e ao que a operação já emite: notas, extrato do banco, folha. Nada muda no salão nem no caixa. Se o seu sistema ainda não está na lista, peça: a gente prioriza pelo volume de indicações.",
    cta: {
      label: "Solicite a integração aqui.",
      href: `mailto:${CONTACT_EMAIL}?subject=Solicita%C3%A7%C3%A3o%20de%20integra%C3%A7%C3%A3o%20com%20ERP`,
    },
  },
  {
    q: "Quanto custa?",
    a: "R$ 479,90/mês para casas que faturam até R$ 250 mil por mês, R$ 779,90/mês acima disso — mesmo acesso completo nos dois. Redes somam R$ 279,90/mês por grupo para ver todas as casas numa tela. Todos com 7 dias de teste, uma vez por CNPJ.",
  },
  {
    q: "Funciona em qualquer cidade?",
    a: "Sim. 26 estados + DF. O cálculo tributário considera a UF do estabelecimento pelo CNPJ.",
  },
  {
    q: "Posso testar sem cartão?",
    a: "O diagnóstico e a calculadora de CMV são gratuitos e sem cartão — é por eles que recomendamos começar. O teste de 7 dias da plataforma pede cartão válido, com a data da primeira cobrança mostrada antes de você confirmar; cancelando antes dela, nada é cobrado.",
  },
  {
    q: "Não sou bom com números — vou conseguir usar?",
    a: "O Rook existe exatamente para quem não quer viver de planilha. Você não monta nada: o resumo chega pronto no WhatsApp e, quando quiser entender mais, é só perguntar em português para o Rook.AI. Se você lê uma mensagem de bom dia, você usa o Rook.",
  },
  {
    q: "Quanto tempo por dia isso me toma?",
    a: "O resumo das 7h se lê em 30 segundos. As decisões da semana cabem em 5 minutos. O Rook trabalha de madrugada para você decidir no cafezinho.",
  },
];

/* ─── CTA final ─── */

/*
 * O fecho já era a melhor copy da página e continua igual — a diferença é que
 * agora ele ecoa o hero em vez de contradizê-lo.
 *
 * O botão secundário era "Sou restaurante à la carte", apontando para o mesmo
 * /diagnostico/ do primário: dois botões, um destino, e o visitante que não é
 * à la carte lendo que talvez a página não seja para ele. O segmento passou a
 * ser pergunta dentro do próprio diagnóstico, que é onde ele muda o resultado.
 */
export const CTA = {
  label: "— Pronto para ver os seus números",
  headlinePlain: "Comece pelo ",
  headlineEmphasis: "diagnóstico.",
  headlineTail: " Sem cartão.",
  intro:
    "Em dois minutos você vê se o restaurante está no lucro ou no prejuízo — e quanto precisa faturar para virar o mês.",
  primaryLabel: "Fazer meu diagnóstico",
  primaryHref: "/diagnostico/",
  secondaryLabel: "Ver planos e teste",
  secondaryHref: "/planos/",
} as const;
