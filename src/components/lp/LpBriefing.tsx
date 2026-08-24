import Link from "next/link";
import { BRIEFING } from "@/lib/lp-content";
import Reveal from "./LpReveal";
import { WhatsMessage, WhatsPanel } from "./LpWhatsMessage";

/**
 * O briefing da casa: o informe da operação chegando no WhatsApp.
 *
 * v6: o painel mostra só o informe SEMANAL. O diário subiu para o hero e
 * repeti-lo aqui seria imprimir o mesmo bloco de texto duas vezes na mesma
 * página — a seção rende mais ilustrando a mensagem que o hero não mostrou.
 * O texto ao lado é que cobre os três ritmos: diário, semanal e o fechamento
 * do dia 1.
 *
 * O desenho das bolhas mora em LpWhatsMessage, compartilhado com o hero.
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
          <WhatsPanel contactName={BRIEFING.contactName} contactTag={BRIEFING.contactTag}>
            {BRIEFING.messages.map((m) => (
              <WhatsMessage key={m.time} message={m} />
            ))}
          </WhatsPanel>
        </Reveal>
      </div>
    </section>
  );
}
