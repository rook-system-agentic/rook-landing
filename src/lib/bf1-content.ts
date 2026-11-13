/**
 * Copy da LP de Black Friday `/bl1/` (ROO-1825).
 *
 * Como no resto do site, o texto vive aqui e os componentes só o compõem.
 *
 * REGRAS DESTA PÁGINA
 *
 * - Um CTA só: entrar na comunidade da Rook no WhatsApp. O link e a data vêm de
 *   `bf1-community.mjs`; nenhum texto aqui cita link.
 * - A oferta de primeiro mês foi definida na ROO-1857 e é revelada no servidor
 *   a partir de 26/11 (bf1-campaign-server.ts). Não colocar preço futuro neste
 *   módulo: ele também é importado por componentes cliente. As regras da
 *   mentoria continuam sem vagas ou critérios inventados.
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
 * - ROO-1876 (decisão do Gabriel em 13/11/2026): a mentoria de Planejamento
 *   Financeiro 2027 é EXCLUSIVA para quem está na comunidade. Só isso: formato,
 *   vagas, janela e "como participar" continuam a definir e saem na comunidade.
 *   Por isso não se escreve "sai primeiro" sobre a mentoria (implicaria abertura
 *   ao público depois). O hero diz para quem é a página ("Para donos de
 *   restaurante"), porque "Black Friday" sozinho atrai quem procura desconto de
 *   consumo — era o perfil do clique barato da campanha de 12/11.
 * - O "Plano 2027" da seção da mentoria é ilustrativo (sem valores em reais) e
 *   está marcado como tal.
 * - A conversa da comunidade no hero é prévia ilustrativa, sem telefone
 *   (ver tests/mock-whatsapp-sem-telefone.test.mjs) e marcada como tal.
 * - Cadastro antes do grupo (ROO-1848, decisão do Gabriel em 11/11/2026): o CTA
 *   pede nome, WhatsApp, e-mail e restaurante e só então abre o grupo Black
 *   Rook 2026. O aviso (`access.notice`) diz a finalidade; contato comercial só
 *   com a caixa marcada (desmarcada por padrão). Mudou o aviso, sobe
 *   BF1_ACCESS_NOTICE_VERSION em bf1-access-validation.mjs.
 */
import { BF1_ACCESS_NOTICE_VERSION } from "./bf1-access-validation.mjs";

