import Link from "next/link";
import { INTELLIGENCE } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/*
 * Paleta fixa do painel escuro (mesma dos mocks de LpSources e LpBriefing):
 * o chat do Rook.AI é escuro nos dois temas, como no preview aprovado.
 */
const PANEL = {
  bg: "#10151c",
  line: "rgba(255, 255, 255, 0.1)",
  inset: "rgba(255, 255, 255, 0.06)",
  ink: "#eef3f8",
  muted: "#9fb0bf",
  accent: "#ff8345",
};

/**
 * Inteligência viva: o chat escuro do Rook.AI à esquerda, o argumento à
 * direita — espelhado como no preview. Os números das respostas fecham com
 * EXEMPLO_DRE: 2 p.p. de CMV sobre R$ 412.800 são os R$ 8.256 citados.
 */
export default function LpIntelligence() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7 lg:order-first">
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}
          >
            <p
              className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: PANEL.muted }}
            >
              {INTELLIGENCE.context}
            </p>
            <div className="space-y-3">
              {INTELLIGENCE.qa.map((item) => (
                <article key={item.q} className="rounded-xl p-4" style={{ backgroundColor: PANEL.inset }}>
                  <p
                    className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: PANEL.accent }}
                  >
                    Rook.AI
                  </p>
                  <p className="mb-2 font-semibold" style={{ color: PANEL.ink }}>
                    {item.q}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: PANEL.muted }}>
                    {item.a}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-5">
          <p className="lp-label mb-4">{INTELLIGENCE.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {INTELLIGENCE.headlinePlain}
            <span style={{ color: "#e54c00" }}>{INTELLIGENCE.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-8">{INTELLIGENCE.productParagraph}</p>
          <Link href={INTELLIGENCE.ctaHref} className="btn-primary">
            {INTELLIGENCE.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
