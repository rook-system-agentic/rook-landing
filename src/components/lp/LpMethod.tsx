import { METHOD } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/** O método: coleta, interpretação, decisão — três cards textuais. */
export default function LpMethod() {
  return (
    <section className="lp-band py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <p className="lp-label mb-4">{METHOD.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {METHOD.headlinePlain}
            <span style={{ color: "#e54c00" }}>{METHOD.headlineEmphasis}</span>
          </h2>
          <p className="lp-body">{METHOD.intro}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {METHOD.cards.map((c, i) => (
            <Reveal key={c.step} delay={i * 70}>
              <article className="lp-card h-full p-6">
                <p className="lp-label mb-3">{c.step}</p>
                <h3 className="mb-2 font-display text-lg font-bold" style={{ color: "var(--lp-ink)" }}>
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                  {c.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
