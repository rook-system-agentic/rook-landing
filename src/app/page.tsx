import LpHero from "@/components/lp/LpHero";
import LpMethod from "@/components/lp/LpMethod";
import LpSources from "@/components/lp/LpSources";
import LpManifesto from "@/components/lp/LpManifesto";
import LpBoard from "@/components/lp/LpBoard";
import LpBriefing from "@/components/lp/LpBriefing";
import LpIntelligence from "@/components/lp/LpIntelligence";
import LpSector from "@/components/lp/LpSector";
import LpPartners from "@/components/lp/LpPartners";
import LpPricing from "@/components/lp/LpPricing";
import LpFaq from "@/components/lp/LpFaq";
import LpCta from "@/components/lp/LpCta";

/**
 * Home — redesenho v5, alinhado ao preview aprovado com Daniel em 18/08/2026.
 *
 * A ordem conta uma história: promessa (hero), prova (vitrine), método,
 * fontes de dados, a pergunta do dono (manifesto), o produto por dentro
 * (tabuleiro, briefing, inteligência), contexto de mercado (setor),
 * integrações, oferta, dúvidas e a chamada final.
 *
 * O atributo `data-lp-home` é o que aplica a paleta desta página. Ele é lido
 * por `body:has([data-lp-home])` no `globals.css`, e é assim que o Header e o
 * Footer — que vivem no layout, fora daqui — adotam a paleta nova sem que
 * nenhuma outra rota seja afetada. Remover este atributo devolve a página à
 * paleta antiga.
 *
 * Todo o texto vem de `@/lib/lp-content`.
 */
export default function HomePage() {
  return (
    <div data-lp-home>
      {/* Progresso de leitura. Puramente decorativo — daí o aria-hidden — e
          invisível onde o navegador não tem timeline de scroll no CSS. */}
      <div className="lp-progress" aria-hidden="true" />
      <LpHero />
      <LpMethod />
      <LpSources />
      <LpManifesto />
      <LpBoard />
      <LpBriefing />
      <LpIntelligence />
      <LpSector />
      <LpPartners />
      <LpPricing />
      <LpFaq />
      <LpCta />
    </div>
  );
}
