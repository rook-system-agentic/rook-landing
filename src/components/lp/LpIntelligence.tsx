import Link from "next/link";
import { INTELLIGENCE } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * Inteligência viva: o Rook.AI respondendo o gestor, em dois pares de
 * pergunta e resposta, mais o bloco que explica onde essa inteligência mora.
 * Uma unidade narrativa — por isso um componente só.
 *
 * Os números das respostas fecham com EXEMPLO_DRE: 2 p.p. de CMV sobre
 * R$ 412.800 são os R$ 8.256 citados.
 */
export default function LpIntelligence() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
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
          <p className="lp-body mb-2">
            <strong className="lp-strong">{INTELLIGENCE.productSub}</strong>
          </p>
          <p className="lp-body mb-8">{INTELLIGENCE.productParagraph}</p>
          <Link href={INTELLIGENCE.ctaHref} className="btn-primary">
            {INTELLIGENCE.ctaLabel}
          </Link>
        </div>

        <div className="lg:col-span-7">
          <p
            className="mb-4 font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--lp-muted)" }}
          >
            {INTELLIGENCE.context}
          </p>
          <div className="space-y-4">
            {INTELLIGENCE.qa.map((item, i) => (
              <Reveal key={item.q} delay={i * 80}>
                <article className="lp-card p-5">
                  <p className="lp-label mb-1">Rook.AI</p>
                  <p className="mb-2 font-semibold" style={{ color: "var(--lp-ink)" }}>
                    {item.q}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                    {item.a}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
