import { SECTOR, SECTOR_STATS } from "@/lib/lp-content";
import Reveal from "./LpReveal";
import LpCountUp from "./LpCountUp";

/**
 * O setor em que o Rook opera: os quatro números de mercado, cada um com sua
 * fonte. Vieram do hero no redesenho v5 — lá em cima o argumento agora é a
 * promessa e a vitrine; a estatística entra aqui, como contexto, antes da
 * oferta.
 */
export default function LpSector() {
  return (
    <section className="lp-band py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Sem manchete, como no preview: o rótulo apresenta e os números falam. */}
        <p className="lp-label mb-8">{SECTOR.label}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTOR_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div
                className="lp-card h-full px-5 pb-4 pt-[18px]"
                style={{ boxShadow: "inset 0 2px 0 rgba(229,76,0,0.45)" }}
              >
                <p
                  className="font-mono font-bold"
                  style={{
                    color: "#e54c00",
                    fontSize: "clamp(1.6rem, 2.6vw, 2.4rem)",
                    lineHeight: 1.1,
                  }}
                >
                  {/* Renderiza o valor final no HTML servido; a contagem só
                      assume depois de montar. Ver LpCountUp. */}
                  <LpCountUp value={s.value} />
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--lp-ink)" }}>
                  {s.label}
                </p>
                <p
                  className="mt-0.5 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--lp-muted)" }}
                >
                  {s.source}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
