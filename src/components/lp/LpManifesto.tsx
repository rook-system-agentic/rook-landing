import { MANIFESTO, MANIFESTO_PARAGRAPHS, CONTRASTS } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";
import LpGapChart from "./LpGapChart";

/**
 * Manifesto.
 *
 * Os três contrastes viram balanças: os dois lados do "≠" ficam em blocos
 * separados, e a separação é o argumento. O lado direito — o que importa — é
 * o que recebe o terracota.
 */
export default function LpManifesto() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Texto e gráfico lado a lado: a seção afirma que receita e lucro são
            coisas diferentes, e o gráfico mostra a distância entre as duas. */}
        <div className="mb-12 grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="lp-label mb-4">{MANIFESTO.label}</p>
          <h2
            className="mb-6 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {MANIFESTO.headlinePlain}
            <span style={{ color: "#e54c00" }}>{MANIFESTO.headlineEmphasis}</span>
            {MANIFESTO.headlineTail}
          </h2>
            <div className="space-y-4">
              {MANIFESTO_PARAGRAPHS.map((p, i) => (
                <p key={i} className="lp-body">
                  <Rich paragraph={p} />
                </p>
              ))}
            </div>
          </div>

          <Reveal className="lg:col-span-5">
            <LpGapChart />
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {CONTRASTS.map((item, i) => {
            const [left, right] = item.contrast.split("≠").map((s) => s.trim());
            return (
              <Reveal key={item.contrast} delay={i * 70}>
                <article className="lp-card h-full p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="flex-1 rounded-lg py-2 text-center text-sm font-semibold"
                      style={{ backgroundColor: "var(--lp-elevated)", color: "var(--lp-muted)" }}
                    >
                      {left}
                    </span>
                    <span aria-hidden="true" className="font-mono text-lg" style={{ color: "#e54c00" }}>
                      ≠
                    </span>
                    <span
                      className="flex-1 rounded-lg py-2 text-center text-sm font-semibold"
                      style={{ backgroundColor: "#e54c00", color: "#ffffff" }}
                    >
                      {right}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                    {item.desc}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
