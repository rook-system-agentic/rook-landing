import "server-only";
import { BF1_CONTENT } from "./bf1-content";
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
      hero: {
        ...BF1_CONTENT.hero,
        eyebrow: ended ? "Black Friday Rook · Encerrada" : "Black Friday Rook",
        headlinePlain: ended ? "A Black Rook terminou." : "Black Rook:",
        headlineEmphasis: ended ? "A comunidade continua." : presentation.offer!.title,
        lead: {
          before: ended
            ? "A oferta de Black Friday foi encerrada em 04/12/2026. A comunidade da Rook continua com conteúdos sobre custos, caixa e gestão de restaurantes. Acompanhe também as informações sobre a mentoria de "
            : "Mais visão e controle para decidir os próximos passos do seu restaurante. Entre na comunidade e acompanhe a Black Rook e a mentoria de ",
          strong: "Planejamento Financeiro 2027",
          after: ".",
        },
      },
      benefits: {
        ...BF1_CONTENT.benefits,
        label: "— A comunidade da Rook",
        headlinePlain: "Conteúdo e clareza para ",
        headlineEmphasis: "os próximos passos.",
        items: BF1_CONTENT.benefits.items.map((item) => item.n === "01" ? {
          ...item,
          title: ended ? "A comunidade continua" : "Acesso à Black Rook",
          text: ended
            ? "A campanha terminou em 04/12. Os conteúdos sobre gestão de restaurantes continuam na comunidade."
            : presentation.offer!.period,
        } : item.n === "02" ? {
          ...item,
          title: ended ? "Condição encerrada" : presentation.offer!.title,
          text: ended
            ? "Novas contratações seguem os preços regulares do plano, conforme a faixa de faturamento do restaurante."
            : presentation.offer!.terms,
        } : item),
      },
      steps: {
        ...BF1_CONTENT.steps,
        headlinePlain: "Faça parte da ",
        headlineEmphasis: "comunidade.",
        items: [
          BF1_CONTENT.steps.items[0],
          { n: "2", title: "Acompanhe os conteúdos", text: "Receba os conteúdos sobre gestão de restaurantes e as informações da mentoria." },
          { n: "3", title: ended ? "Conheça a Rook" : "Conheça a oferta", text: ended ? "Conheça a plataforma e escolha o plano adequado à sua operação." : "Confira as condições e os valores da assinatura antes de decidir pela contratação." },
        ],
      },
      final: {
        ...BF1_CONTENT.final,
        label: presentation.phase === "public" ? "— Black Rook" : "— Comunidade da Rook",
        headlinePlain: presentation.phase === "public" ? "Comece com mais " : "Entre na comunidade e ",
        headlineEmphasis: presentation.phase === "public" ? "visão e controle." : BF1_CONTENT.final.headlineEmphasis,
        text: presentation.phase === "public" ? presentation.offer!.terms : "A comunidade da Rook continua depois da Black Friday, com conteúdo toda semana. Acompanhe as informações sobre a mentoria de Planejamento Financeiro 2027.",
      },
    },
  };
}
