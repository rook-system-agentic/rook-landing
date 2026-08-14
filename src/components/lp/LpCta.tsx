import Link from "next/link";
import { CTA } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * Os sete dias do teste, como marcas que preenchem uma a uma.
 *
 * Existe para dar corpo ao "7 dias" em vez de deixá-lo só como número no
 * texto. Decorativo — daí o `aria-hidden`: a informação já está na manchete e
 * repeti-la em leitor de tela seria ruído.
 */
function SeteDias() {
  return (
    <div className="mb-8 flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className="lp-dia h-2.5 w-2.5 rounded-full"
          style={{
            animationDelay: `${i * 90}ms`,
            backgroundColor: i === 6 ? "#e54c00" : "color-mix(in srgb, #e54c00 35%, transparent)",
          }}
        />
      ))}
    </div>
  );
}

/** Chamada final da home. */
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
        <Reveal>
          <SeteDias />
        </Reveal>
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
