import { HERO, HERO_PARAGRAPH, SECTOR_STATS, MODULES } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";
import { MODULE_VISUALS } from "./LpDataParts";

/**
 * Hero da home.
 *
 * Cada um dos quatro módulos carrega uma peça de interface real acima da lista.
 * A lista NÃO foi substituída: os treze bullets continuam inteiros abaixo de
 * cada gráfico. O gráfico ilustra a promessa; o texto continua sendo quem a faz.
 *
 * Os quatro números do setor viram cartões com régua terracota no topo — o
 * mesmo vocabulário dos módulos ao lado, para as duas colunas lerem como uma
 * coisa só.
 */
export default function LpHero() {
  return (
    <section className="pt-10 pb-20 lg:pt-12 lg:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        {/*
          `items-start`: a coluna direita tem quatro módulos com gráfico e fica
          bem mais alta que a esquerda. Esticar a esquerda para acompanhar (o
          que o desenho original tentava, com content-evenly) não preenche o
          vão — abre um buraco entre o parágrafo e os números. Cada coluna
          termina na sua própria altura.
        */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Coluna esquerda: tese e números do setor */}
          <div>
            <p className="lp-label mb-4">{HERO.label}</p>
            <h1
              className="mb-5 font-display font-extrabold"
              style={{
                color: "var(--lp-ink)",
                fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)",
                lineHeight: 1,
                letterSpacing: "-0.035em",
              }}
            >
              {HERO.headlinePlain}
              <span style={{ color: "#e54c00" }}>{HERO.headlineEmphasis}</span>
            </h1>
            <p className="lp-body mb-5">
              <Rich paragraph={HERO_PARAGRAPH} />
            </p>
            <p className="font-mono text-xs" style={{ color: "var(--lp-muted)", opacity: 0.7 }}>
              {HERO.sourcesLine}
            </p>

            {/* Uma coluna no celular: em duas, "R$ 495 bi" quebra no meio. */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      {s.value}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--lp-ink)" }}>
                      {s.label}
                    </p>
                    <p
                      className="mt-0.5 font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--lp-muted)", opacity: 0.7 }}
                    >
                      {s.source}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Coluna direita: os quatro módulos, cada um com sua peça de interface */}
          <div className="grid grid-cols-1 gap-4">
            {MODULES.map((m, i) => {
              const Visual = MODULE_VISUALS[i];
              return (
                <Reveal key={m.title} delay={i * 70}>
                  <article className="lp-card h-full p-5">
                    <p className="lp-label mb-3">{m.title}</p>

                    <div className="mb-4 rounded-lg p-4" style={{ backgroundColor: "var(--lp-bg)" }}>
                      <Visual />
                    </div>

                    <ul className="space-y-1.5">
                      {m.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: "var(--lp-muted)" }}
                        >
                          <span aria-hidden="true" style={{ color: "var(--lp-accent)" }}>
                            ✓
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
