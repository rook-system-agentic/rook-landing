import { DATA_SOURCES } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/*
 * Paleta fixa do painel escuro: o extrato é escuro NOS DOIS temas, como no
 * preview aprovado — é um documento dentro da página, não uma superfície do
 * tema. Contrastes sobre #10151c: #eef3f8 ≈ 15:1, #9fb0bf ≈ 7:1, #ff8345 ≈ 5:1.
 */
const PANEL = {
  bg: "#10151c",
  line: "rgba(255, 255, 255, 0.1)",
  inset: "rgba(255, 255, 255, 0.05)",
  ink: "#eef3f8",
  muted: "#9fb0bf",
  accent: "#ff8345",
};

/**
 * De onde vêm os números: as fontes que a operação já emite e um extrato
 * bancário de exemplo com a classificação automática, em painel escuro de
 * largura inteira. Mock estático — a página serve renderizada e o buscador vê
 * o mesmo que o visitante.
 */
export default function LpSources() {
  const s = DATA_SOURCES.statement;

  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
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

        <Reveal className="mt-10">
          <article
            className="rounded-2xl p-5 lg:p-6"
            style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p
                className="font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ color: PANEL.muted }}
              >
                {s.title}
              </p>
              <p
                className="whitespace-nowrap rounded-full px-3 py-1 font-mono text-[11px]"
                style={{ backgroundColor: PANEL.inset, color: PANEL.accent }}
              >
                {s.badge}
              </p>
            </div>
            <p className="mb-5 font-mono text-xs" style={{ color: PANEL.muted }}>
              {s.doc}
            </p>

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {s.summary.map((item) => (
                <div key={item.label} className="rounded-lg p-3" style={{ backgroundColor: PANEL.inset }}>
                  <p className="text-[11px]" style={{ color: PANEL.muted }}>
                    {item.label}
                  </p>
                  <p className="font-mono text-sm font-semibold" style={{ color: PANEL.ink }}>
                    {item.value}
                  </p>
                  {"meta" in item && (
                    <p className="font-mono text-[10px]" style={{ color: PANEL.muted }}>
                      {item.meta}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p
              className="mb-1 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: PANEL.muted }}
            >
              {s.classifiedTitle}
            </p>
            <ul>
              {s.classified.map((c) => (
                <li
                  key={c.label}
                  className="flex items-baseline justify-between gap-3 py-1.5 font-mono text-[12px]"
                  style={{ borderTop: `1px solid ${PANEL.line}` }}
                >
                  <span style={{ color: PANEL.ink }}>{c.label}</span>
                  <span style={{ color: PANEL.muted }}>
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
