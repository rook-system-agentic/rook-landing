import { METHOD, SHOWCASE } from "@/lib/lp-content";
import Reveal from "./LpReveal";
import { Sparkline, CmvBar, DreLines } from "./LpDataParts";

/**
 * Como funciona: conecta, enxerga, decide.
 *
 * v6, duas mudanças:
 *
 *   O TEXTO deixou de descrever o método pelo nome interno das etapas
 *   ("Coleta. Interpreta. Decide.", "Seis etapas, um diagnóstico") e passou a
 *   dizer o que cada passo faz pelo dono. As siglas de fonte de dados saíram
 *   do corpo e viraram os crachás no rodapé da seção — quem não sabe o que é
 *   SEFAZ lê "suas notas" ao lado.
 *
 *   O TABULEIRO desceu do hero para cá, como prova do passo "Enxerga". É o
 *   mesmo card de antes, com os mesmos números derivados de EXEMPLO_DRE; o que
 *   mudou é que agora ele aparece DEPOIS de a página explicar o que ele é.
 *
 * A numeração 1·2·3 nos cards não é enfeite: os passos acontecem nessa ordem e
 * um depende do anterior.
 */
function ShowcasePanel() {
  return (
    <article className="lp-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="lp-label">{SHOWCASE.label}</p>
        <p
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider"
          style={{ color: "var(--lp-muted)" }}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--lp-accent)" }}
          />
          {SHOWCASE.live}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Coluna flex: é o que deixa o gráfico ocupar a altura toda do card,
            que a grade estica até a altura da coluna ao lado. */}
        <div className="flex flex-col rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
          <p className="lp-label mb-2">{SHOWCASE.vendas}</p>
          <Sparkline />
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
            <p className="lp-label mb-2">{SHOWCASE.cmv}</p>
            <CmvBar />
          </div>
          <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
            <p className="lp-label mb-2">{SHOWCASE.resultado}</p>
            <DreLines />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function LpMethod() {
  return (
    <section className="lp-band py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <p className="lp-label mb-4">{METHOD.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {METHOD.headlinePlain}
            <span style={{ color: "#e54c00" }}>{METHOD.headlineEmphasis}</span>
          </h2>
          <p className="lp-body">{METHOD.intro}</p>
        </div>

        <ol className="grid gap-5 lg:grid-cols-3">
          {METHOD.cards.map((c, i) => (
            <Reveal key={c.step} delay={i * 70} as="li">
              <article className="lp-card h-full p-6">
                <p className="lp-label mb-3">{c.step}</p>
                <h3 className="mb-2 font-display text-lg font-bold" style={{ color: "var(--lp-ink)" }}>
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                  {c.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </ol>

        {/* A prova do passo 2: o tabuleiro da casa exemplo. */}
        <Reveal className="mt-8">
          <ShowcasePanel />
        </Reveal>

        {/* Os crachás: a sigla existe para dar credibilidade, o texto ao lado
            existe para que ela não exclua quem não a conhece. */}
        <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {METHOD.credentials.map((c) => (
            <li key={c.sigla} className="font-mono text-[11px] uppercase tracking-wider">
              <span style={{ color: "var(--lp-ink)" }}>{c.sigla}</span>{" "}
              <span style={{ color: "var(--lp-muted)" }}>· {c.o_que}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
