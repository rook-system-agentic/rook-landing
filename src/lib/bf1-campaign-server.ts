import "server-only";
import { BF1_CONTENT, BF1_MENTORSHIP_BONUS_RULE, BF1_MENTORSHIP_HOOK } from "./bf1-content";
import { buildBf1OfferPresentation } from "./bf1-offer-presentation.mjs";

/*
 * Textos com data fora do corpo da página (ROO-1922, 17/11): o topo
 * do formulário, a prévia do grupo e os metadados liam o texto fixo do
 * pré-lançamento e continuariam dizendo "abre na quinta, 26/11" depois de 26/11.
 * Um aviso por fase, usado nos três lugares.
 */
const BF1_PHASE_NOTICE = {
  early: "Hoje, 26/11, o acesso antecipado está liberado no grupo.",
  ended: "A Black Rook terminou. A comunidade continua com conteúdo toda semana.",
} as const;

/** A página dinâmica resolve a fase no servidor; a oferta futura não vai no HTML. */
export function getBf1CampaignContent(nowMs = Date.now()) {
  const presentation = buildBf1OfferPresentation(nowMs);
  if (presentation.phase === "upcoming") return { content: BF1_CONTENT, ...presentation };
  const ended = presentation.phase === "ended";
  const notice = presentation.phase === "early"
    ? BF1_PHASE_NOTICE.early
    : ended
      ? BF1_PHASE_NOTICE.ended
      : presentation.offer!.period;
  return {
    ...presentation,
    content: {
      ...BF1_CONTENT,
      meta: {
        ...BF1_CONTENT.meta,
        title: ended ? "Black Rook 2026 encerrada | Rook System" : BF1_CONTENT.meta.title,
        description: ended
          ? notice
          : `A Rook é o sistema que mostra, todo dia, quanto sobrou no seu restaurante. ${notice}`,
        ogTitle: ended ? "A Black Rook terminou. A comunidade continua." : BF1_CONTENT.meta.ogTitle,
        ogDescription: ended
          ? notice
          : `O sistema que mostra, todo dia, quanto sobrou no seu restaurante. ${notice}`,
      },
      access: { ...BF1_CONTENT.access, lead: notice },
      preview: {
        ...BF1_CONTENT.preview,
        subtitle: ended ? "Avisos · conteúdo" : "Avisos · conteúdo e Black Rook",
        // Depois de 04/12 o bônus não está mais aberto: a bolha da mentoria sai.
        messages: BF1_CONTENT.preview.messages
          .filter((message) => !(ended && message.tag === "Mentoria"))
          .map((message) => (message.tag === "Aviso" ? { ...message, text: notice } : message)),
      },
      // Antes da Black a linha cita 26/11; depois ela precisa continuar verdadeira.
      cta: {
        ...BF1_CONTENT.cta,
        trust: ended
          ? ["Comunidade gratuita", "No WhatsApp", "Conteúdo toda semana"]
          : ["Cadastro gratuito", "Acesso antecipado liberado", "Preço nunca praticado"],
      },
      hero: {
        ...BF1_CONTENT.hero,
        eyebrow: ended ? "Black Friday Rook · Encerrada" : "Black Friday Rook",
        headlinePlain: ended ? "A Black Rook terminou." : "Black Rook:",
        headlineEmphasis: ended ? "A comunidade continua." : presentation.offer!.title,
        // A partir de 26/11 o preço já está no título: a linha "é revelado na quinta" sai.
        reveal: null,
        lead: {
          before: ended
            ? "A oferta de Black Friday foi encerrada em 04/12/2026. A comunidade da Rook continua com conteúdos sobre custos, caixa e gestão de restaurantes. A "
            : "A Rook é o sistema que mostra, todo dia, em reais, quanto sobrou no seu restaurante. E os primeiros a contratar terão a possibilidade de uma ",
          strong: BF1_MENTORSHIP_HOOK,
          after: ended ? " segue com os restaurantes que receberam o bônus." : ".",
        },
      },
      benefits: {
        ...BF1_CONTENT.benefits,
        label: "— A comunidade da Rook",
        headlinePlain: "Conteúdo e clareza para ",
        headlineEmphasis: "os próximos passos.",
        // A oferta entra nos cartões de acesso (clock) e condição (tag); o bônus (mentor) fica no passado depois de 04/12.
        items: BF1_CONTENT.benefits.items.map((item) => item.icon === "mentor" && ended ? {
          ...item,
          title: "Mentoria Planejamento Financeiro 2027",
          text: "O bônus da Black Rook 2026 valeu para as primeiras contratações confirmadas até 04/12.",
        } : item.icon === "clock" ? {
          ...item,
          title: ended ? "A comunidade continua" : "Acesso à Black Rook",
          text: ended
            ? "A campanha terminou em 04/12. Os conteúdos sobre gestão de restaurantes continuam na comunidade."
            : presentation.offer!.period,
        } : item.icon === "tag" ? {
          ...item,
          title: ended ? "Condição encerrada" : presentation.offer!.title,
          text: ended
            ? "Novas contratações seguem os preços regulares do plano, conforme a faixa de faturamento do restaurante."
            : presentation.offer!.terms,
        } : item),
      },
      mentorship: {
        ...BF1_CONTENT.mentorship,
        bridge: ended
          ? ""
          : "A Black Rook está aberta. O bônus segue a ordem de confirmação das contratações.",
        howTo: ended
          ? "O bônus valeu para as primeiras contratações confirmadas na Black Rook 2026."
          : BF1_CONTENT.mentorship.howTo,
      },
      steps: {
        ...BF1_CONTENT.steps,
        headlinePlain: "Faça parte da ",
        headlineEmphasis: "comunidade.",
        items: [
          BF1_CONTENT.steps.items[0],
          { n: "2", title: "Acompanhe os conteúdos", text: "Receba os conteúdos sobre gestão de restaurantes." },
          { n: "3", title: ended ? "Conheça a Rook" : "Conheça a oferta", text: ended ? "Conheça a plataforma e escolha o plano adequado à sua operação." : "Confira as condições e os valores da assinatura antes de decidir pela contratação." },
        ],
      },
      final: {
        ...BF1_CONTENT.final,
        label: presentation.phase === "public" ? "— Black Rook" : "— Comunidade da Rook",
        headlinePlain: presentation.phase === "public" ? "Comece com mais " : "Entre na comunidade e ",
        headlineEmphasis: presentation.phase === "public" ? "visão e controle." : ended ? "acompanhe toda semana." : "aproveite o acesso antecipado.",
        text: presentation.phase === "public"
          ? `${presentation.offer!.terms} ${BF1_MENTORSHIP_BONUS_RULE}`
          : ended
            ? "A comunidade da Rook continua depois da Black Friday, com conteúdo toda semana."
            : `Acesso antecipado liberado no grupo. ${BF1_MENTORSHIP_BONUS_RULE}`,
      },
    },
  };
}
