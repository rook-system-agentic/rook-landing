/**
 * Copy da LP de Black Friday `/bl1/` (ROO-1825).
 *
 * Como no resto do site, o texto vive aqui e os componentes só o compõem.
 *
 * REGRAS DESTA PÁGINA
 *
 * - Um CTA só: entrar na comunidade do Rook no WhatsApp. O link e a data vêm de
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
 * - A conversa da comunidade no hero é prévia ilustrativa, sem telefone
 *   (ver tests/mock-whatsapp-sem-telefone.test.mjs) e marcada como tal.
 */
export const BF1_CONTENT = {
  meta: {
    title: "Black Friday do Rook: entre na comunidade | Rook System",
    description:
      "Entre na comunidade do Rook no WhatsApp e participe do pré-lançamento da Black Friday: desconto e a oportunidade de uma mentoria personalizada.",
    ogTitle: "A Black Friday do Rook começa antes — na comunidade",
    ogDescription:
      "Pré-lançamento no WhatsApp: desconto de Black Friday e a oportunidade de uma mentoria personalizada com o time do Rook.",
    ogAlt: "Black Friday Rook — a comunidade no WhatsApp com pré-lançamento, desconto e mentoria personalizada.",
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
    headlinePlain: "A Black Friday do Rook começa antes.",
    headlineEmphasis: "E começa na comunidade.",
    lead: "Entre na comunidade do Rook no WhatsApp. É lá que acontece o pré-lançamento: você conhece as condições antes de todo mundo, garante o desconto e ainda tem a oportunidade de uma mentoria personalizada com o nosso time.",
    secondaryLabel: "Conhecer a nossa história",
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
        tag: "Mentoria",
        text: "Quem está aqui tem a oportunidade de uma mentoria personalizada com o time do Rook.",
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
        text: "A condição especial do Rook para restaurantes, liberada primeiro para quem está na comunidade.",
      },
      {
        n: "03",
        icon: "mentor",
        title: "Mentoria personalizada",
        text: "Além do desconto, a oportunidade de uma mentoria com o nosso time, olhando para os números e a operação da sua casa.",
      },
    ],
  },
  history: {
    id: "historia",
    label: "— Nossa história",
    headlinePlain: "Antes de virar sistema, ",
    headlineEmphasis: "foi consultoria.",
    stat: { value: "R$ 925 milhões", caption: "de faturamento anual gerenciado pela nossa consultoria em 2025." },
    paragraphs: [
      "Em 2025, gerenciamos em consultoria R$ 925 milhões de faturamento anual. Entramos onde a operação apertava, reestruturamos o que precisava ser reestruturado e ajudamos as empresas a voltar a ter resultado — de fato, não só no papel.",
      "Todo esse conhecimento hoje roda de forma automatizada no Rook. O sistema conecta vendas, notas e banco do restaurante e mostra, em reais, quanto sobrou e qual é a próxima decisão.",
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
      { n: "2", title: "Acompanhe o pré-lançamento", text: "As condições, as datas e a mentoria são anunciadas lá primeiro." },
      { n: "3", title: "Aproveite antes de todo mundo", text: "Garanta o desconto de Black Friday e a oportunidade de uma mentoria personalizada." },
    ],
  },
  final: {
    id: "comunidade",
    label: "— Pré-lançamento",
    headlinePlain: "Quem entra antes, ",
    headlineEmphasis: "aproveita primeiro.",
    text: "A comunidade do Rook abre antes da Black Friday. O pré-lançamento, o desconto e a mentoria começam lá.",
  },
} as const;

export type Bf1IconName = (typeof BF1_CONTENT.benefits.items)[number]["icon"];