export const BF1_CONTENT = {
  meta: {
    title: "Black Friday da Rook e mentoria Planejamento Financeiro 2027 | Rook System",
    description:
      "Para donos de restaurante: mentoria de Planejamento Financeiro 2027 exclusiva para a comunidade da Rook no WhatsApp e acesso antecipado à Black Friday em 26/11. Entrar é gratuito.",
    ogTitle: "Black Friday da Rook + mentoria de Planejamento Financeiro 2027",
    ogDescription:
      "Para donos de restaurante: mentoria de Planejamento Financeiro 2027 exclusiva para a comunidade e acesso antecipado à Black Friday em 26/11.",
    ogAlt: "Black Friday Rook — comunidade no WhatsApp com pré-lançamento, desconto e mentoria de Planejamento Financeiro 2027.",
  },
  cta: {
    label: "Entrar na comunidade gratuita",
    pendingLabel: "Link da comunidade em breve",
    headerLabel: "Entrar na comunidade",
    trust: ["Comunidade gratuita", "No WhatsApp", "Conteúdo exclusivo toda semana"],
    paidTrust: ["Pagamento seguro na Stripe", "Primeiro mês promocional", "Renovação mensal"],
  },
  access: {
    title: "Falta só um passo",
    lead: "Preencha para entrar no grupo Black Rook 2026, dentro da comunidade da Rook no WhatsApp.",
    fields: {
      name: { label: "Nome", placeholder: "Como podemos te chamar" },
      phone: { label: "WhatsApp com DDD", placeholder: "(11) 99999-9999" },
      email: { label: "E-mail", placeholder: "voce@restaurante.com.br" },
      restaurant: { label: "Nome do restaurante", placeholder: "Ex.: Cantina da Praça" },
    },
    commercialOptIn: "Quero receber contato comercial da Rook sobre o sistema.",
    notice: {
      before:
        "Usamos estes dados para liberar sua entrada no grupo Black Rook 2026 e para falar com você sobre a Black Friday da Rook. Contato comercial sobre o sistema, só se você marcar a opção acima. Mais detalhes na ",
      linkLabel: "Política de Privacidade",
      after: ".",
    },
    noticeVersion: BF1_ACCESS_NOTICE_VERSION,
    submit: "Liberar meu acesso",
    busy: "Liberando acesso…",
    close: "Fechar",
    successTitle: "Acesso liberado",
    successBody: "Abrindo o grupo Black Rook 2026 no WhatsApp…",
    successCta: "Entrar no grupo Black Rook 2026",
    fallbackBody:
      "Não conseguimos registrar seu cadastro agora. Para você não ficar de fora, pode entrar direto no grupo.",
    fallbackCta: "Entrar no grupo mesmo assim",
  },
  hero: {
    eyebrow: "Black Rook 2026 · Para donos de restaurante",
    liveTag: "Comunidade no WhatsApp",
    headlinePlain: "Planeje 2027 com a Rook.",
    headlineEmphasis: "Mentoria exclusiva para a comunidade.",
    lead: {
      before: "",
      strong: "Planejamento Financeiro 2027",
      after:
        " com o nosso time: metas, custos e resultado do seu restaurante. E a Black Friday da Rook chega primeiro para a comunidade, em 26/11.",
    },
    secondaryLabel: "Conhecer a mentoria 2027",
    dateLabel: "Acesso antecipado · quinta, 26/11",
    dateSecondary: "Abertura para o público: sexta, 27/11 · Até 04/12, às 23h59, horário de Brasília",
    doneLabel: "O acesso antecipado já começou na comunidade",
    endLabel: "Black Rook · Até 04/12, às 23h59",
    endedLabel: "Black Rook encerrada em 04/12/2026",
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
        title: "Sem ruído",
        text: "Grupos fechados: só o time da Rook publica. Você recebe o essencial, sem enxurrada de mensagens.",
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
        text: "Exclusiva para quem está na comunidade: a estratégia e o sistema para planejar metas, custos e resultado do seu restaurante em 2027, com o nosso time. Como participar é anunciado na comunidade.",
      },
    ],
  },
  mentorship: {
    id: "mentoria",
    label: "— Exclusiva para a comunidade",
    headlinePlain: "Planejamento Financeiro ",
    headlineEmphasis: "2027.",
    lead: "A estratégia e o sistema para planejar metas, custos e resultado do seu restaurante em 2027.",
    intro:
      "Uma mentoria com o nosso time, só para quem está na comunidade, para montar o plano de 2027 do seu restaurante.",
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
    howTo: "Exclusiva para a comunidade. Como participar é anunciado lá.",
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
      { n: "2", title: "Acompanhe o pré-lançamento", text: "As condições e as datas da Black Friday saem lá primeiro. A mentoria é só para quem está na comunidade." },
      { n: "3", title: "Receba o acesso antecipado", text: "Em 26/11, você vê a oferta antes de todo mundo e decide se quer contratar." },
    ],
  },
  final: {
    id: "comunidade",
    label: "— Pré-lançamento",
    headlinePlain: "Entre antes e ",
    headlineEmphasis: "planeje 2027 com a gente.",
    text: "A comunidade da Rook continua depois da Black Friday, com conteúdo toda semana. O acesso antecipado de 26/11 começa lá, e a mentoria de Planejamento Financeiro 2027 é exclusiva para quem está na comunidade.",
  },
} as const;

export type Bf1IconName = (typeof BF1_CONTENT.benefits.items)[number]["icon"];
export type Bf1CommunityIconName = (typeof BF1_CONTENT.community.items)[number]["icon"];
export type Bf1PillarIconName = (typeof BF1_CONTENT.mentorship.pillars)[number]["icon"];
