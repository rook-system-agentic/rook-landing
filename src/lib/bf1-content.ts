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
 *   "sem promessa de lucro" da campanha. Desde 15/11 (ROO-1887) a página cita
 *   quantidade, janela e planos do bônus, sempre pela frase canônica abaixo;
 *   formato, duração e agendamento da mentoria saem no grupo quando definidos.
 * - Entrar na comunidade não é contratar: o texto diz "receber o acesso
 *   antecipado à oferta", nunca "garantir o desconto" (CDC, art. 30).
 * - A comunidade é permanente: o valor de toda semana (seção `community`) vem
 *   antes da campanha. Origem: feedback da Isa e da Gabriela em 10/11/2026.
 * - ROO-1876 (13/11/2026): o hero diz para quem é a página ("Para donos de
 *   restaurante"), porque "Black Friday" sozinho atrai quem procura desconto de
 *   consumo — era o perfil do clique barato da campanha de 12/11. A frase
 *   "mentoria exclusiva para a comunidade" desta issue foi SUBSTITUÍDA em 15/11
 *   (ROO-1887, abaixo).
 * - ROO-1887 (correção do Gabriel em 15/11/2026 08:39): a mentoria NÃO é
 *   benefício de quem entra no grupo. É BÔNUS para quem CONTRATA a Rook na
 *   Black Friday, para os primeiros restaurantes. O grupo vale pelo acesso
 *   antecipado (a oferta abre lá em 26/11, um dia antes do público). Regras de
 *   10/11 (bf1/comunidade-wpp/PLANO-COMUNIDADE.md): todo texto que cita o bônus
 *   traz quantidade e prazo; a ordem é a confirmação do pagamento, sem critério
 *   subjetivo; sem linguagem de corrida ("corra", "seja o primeiro").
 *   Direção do Gabriel (15/11 08:51): "explicar menos como será". Dois ganchos:
 *   (1) "um preço nunca praticado antes pela Rook" — o preço de 26/11 (só no
 *   servidor, ROO-1857) fica abaixo de todo preço pago do catálogo de planos.
 *   O teste grátis de 7 dias não é preço. (2) "os
 *   primeiros terão a possibilidade de uma mentoria exclusiva com os donos da
 *   Rook, os responsáveis pela reestruturação de dezenas de empresas" (fonte da
 *   frase "dezenas de empresas": Gabriel, 15/11). A mecânica do bônus aparece
 *   numa linha só (`BF1_MENTORSHIP_BONUS_RULE`), com o prazo; a quantidade, se
 *   o Gabriel definir, vive só em `BF1_MENTORSHIP_BONUS_QUANTITY`.
 * - O "Plano 2027" da seção da mentoria é ilustrativo (sem valores em reais) e
 *   está marcado como tal.
 * - A conversa da comunidade no hero é prévia ilustrativa, sem telefone
 *   (ver tests/mock-whatsapp-sem-telefone.test.mjs) e marcada como tal.
 * - Cadastro antes do grupo (ROO-1848, decisão do Gabriel em 11/11/2026): o CTA
 *   pede nome, WhatsApp, e-mail e restaurante e só então abre o grupo Black
 *   Rook 2026. O aviso (`access.notice`) diz a finalidade; contato comercial só
 *   com a caixa marcada (desmarcada por padrão). Mudou o aviso, sobe
 *   BF1_ACCESS_NOTICE_VERSION em bf1-access-validation.mjs.
 * - Pitch de 15/11/2026 (pedido do Gabriel: "falar da mentoria direcionando os
 *   benefícios desta Black Friday"). A página abre pelo que a pessoa leva no
 *   grupo — mentoria primeiro, depois o acesso antecipado e a condição — e a
 *   seção da mentoria liga o plano de 2027 à Black Friday (`mentorship.bridge`).
 *   O CTA diz a ação real ("Entrar no grupo Black Rook"), igual ao anúncio
 *   ("faça seu cadastro e entre no grupo"); a mentoria vem na linha de
 *   confiança. Diagnóstico de 14/11: o botão falava de "comunidade gratuita"
 *   enquanto o anúncio prometia a mentoria. Preço continua fora deste módulo.
 * - Quem somos (Gabriel, 15/11 09:03: "poucas pessoas conhecem a rook ...
 *   precisamos ... falar quem nós somos"). O visitante vem do anúncio sem
 *   conhecer a marca: o hero diz em uma frase o que a Rook é antes da oferta, e
 *   a seção `history` ("Quem é a Rook") vem logo depois do hero. A frase "mostra,
 *   todo dia, em reais, quanto sobrou" e o resumo das 7h no WhatsApp são os da
 *   home (www.rook.com.br, lida em 15/11).
 */
import { BF1_ACCESS_NOTICE_VERSION } from "./bf1-access-validation.mjs";

/**
 * Quantidade de contratações com o bônus da mentoria (ROO-1887). Único lugar do
 * número; `null` enquanto o Gabriel não definir (a página diz "os primeiros").
 */
export const BF1_MENTORSHIP_BONUS_QUANTITY: number | null = null;
/** A linha única com a mecânica do bônus: ordem de confirmação, prazo e planos. */
export const BF1_MENTORSHIP_BONUS_RULE = `Bônus para as primeiras${BF1_MENTORSHIP_BONUS_QUANTITY ? ` ${BF1_MENTORSHIP_BONUS_QUANTITY}` : ""} contratações confirmadas entre 26/11 e 04/12, às 23h59 (horário de Brasília), nos planos Knight ou Rook. Regras completas no grupo Black Rook 2026.`;
/** O gancho da mentoria, igual em toda a página. */
export const BF1_MENTORSHIP_HOOK = "mentoria exclusiva com os donos da Rook";

export const BF1_CONTENT = {
  meta: {
    title: "Black Friday da Rook: um preço nunca praticado | Rook System",
    description:
      "A Rook é o sistema que mostra, todo dia, quanto sobrou no seu restaurante. Na Black Friday, um preço nunca praticado abre primeiro no grupo Black Rook 2026, em 26/11.",
    ogTitle: "Black Friday da Rook: um preço nunca praticado antes",
    ogDescription:
      "O sistema que mostra, todo dia, quanto sobrou no seu restaurante. A oferta abre primeiro no grupo Black Rook 2026, na quinta, 26/11.",
    ogAlt: "Black Friday Rook — grupo no WhatsApp com acesso antecipado à oferta, em 26/11.",
  },
  cta: {
    label: "Entrar no grupo Black Rook",
    pendingLabel: "Link da comunidade em breve",
    headerLabel: "Entrar no grupo",
    trust: ["Cadastro gratuito", "Acesso antecipado em 26/11", "Preço nunca praticado"],
    paidTrust: ["Pagamento seguro na Stripe", "Primeiro mês promocional", "Renovação mensal"],
  },
  access: {
    title: "Falta só um passo",
    // ROO-1921 (17/11): uma linha só, para o formulário caber no celular.
    lead: "A Black Friday da Rook abre primeiro no grupo, na quinta, 26/11.",
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
    headlinePlain: "Black Friday da Rook:",
    headlineEmphasis: "um preço nunca praticado antes.",
    // Gabriel, 15/11 22:33: responde ao gancho do anúncio ("o preço já foi decidido").
    // Só antes de 26/11: o servidor remove a linha nas fases seguintes.
    // Verdade do código: a página mostra o preço a todos em 26/11; o grupo contrata
    // em 26/11 e o checkout público abre em 27/11 (regra das fases no servidor).
    reveal: "O preço é revelado na quinta, 26/11, e quem está no grupo contrata antes do público.",
    lead: {
      before: "A Rook é o sistema que mostra, todo dia, em reais, quanto sobrou no seu restaurante. E os primeiros restaurantes a contratar terão a possibilidade de uma ",
      strong: BF1_MENTORSHIP_HOOK,
      after: ".",
    },
    secondaryLabel: "Quem é a Rook",
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
        tag: "Mentoria",
        text: "Os primeiros a contratar na Black terão a possibilidade de uma mentoria exclusiva com os donos da Rook.",
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
    label: "— Black Rook 2026",
    headlinePlain: "Três motivos para ",
    headlineEmphasis: "entrar antes.",
    items: [
      {
        n: "01",
        icon: "tag",
        title: "Um preço nunca praticado",
        text: "A Black Friday da Rook traz um preço que a Rook nunca praticou. Ele é revelado no grupo em 26/11.",
      },
      {
        n: "02",
        icon: "clock",
        title: "Acesso antecipado em 26/11",
        text: "A oferta sai primeiro no grupo, na quinta, 26/11. O público só vê na sexta, 27/11.",
      },
      {
        n: "03",
        icon: "mentor",
        title: "Mentoria com os donos da Rook",
        text: "Os primeiros a contratar terão a possibilidade de uma mentoria exclusiva com os responsáveis pela reestruturação de dezenas de empresas.",
      },
    ],
  },
  mentorship: {
    id: "mentoria",
    label: "— Bônus para os primeiros",
    headlinePlain: "Mentoria com os ",
    headlineEmphasis: "donos da Rook.",
    lead: "Planejamento Financeiro 2027: a estratégia e o sistema para planejar metas, custos e resultado do seu restaurante.",
    intro:
      "Os primeiros restaurantes a contratar na Black Friday terão a possibilidade de uma mentoria exclusiva com os donos da Rook, os responsáveis pela reestruturação de dezenas de empresas.",
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
    proof: "Em 2025, a consultoria de reestruturação dos donos da Rook atendeu empresas que somam R$ 925 milhões de faturamento anual.",
    bridge: "E o preço da Black, nunca praticado antes pela Rook, abre primeiro no grupo, em 26/11.",
    howTo: BF1_MENTORSHIP_BONUS_RULE,
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
    label: "— Quem é a Rook",
    headlinePlain: "Antes de virar sistema, ",
    headlineEmphasis: "foi consultoria.",
    stat: { value: "R$ 925 milhões", caption: "de faturamento anual somado pelas empresas atendidas pela nossa consultoria em 2025." },
    paragraphs: [
      "A Rook nasceu de 20 anos de consultoria em controladoria, finanças corporativas e reestruturação de empresas. Só em 2025, nossa consultoria de reestruturação atendeu empresas que somam R$ 925 milhões de faturamento por ano.",
      "Esse método hoje roda de forma automatizada na gestão de restaurantes. A Rook conecta as vendas, as notas e o banco da casa e mostra, em reais, quanto sobrou e qual é a próxima decisão.",
      "Todo dia, às 7h, o resumo do restaurante chega no seu WhatsApp: faturamento, compras e quanto ainda cabe no orçamento do mês.",
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
      { n: "1", title: "Faça o cadastro", text: "Nome, WhatsApp, e-mail e restaurante. É gratuito e abre o grupo Black Rook 2026 na hora." },
      { n: "2", title: "Acompanhe o grupo", text: "Lá saem os conteúdos da semana e, em 26/11, a oferta da Black Friday." },
      { n: "3", title: "Receba o acesso antecipado", text: "Em 26/11, você vê o preço antes de todo mundo e decide se quer contratar." },
    ],
  },
  final: {
    id: "comunidade",
    label: "— Pré-lançamento",
    headlinePlain: "Entre antes e ",
    headlineEmphasis: "veja o preço primeiro.",
    text: "Cadastro gratuito. A Black Friday da Rook abre no grupo Black Rook 2026 em 26/11, um dia antes do público, com um preço nunca praticado antes pela Rook. Depois da Black, a comunidade continua com conteúdo toda semana.",
  },
} as const;

export type Bf1IconName = (typeof BF1_CONTENT.benefits.items)[number]["icon"];
export type Bf1CommunityIconName = (typeof BF1_CONTENT.community.items)[number]["icon"];
export type Bf1PillarIconName = (typeof BF1_CONTENT.mentorship.pillars)[number]["icon"];
