import { FAQ, FAQ_ITEMS, CONTACT_EMAIL } from "@/lib/lp-content";

/**
 * FAQ.
 *
 * Continua em `<details>` nativo. Não é detalhe de implementação: é o que faz
 * o buscador ler as respostas e indexá-las. Trocar por um acordeão controlado
 * por JavaScript custaria tráfego orgânico — a animação de abertura vive no
 * `globals.css`, via `::details-content`, onde o navegador suporta.
 *
 * Sem `<Reveal>` aqui de propósito: envolver cada `<details>` num wrapper
 * cliente atrasaria a primeira pintura de nove blocos de texto que o buscador
 * precisa ver.
 */
export default function LpFaq() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="lp-label mb-4">{FAQ.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {FAQ.headlinePlain}
            <span style={{ color: "#e54c00" }}>{FAQ.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-6">{FAQ.intro}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn-ghost text-sm">
            {FAQ.ctaLabel}
          </a>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((f) => (
            <details key={f.q} className="lp-card group p-5">
              <summary
                className="flex cursor-pointer items-center justify-between gap-4 font-semibold"
                style={{ color: "var(--lp-ink)" }}
              >
                {f.q}
                <span
                  aria-hidden="true"
                  className="text-xl transition-transform group-open:rotate-45"
                  style={{ color: "#e54c00" }}
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                {f.a}
              </p>
              {f.cta && (
                <a
                  href={f.cta.href}
                  className="mt-3 inline-block text-sm underline underline-offset-4"
                  style={{ color: "var(--lp-accent)" }}
                >
                  {f.cta.label}
                </a>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
