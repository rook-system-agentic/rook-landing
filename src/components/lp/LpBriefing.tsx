import Link from "next/link";
import { BRIEFING } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/*
 * Paleta fixa do painel escuro (mesma do extrato em LpSources): o mock do
 * WhatsApp é escuro nos dois temas, como no preview aprovado.
 */
const PANEL = {
  bg: "#10151c",
  line: "rgba(255, 255, 255, 0.1)",
  inset: "rgba(255, 255, 255, 0.06)",
  ink: "#eef3f8",
  muted: "#9fb0bf",
  accent: "#ff8345",
  action: "#6fcf97",
};

/**
 * O briefing da casa: o informe diário no WhatsApp, encenado como duas
 * mensagens num painel escuro de celular. Mock estático — os "botões" das
 * mensagens são texto estilizado de propósito: um <button> de verdade num
 * mock seria um elemento focável que não faz nada.
 */
export default function LpBriefing() {
  return (
    <section className="lp-band py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="lp-label mb-4">{BRIEFING.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {BRIEFING.headlinePlain}
            <span style={{ color: "#e54c00" }}>{BRIEFING.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-8">{BRIEFING.intro}</p>
          <Link href={BRIEFING.ctaHref} className="btn-primary">
            {BRIEFING.ctaLabel}
          </Link>
          <p className="mt-4 font-mono text-xs" style={{ color: "var(--lp-muted)" }}>
            {BRIEFING.note}
          </p>
        </div>

        <Reveal className="lg:col-span-6">
          <div
            className="space-y-3 rounded-2xl p-4 sm:p-5"
            style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}
          >
            {BRIEFING.messages.map((m) => (
              <article key={m.time} className="rounded-xl p-4" style={{ backgroundColor: PANEL.inset }}>
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: PANEL.accent }}
                  >
                    Rook
                  </p>
                  <p
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: PANEL.muted }}
                  >
                    {m.time}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {m.lines.map((l) => (
                    <p
                      key={l}
                      className={`text-sm leading-relaxed ${l.includes("R$") ? "font-mono" : ""}`}
                      style={{ color: l.includes("R$") ? PANEL.ink : PANEL.muted }}
                    >
                      {l}
                    </p>
                  ))}
                </div>
                <p
                  className="mt-3 rounded-lg py-2 text-center text-sm font-semibold"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", color: PANEL.action }}
                >
                  {m.button}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
