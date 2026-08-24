import { MANIFESTO, MANIFESTO_PARAGRAPHS, PAINS } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";
import LpGapChart from "./LpGapChart";

/**
 * A dor espelhada.
 *
 * v6: os três cards eram balanças — "Receita ≠ Lucro", "Movimento ≠ Margem",
 * "Dívida ≠ Estratégia". O argumento era bom e continua idêntico; o que saiu
 * foi a notação. Um público que a própria página descreve como controlando no
 * caderno (39%) não lê "≠" como retórica, lê como matemática — e matemática é
 * exatamente o que ele evita.
 *
 * No lugar, a frase que o dono diz em voz alta: "Vendeu bem e não sobrou?".
 * O gráfico ao lado (LpGapChart) continua mostrando a distância entre receita
 * e lucro, que é o que a seção afirma.
 */
export default function LpManifesto() {
  return (
    <section className="lp-band py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
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

        <ul className="grid gap-5 lg:grid-cols-3">
          {PAINS.map((item, i) => (
            <Reveal key={item.title} delay={i * 70} as="li">
              <article className="lp-card h-full p-6">
                <h3
                  className="mb-3 font-display text-xl font-bold"
                  style={{ color: "var(--lp-ink)", letterSpacing: "-0.015em" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                  {item.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
