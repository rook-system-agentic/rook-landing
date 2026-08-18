import Link from "next/link";
import { HERO, HERO_PARAGRAPH, SHOWCASE } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";
import { Sparkline, CmvBar, DreLines } from "./LpDataParts";

/**
 * Hero da home (v5.1): duas colunas, como no preview aprovado — a tese à
 * esquerda, o "Tabuleiro · Casa exemplo" à direita como primeira prova.
 *
 * A manchete é "Faturar não é lucrar."; "inteligência financeira para food
 * service" é o rótulo. Os três gráficos do painel derivam de EXEMPLO_DRE
 * (ver LpDataParts), os mesmos números do tabuleiro em abas mais abaixo.
 */
function ShowcasePanel() {
  return (
    <article className="lp-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="lp-label">{SHOWCASE.label}</p>
        <p
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider"
          style={{ color: "var(--lp-muted)" }}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--lp-accent)" }}
          />
          {SHOWCASE.live}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
          <p className="lp-label mb-2">{SHOWCASE.vendas}</p>
          <Sparkline />
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
            <p className="lp-label mb-2">{SHOWCASE.cmv}</p>
            <CmvBar />
          </div>
          <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
            <p className="lp-label mb-2">{SHOWCASE.resultado}</p>
            <DreLines />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function LpHero() {
  return (
    <section className="lp-band pt-14 pb-16 lg:pt-20 lg:pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="lp-label mb-4">{HERO.label}</p>
          <h1
            className="mb-5 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2.6rem, 5.6vw, 4.8rem)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            {HERO.headlinePlain}
            <span style={{ color: "#e54c00" }}>{HERO.headlineEmphasis}</span>
          </h1>
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

        <Reveal className="lg:col-span-6">
          <ShowcasePanel />
        </Reveal>
      </div>
    </section>
  );
}
