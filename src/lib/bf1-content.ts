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
 * - R$ 925 milhões: informado por Gabriel Abdala (CEO) em 09/11/2026. A frase
 *   canônica é a do vídeo do anúncio (bf26_v1ads_30s): "nossa consultoria de
 *   reestruturação atendeu empresas que somam R$ 925 milhões de faturamento
 *   por ano" (2025). São empresas atendidas, não necessariamente restaurantes,
 *   e não é dinheiro "gerenciado" ou "administrado" pela Rook. Vídeo, LP,
 *   anúncio e Avisos usam a mesma formulação.
 * - "Vinte anos de consultoria em finanças corporativas, controladoria e
 *   reestruturação" é a mesma origem descrita em `/sobre/` (lp-content.ts).
 * - "Conecta vendas, notas e banco e mostra, em reais, quanto sobrou" é a
 *   promessa já publicada na home (page.tsx).
 * - O tema da mentoria (Planejamento Financeiro 2027: a estratégia e o sistema)
 *   foi definido por Gabriel Abdala (CEO) em 09/11/2026. Desde 11/11 a promessa
 *   é de ENTREGA ("planejar metas, custos e resultado"), nunca de lucro — regra
 *   "sem promessa de lucro" da campanha. Formato, vagas e janela NÃO são
 *   citados até o Gabriel defini-los: "como participar" sai na comunidade.
 * - Entrar na comunidade não é contratar: o texto diz "receber o acesso
 *   antecipado à oferta", nunca "garantir o desconto" (CDC, art. 30).
 * - A comunidade é permanente: o valor de toda semana (seção `community`) vem
 *   antes da campanha. Origem: feedback da Isa e da Gabriela em 10/11/2026.
 * - O "Plano 2027" da seção da mentoria é ilustrativo (sem valores em reais) e
 *   está marcado como tal.
 * - A conversa da comunidade no hero é prévia ilustrativa, sem telefone
 *   (ver tests/mock-whatsapp-sem-telefone.test.mjs) e marcada como tal.
 */
