import Link from "next/link";
import { CTA } from "@/lib/lp-content";

/**
 * Chamada final da home (v5): o caminho de menor atrito é o diagnóstico, sem
 * cartão. Os dois botões apontam para /diagnostico/ — o secundário existe para
 * o dono de à la carte se reconhecer no clique.
 */
export default function LpCta() {
  return (
    <section
      className="py-20 text-center lg:py-28"
      style={{ borderTop: "1px solid var(--lp-line)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <p className="lp-label mb-4">{CTA.label}</p>
        <h2
          className="mb-4 font-display font-extrabold"
          style={{
            color: "var(--lp-ink)",
            fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {CTA.headlinePlain}
          <span style={{ color: "#e54c00" }}>{CTA.headlineEmphasis}</span>
        </h2>
        <p className="lp-body mx-auto mb-8 text-center">{CTA.intro}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={CTA.primaryHref} className="btn-primary">
            {CTA.primaryLabel}
          </Link>
          <Link href={CTA.secondaryHref} className="btn-ghost">
            {CTA.secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
