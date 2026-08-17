import { HERO, HERO_PARAGRAPH, SECTOR_STATS, MODULES } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";
import LpCountUp from "./LpCountUp";
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
          Coluna única: a tese em cima, ocupando a largura toda, e os módulos
          embaixo numa grade de dois. A medida do texto continua contida
          (`max-w-4xl` no bloco, e a própria `lp-body` limita o parágrafo) —
          manchete e parágrafo esticados por 1.400px seriam ilegíveis, que é o
          problema que o layout de duas colunas resolvia por acidente.
        */}
        <div>
          <div className="max-w-4xl">
            <p className="lp-label mb-4">{HERO.label}</p>
            <h1
              className="mb-5 font-display font-extrabold"
              style={{
                color: "var(--lp-ink)",
                fontSize: "clamp(2.6rem, 6.4vw, 5.2rem)",
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
            {/* Sem `opacity`: a linha de fontes media 2,97:1 no claro e 3,85:1
                no escuro com 0.7. O cinza cru mede 5,50:1 e 6,47:1. */}
            <p className="font-mono text-xs" style={{ color: "var(--lp-muted)" }}>
              {HERO.sourcesLine}
            </p>
          </div>

          {/*
            Os quatro números agora têm a largura toda, então cabem lado a
            lado. Uma coluna no celular: em duas, "R$ 495 bi" quebra no meio.
          */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      {/* Renderiza o valor final no HTML servido; a contagem
                          só assume depois de montar. Ver LpCountUp. */}
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

          {/* Os quatro módulos, cada um com sua peça de interface, em 2×2. */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {MODULES.map((m, i) => {
              const Visual = MODULE_VISUALS[i];
              return (
                <Reveal key={m.title} delay={i * 70} className="h-full">
                  {/*
                    Numa grade de dois, o card estica até a altura do vizinho
                    mais alto — e os módulos têm 3 ou 4 bullets. Em vez de o
                    excedente virar um vazio depois do texto, ele é absorvido
                    pela caixa do gráfico (`flex-1`), onde lê como respiro.
                  */}
                  <article className="lp-card flex h-full flex-col p-5">
                    <p className="lp-label mb-3">{m.title}</p>

                    <div
                      className="mb-4 flex flex-1 items-center rounded-lg p-4"
                      style={{ backgroundColor: "var(--lp-bg)" }}
                    >
                      <div className="w-full">
                        <Visual />
                      </div>
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
