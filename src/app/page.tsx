import LpHero from "@/components/lp/LpHero";
import LpFunnel from "@/components/lp/LpFunnel";
import LpManifesto from "@/components/lp/LpManifesto";
import LpPricing from "@/components/lp/LpPricing";
import LpFaq from "@/components/lp/LpFaq";
import LpCta from "@/components/lp/LpCta";

/**
 * Home — redesenho v4.
 *
 * A composição foi decidida no Claude Design a partir de três variações
 * concorrentes: a base é a "Produto vivo" (interface real dentro dos módulos)
 * com o funil das seis etapas, da variação cinematográfica, encaixado logo
 * depois do hero.
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
      <LpHero />
      <LpFunnel />
      <LpManifesto />
      <LpPricing />
      <LpFaq />
      <LpCta />
    </div>
  );
}
