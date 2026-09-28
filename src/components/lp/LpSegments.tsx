import Link from "next/link";
import { SEGMENTS, type SegmentCard } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * Os segmentos (v7): um motor de dados, a leitura de cada negócio.
 *
 * Existe porque a home passou a falar com contabilidade, advocacia, saúde e
 * consultoria, e o visitante desses segmentos precisa ver o próprio nome na
 * página — e saber, sem letra miúda, que o dele ainda está a caminho. O
 * selo de status é o que impede a promessa de parecer produto pronto.
 *
 * O `id` é o destino do item "Segmentos" do cabeçalho.
 */
function SegmentCardBody({ c }: { c: SegmentCard }) {
  const disponivel = c.status === "disponivel";
  return (
    <article
      className="lp-card flex h-full flex-col p-6"
      style={disponivel ? { boxShadow: "inset 0 2px 0 rgba(229,76,0,0.45)" } : undefined}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3
          className="font-display text-xl font-bold"
          style={{ color: "var(--lp-ink)", letterSpacing: "-0.015em" }}
        >
          {c.nome}
        </h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
          style={
            disponivel
              ? { backgroundColor: "#e54c00", color: "#fff" }
              : { border: "1px solid var(--lp-line)", color: "var(--lp-muted)" }
          }
        >
          {SEGMENTS.statusLabel[c.status]}
        </span>
      </div>
      <p className="lp-label mb-1">{SEGMENTS.conectaLabel}</p>
      <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--lp-ink)" }}>
        {c.conecta}
      </p>
      <p className="lp-label mb-1">{SEGMENTS.entregaLabel}</p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
        {c.entrega}
      </p>
      {c.href && (
        <p className="mt-auto pt-5 text-sm font-semibold" style={{ color: "#e54c00" }}>
          {disponivel ? SEGMENTS.linkDisponivel : SEGMENTS.linkContato}
        </p>
      )}
    </article>
  );
}

export default function LpSegments() {
  return (
    <section
      id="segmentos"
      className="lp-band scroll-mt-24 py-20 lg:py-28"
      style={{ borderTop: "1px solid var(--lp-line)" }}
      aria-labelledby="segments-title"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <p className="lp-label mb-4">{SEGMENTS.label}</p>
          <h2
            id="segments-title"
            className="mb-5 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {SEGMENTS.headlinePlain}
            <span style={{ color: "#e54c00" }}>{SEGMENTS.headlineEmphasis}</span>
          </h2>
          <p className="lp-body">{SEGMENTS.intro}</p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SEGMENTS.cards.map((c, i) => (
            <Reveal key={c.nome} delay={i * 60} as="li">
              {c.href ? (
                <Link href={c.href} className="block h-full">
                  <SegmentCardBody c={c} />
                </Link>
              ) : (
                <SegmentCardBody c={c} />
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
