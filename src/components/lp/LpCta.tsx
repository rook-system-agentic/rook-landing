import Link from "next/link";
import { CTA } from "@/lib/lp-content";

/*
 * Paleta fixa do fecho: a seção é escura NOS DOIS temas, como no preview —
 * é o contraste que encerra a página. Contrastes sobre #0c1117:
 * #eef3f8 ≈ 16:1, #b9c4cf ≈ 10:1, #ff8345 ≈ 5:1 (manchete, piso 3:1).
 */
const DARK = {
  bg: "#0c1117",
  ink: "#eef3f8",
  muted: "#b9c4cf",
  label: "#9fb0bf",
  accent: "#ff8345",
  ghostBorder: "rgba(255, 255, 255, 0.3)",
};

/**
 * Chamada final da home (v5.1): seção escura, o caminho de menor atrito é o
 * diagnóstico, sem cartão. Os dois botões apontam para /diagnostico/ — o
 * secundário existe para o dono de à la carte se reconhecer no clique.
 */
export default function LpCta() {
  return (
    <section className="py-20 text-center lg:py-28" style={{ backgroundColor: DARK.bg }}>
      <div className="mx-auto max-w-3xl px-6">
        <p
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]"
          style={{ color: DARK.label }}
        >
          {CTA.label}
        </p>
        <h2
          className="mb-4 font-display font-extrabold"
          style={{
            color: DARK.ink,
            fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {CTA.headlinePlain}
          <span style={{ color: DARK.accent }}>{CTA.headlineEmphasis}</span>
          {CTA.headlineTail}
        </h2>
        <p
          className="mx-auto mb-8 text-center text-[17px] leading-relaxed"
          style={{ color: DARK.muted, maxWidth: "540px" }}
        >
          {CTA.intro}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={CTA.primaryHref} className="btn-primary">
            {CTA.primaryLabel}
          </Link>
          <Link
            href={CTA.secondaryHref}
            className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-all hover:-translate-y-0.5"
            style={{ border: `1px solid ${DARK.ghostBorder}`, color: DARK.ink }}
          >
            {CTA.secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
