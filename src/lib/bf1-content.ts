/**
 * Copy da LP de Black Friday `/bl1/` (ROO-1825).
 *
 * Como no resto do site, o texto vive aqui e os componentes só o compõem.
 *
 * REGRAS DESTA PÁGINA
 *
 * - Um CTA só: entrar na comunidade da Rook no WhatsApp. O link e a data vêm de
 *   `bf1-community.mjs`; nenhum texto aqui cita link.
 * - Desconto e mentoria são PROMESSA DE CAMPANHA, sem regra inventada: nada de
 *   percentual, número de vagas ou critério de seleção. Essas condições são
 *   anunciadas dentro da comunidade — e é exatamente o motivo para entrar.
 * - "R$ 925 milhões de faturamento anual gerenciado em consultoria em 2025" foi
 *   informado por Gabriel Abdala (CEO) em 09/11/2026. São empresas atendidas
 *   pela consultoria, não necessariamente restaurantes: o texto não diz que
 *   são restaurantes.
 * - "Vinte anos de consultoria em finanças corporativas, controladoria e
 *   reestruturação" é a mesma origem descrita em `/sobre/` (lp-content.ts).
 * - "Conecta vendas, notas e banco e mostra, em reais, quanto sobrou" é a
 *   promessa já publicada na home (page.tsx).
 * - O tema da mentoria — "Planejamento Financeiro 2027: a estratégia e o
 *   sistema que farão o seu restaurante lucrar no ano que está por vir" — foi
 *   definido por Gabriel Abdala (CEO) em 09/11/2026. Os dois pilares (estratégia
 *   e sistema) desdobram essa frase; formato, vagas e datas NÃO são citados:
 *   "como participar" é anunciado na comunidade.
 * - O "Plano 2027" da seção da mentoria é ilustrativo (sem valores em reais) e
 *   está marcado como tal.
 * - A conversa da comunidade no hero é prévia ilustrativa, sem telefone
 *   (ver tests/mock-whatsapp-sem-telefone.test.mjs) e marcada como tal.
 */
