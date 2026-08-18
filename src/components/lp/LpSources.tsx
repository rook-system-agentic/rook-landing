import { DATA_SOURCES } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * De onde vêm os números: as fontes que a operação já emite e um extrato
 * bancário de exemplo com a classificação automática. O mock é estático de
 * propósito — mesma razão dos gráficos de LpDataParts: a página serve
 * renderizada e o buscador vê o mesmo que o visitante.
 */
export default function LpSources() {
  const s = DATA_SOURCES.statement;

  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="lp-label mb-4">{DATA_SOURCES.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {DATA_SOURCES.headlinePlain}
            <span style={{ color: "#e54c00" }}>{DATA_SOURCES.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-2">
            <strong className="lp-strong">{DATA_SOURCES.sub}</strong>
          </p>
          <p className="lp-body mb-6">{DATA_SOURCES.intro}</p>
          <ul className="flex flex-wrap gap-2">
            {DATA_SOURCES.tags.map((t) => (
              <li
                key={t}
                className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider"
                style={{ backgroundColor: "var(--lp-elevated)", color: "var(--lp-muted)" }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <Reveal className="lg:col-span-7">
          <article className="lp-card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="lp-label">{s.title}</p>
              <p
                className="whitespace-nowrap rounded-full px-3 py-1 font-mono text-[11px]"
                style={{ backgroundColor: "var(--lp-elevated)", color: "var(--lp-accent)" }}
              >
                {s.badge}
              </p>
            </div>
            <p className="mb-4 font-mono text-xs" style={{ color: "var(--lp-muted)" }}>
              {s.doc}
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {s.summary.map((item) => (
                <div key={item.label} className="rounded-lg p-3" style={{ backgroundColor: "var(--lp-bg)" }}>
                  <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>
                    {item.label}
                  </p>
                  <p className="font-mono text-sm font-semibold" style={{ color: "var(--lp-ink)" }}>
                    {item.value}
                  </p>
                  {"meta" in item && (
                    <p className="font-mono text-[10px]" style={{ color: "var(--lp-muted)" }}>
                      {item.meta}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p
              className="mb-1 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: "var(--lp-muted)" }}
            >
              {s.classifiedTitle}
            </p>
            <ul>
              {s.classified.map((c) => (
                <li
                  key={c.label}
                  className="flex items-baseline justify-between gap-3 py-1.5 font-mono text-[12px]"
                  style={{ borderTop: "1px solid var(--lp-line)" }}
                >
                  <span style={{ color: "var(--lp-ink)" }}>{c.label}</span>
                  <span style={{ color: "var(--lp-muted)" }}>
                    {c.txns} txns — {c.value}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
