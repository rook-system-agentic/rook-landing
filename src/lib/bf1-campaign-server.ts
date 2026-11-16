import "server-only";
import { BF1_CONTENT, BF1_MENTORSHIP_BONUS_RULE, BF1_MENTORSHIP_HOOK } from "./bf1-content";
import { buildBf1OfferPresentation } from "./bf1-offer-presentation.mjs";

/** A página dinâmica resolve a fase no servidor; a oferta futura não vai no HTML. */
export function getBf1CampaignContent(nowMs = Date.now()) {
  const presentation = buildBf1OfferPresentation(nowMs);
  if (presentation.phase === "upcoming") return { content: BF1_CONTENT, ...presentation };
  const ended = presentation.phase === "ended";
  return {
    ...presentation,
    content: {
      ...BF1_CONTENT,
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