export const BF1_CONTENT = {
  meta: {
    title: "Black Friday da Rook e mentoria Planejamento Financeiro 2027 | Rook System",
    description:
      "Entre na comunidade da Rook no WhatsApp: pré-lançamento da Black Friday, desconto e a oportunidade de uma mentoria personalizada de Planejamento Financeiro 2027.",
    ogTitle: "Black Friday da Rook + mentoria de Planejamento Financeiro 2027",
    ogDescription:
      "Na comunidade do WhatsApp: pré-lançamento, desconto e a oportunidade de uma mentoria personalizada para o seu restaurante lucrar em 2027.",
    ogAlt: "Black Friday Rook — comunidade no WhatsApp com pré-lançamento, desconto e mentoria de Planejamento Financeiro 2027.",
  },
  cta: {
    label: "Quero entrar na comunidade",
    pendingLabel: "Link da comunidade em breve",
    headerLabel: "Entrar na comunidade",
    trust: ["Gratuito", "No WhatsApp", "Você sai quando quiser"],
  },
  hero: {
    eyebrow: "Black Friday Rook · Pré-lançamento",
    liveTag: "Comunidade no WhatsApp",
    headlinePlain: "A Black Friday da Rook começa antes.",
    headlineEmphasis: "E começa na comunidade.",
    lead: {
      before:
        "Entre na comunidade da Rook no WhatsApp. É lá que acontece o pré-lançamento: você conhece as condições antes de todo mundo, garante o desconto e ainda tem a oportunidade de uma mentoria personalizada de ",
      strong: "Planejamento Financeiro 2027",
      after: ".",
    },
    secondaryLabel: "Conhecer a mentoria 2027",
    dateLabel: "Black Friday · sexta, 27 de novembro",
    countdownLabels: { days: "dias", hours: "horas", minutes: "min", seconds: "seg" },
    countdownAria: "Tempo até a Black Friday",
    stat: { value: "R$ 925 mi", caption: "faturamento anual gerenciado em consultoria em 2025" },
  },
  preview: {
    title: "Comunidade Rook",
    subtitle: "Black Friday · pré-lançamento",
    note: "Prévia ilustrativa da comunidade",
    typing: "Rook está digitando",
    messages: [
      {
        tag: "Aviso",
        text: "O pré-lançamento da Black Friday acontece aqui. As condições chegam primeiro para quem está na comunidade.",
      },
      {
        tag: "Desconto",
        text: "Condição de Black Friday liberada para a comunidade antes da abertura ao público.",
      },
      {
        tag: "Mentoria 2027",
        text: "Planejamento Financeiro 2027: a estratégia e o sistema para o seu restaurante lucrar no ano que vem. A oportunidade é de quem está aqui.",
      },
    ],
  },
  benefits: {
    label: "— Por que entrar agora",
    headlinePlain: "Quem está na comunidade ",
    headlineEmphasis: "sai na frente.",
    items: [
      {
        n: "01",
        icon: "clock",
        title: "Acesso antecipado",
        text: "O pré-lançamento acontece dentro da comunidade. Você conhece as condições da Black Friday antes da abertura para o público.",
      },
      {
        n: "02",
        icon: "tag",
        title: "Desconto de Black Friday",
        text: "A condição especial da Rook para restaurantes, liberada primeiro para quem está na comunidade.",
      },
      {
        n: "03",
        icon: "mentor",
        title: "Mentoria Planejamento Financeiro 2027",
        text: "Além do desconto, a oportunidade de uma mentoria personalizada com o nosso time: a estratégia e o sistema para o seu restaurante lucrar em 2027.",
      },
    ],
  },
  mentorship: {
    id: "mentoria",
    label: "— Mentoria exclusiva da comunidade",
    headlinePlain: "Planejamento Financeiro ",
    headlineEmphasis: "2027.",
    lead: "A estratégia e o sistema que farão o seu restaurante lucrar no ano que está por vir.",
    intro:
      "Uma mentoria personalizada com o nosso time, olhando para os números da sua casa. A oportunidade é de quem está na comunidade.",
    pillars: [
      {
        n: "01",
        icon: "strategy",
        title: "A estratégia",
        text: "O ano de 2027 em números: quanto vender, quanto pode custar e quanto precisa sobrar, mês a mês.",
      },
      {
        n: "02",
        icon: "system",
        title: "O sistema",
        text: "A Rook conecta vendas, notas e banco e mostra, em reais, quanto sobrou — para você acompanhar o plano todo mês.",
      },
    ],
    proof: "Conduzida pelo time que gerenciou R$ 925 milhões de faturamento anual em consultoria em 2025.",
    howTo: "Como participar é anunciado primeiro na comunidade",
    plan: {
      title: "Plano 2027",
      subtitle: "Seu restaurante",
      tag: "Ilustrativo",
      chartLabel: "Ilustração de um plano mensal de 2027, com as vendas de cada mês e uma linha de meta.",
      targetLabel: "Meta",
      months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      rows: [
        { label: "Meta de vendas", value: "mês a mês" },
        { label: "Teto de custos", value: "CMV e fixos" },
        { label: "Lucro planejado", value: "em reais" },
      ],
    },
  },
  history: {
    id: "historia",
    label: "— Nossa história",
    headlinePlain: "Antes de virar sistema, ",
    headlineEmphasis: "foi consultoria.",
    stat: { value: "R$ 925 milhões", caption: "de faturamento anual gerenciado pela nossa consultoria em 2025." },
    paragraphs: [
      "Em 2025, gerenciamos em consultoria R$ 925 milhões de faturamento anual. Entramos onde a operação apertava, reestruturamos o que precisava ser reestruturado e ajudamos as empresas a voltar a ter resultado — de fato, não só no papel.",
      "Todo esse conhecimento hoje roda de forma automatizada na Rook. O sistema conecta vendas, notas e banco do restaurante e mostra, em reais, quanto sobrou e qual é a próxima decisão.",
    ],
    timeline: [
      { kicker: "20 anos", title: "Consultoria", text: "Controladoria, finanças corporativas e reestruturação de empresas." },
      { kicker: "2025", title: "R$ 925 milhões", text: "De faturamento anual gerenciado em consultoria." },
      { kicker: "Hoje", title: "Rook", text: "O mesmo método, automatizado para restaurantes e food service." },
    ],
  },
  steps: {
    label: "— Como funciona",
    headlinePlain: "Três passos até a ",
    headlineEmphasis: "Black Friday.",
    items: [
      { n: "1", title: "Entre na comunidade", text: "Pelo botão desta página. É gratuito, e você sai quando quiser." },
      { n: "2", title: "Acompanhe o pré-lançamento", text: "As condições, as datas e como participar da mentoria são anunciados lá primeiro." },
      { n: "3", title: "Aproveite antes de todo mundo", text: "Garanta o desconto de Black Friday e a oportunidade da mentoria de Planejamento Financeiro 2027." },
    ],
  },
  final: {
    id: "comunidade",
    label: "— Pré-lançamento",
    headlinePlain: "Entre antes e ",
    headlineEmphasis: "planeje 2027 com a gente.",
    text: "A comunidade da Rook abre antes da Black Friday. O pré-lançamento, o desconto e a mentoria de Planejamento Financeiro 2027 começam lá.",
  },
} as const;

export type Bf1IconName = (typeof BF1_CONTENT.benefits.items)[number]["icon"];
export type Bf1PillarIconName = (typeof BF1_CONTENT.mentorship.pillars)[number]["icon"];
