import Link from "next/link";
import { HERO, HERO_PARAGRAPH } from "@/lib/lp-content";
import Rich from "./LpRich";

/**
 * Hero da home (v5): manchete, a tese em uma linha, um parágrafo e dois CTAs.
 *
 * As estatísticas do setor e os módulos com gráficos que moravam aqui foram
 * para as suas próprias seções — LpSector e LpShowcase. O hero volta a ter um
 * trabalho só: dizer o que o Rook é e para onde ir.
 */
export default function LpHero() {
  return (
    <section className="pt-14 pb-14 lg:pt-20 lg:pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-4xl">
          <h1
            className="mb-5 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2.6rem, 6.4vw, 5.2rem)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            {HERO.headlinePlain}
            <span style={{ color: "#e54c00" }}>{HERO.headlineEmphasis}</span>
          </h1>
          <p
            className="mb-4 font-display text-xl font-bold lg:text-2xl"
            style={{ color: "var(--lp-ink)" }}
          >
            {HERO.sub}
          </p>
          <p className="lp-body mb-8">
            <Rich paragraph={HERO_PARAGRAPH} />
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={HERO.primaryHref} className="btn-primary">
              {HERO.primaryLabel}
            </Link>
            <Link href={HERO.secondaryHref} className="btn-ghost">
              {HERO.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