export const BF1_CONTENT = {
  meta: {
    title: "Black Friday da Rook e mentoria Planejamento Financeiro 2027 | Rook System",
    description:
      "Entre gratuitamente na comunidade da Rook no WhatsApp: conteúdo exclusivo sobre gestão de restaurantes e acesso antecipado à Black Friday em 26/11.",
    ogTitle: "Black Friday da Rook + mentoria de Planejamento Financeiro 2027",
    ogDescription:
      "Comunidade gratuita da Rook no WhatsApp: conteúdo exclusivo toda semana e acesso antecipado à Black Friday em 26/11.",
    ogAlt: "Black Friday Rook — comunidade no WhatsApp com pré-lançamento, desconto e mentoria de Planejamento Financeiro 2027.",
  },
  cta: {
    label: "Entrar na comunidade gratuita",
    pendingLabel: "Link da comunidade em breve",
    headerLabel: "Entrar na comunidade",
    trust: ["Gratuito", "No WhatsApp", "Conteúdo exclusivo toda semana"],
  },
  hero: {
    eyebrow: "Black Friday Rook · Pré-lançamento",
    liveTag: "Comunidade no WhatsApp",
    headlinePlain: "A Black Friday da Rook começa antes.",
    headlineEmphasis: "E começa na comunidade.",
    lead: {
      before:
        "Entre gratuitamente na comunidade da Rook no WhatsApp. Toda semana, conteúdos exclusivos sobre custos, caixa e tendências do mercado de restaurantes. E na Black Friday, você recebe o acesso antecipado à oferta em 26/11 e conhece em primeira mão a mentoria de ",
      strong: "Planejamento Financeiro 2027",
      after: ".",
    },
    secondaryLabel: "Conhecer a mentoria 2027",
    dateLabel: "Acesso antecipado · quinta, 26/11",
    dateSecondary: "Abertura para o público: sexta, 27/11",
    doneLabel: "O acesso antecipado já começou na comunidade",
    countdownLabels: { days: "dias", hours: "horas", minutes: "min", seconds: "seg" },
    countdownAria: "Tempo até o acesso antecipado",
    stat: { value: "R$ 925 mi", caption: "faturamento anual das empresas atendidas pela nossa consultoria em 2025" },
  },
  preview: {
    title: "Comunidade Rook",
    subtitle: "Avisos · conteúdo e pré-lançamento",
    note: "Prévia ilustrativa da comunidade",
    typing: "Rook está digitando",
    messages: [
      {
        tag: "Número da semana",
        text: "CMV: o que entra na conta e por que um ponto a menos muda o fim do mês.",
      },
      {
        tag: "Aviso",
        text: "O pré-lançamento da Black Friday acontece aqui. Em 26/11, a oferta chega primeiro para quem está na comunidade.",
      },
      {
        tag: "Mentoria 2027",
        text: "Planejamento Financeiro 2027: a estratégia e o sistema para planejar metas, custos e resultado do seu restaurante.",
      },
    ],
  },
  community: {
    label: "— O que acontece na comunidade",
    headlinePlain: "A Black Friday passa. ",
    headlineEmphasis: "A comunidade fica.",
    items: [
      {
        n: "01",
        icon: "metric",
        title: "Número da semana",
        text: "Um indicador por semana — CMV, ticket médio, prazo de caixa: o que é, como calcular e o que fazer com ele.",
      },
      {
        n: "02",
        icon: "tool",
        title: "Ferramentas práticas",
        text: "Guias e planilhas de apoio para usar na operação, como o Guia Prático de CMV.",
      },
      {
        n: "03",
        icon: "trend",
        title: "Tendências e 2027",
        text: "O que muda para restaurantes com a CBS e o IBS e os números do setor, explicados sem juridiquês.",
      },
      {
        n: "04",
        icon: "chat",
        title: "Troca entre donos",
        text: "No grupo Geral, você conversa com outros donos e gestores sobre o que tem funcionado.",
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
        text: "Em 26/11, as condições da Black Friday saem primeiro na comunidade, antes da abertura para o público, na sexta, 27/11.",
      },
      {
        n: "02",
        icon: "tag",
        title: "Desconto de Black Friday",
        text: "A condição especial da Rook para restaurantes, apresentada primeiro na comunidade. Entrar é gratuito e não obriga a contratar.",
      },
      {
        n: "03",
        icon: "mentor",
        title: "Mentoria Planejamento Financeiro 2027",
        text: "A mentoria com o nosso time: a estratégia e o sistema para planejar metas, custos e resultado do seu restaurante em 2027. Como participar sai primeiro na comunidade.",
      },
    ],
  },
  mentorship: {
    id: "mentoria",
    label: "— Mentoria da Black Friday",
    headlinePlain: "Planejamento Financeiro ",
    headlineEmphasis: "2027.",
    lead: "A estratégia e o sistema para planejar metas, custos e resultado do seu restaurante em 2027.",
    intro:
      "Uma mentoria com o nosso time para montar o plano de 2027 do seu restaurante.",
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
    proof: "Conduzida pelo time cuja consultoria atendeu, em 2025, empresas que somam R$ 925 milhões de faturamento anual.",
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
    stat: { value: "R$ 925 milhões", caption: "de faturamento anual somado pelas empresas atendidas pela nossa consultoria em 2025." },
    paragraphs: [
      "Em 2025, nossa consultoria de reestruturação atendeu empresas que somam R$ 925 milhões de faturamento por ano. Entramos onde a operação apertava, reestruturamos o que precisava ser reestruturado e ajudamos as empresas a voltar a ter resultado — de fato, não só no papel.",
      "Todo esse conhecimento hoje roda de forma automatizada na Rook. O sistema conecta vendas, notas e banco do restaurante e mostra, em reais, quanto sobrou e qual é a próxima decisão.",
    ],
    timeline: [
      { kicker: "20 anos", title: "Consultoria", text: "Controladoria, finanças corporativas e reestruturação de empresas." },
      { kicker: "2025", title: "R$ 925 milhões", text: "De faturamento anual das empresas atendidas em consultoria." },
      { kicker: "Hoje", title: "Rook", text: "O mesmo método, automatizado para restaurantes e food service." },
    ],
  },
  steps: {
    label: "— Como funciona",
    headlinePlain: "Três passos até a ",
    headlineEmphasis: "Black Friday.",
    items: [
      { n: "1", title: "Entre na comunidade", text: "Pelo botão desta página. É gratuito, e você já recebe os conteúdos da semana." },
      { n: "2", title: "Acompanhe o pré-lançamento", text: "As condições, as datas e como participar da mentoria saem lá primeiro." },
      { n: "3", title: "Receba o acesso antecipado", text: "Em 26/11, você vê a oferta antes de todo mundo e decide se quer contratar." },
    ],
  },
  final: {
    id: "comunidade",
    label: "— Pré-lançamento",
    headlinePlain: "Entre antes e ",
    headlineEmphasis: "planeje 2027 com a gente.",
    text: "A comunidade da Rook continua depois da Black Friday, com conteúdo toda semana. O acesso antecipado de 26/11 e a mentoria de Planejamento Financeiro 2027 começam lá.",
  },
} as const;

export type Bf1IconName = (typeof BF1_CONTENT.benefits.items)[number]["icon"];
export type Bf1CommunityIconName = (typeof BF1_CONTENT.community.items)[number]["icon"];
export type Bf1PillarIconName = (typeof BF1_CONTENT.mentorship.pillars)[number]["icon"];
