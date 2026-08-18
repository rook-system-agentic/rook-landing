import { SHOWCASE } from "@/lib/lp-content";
import Reveal from "./LpReveal";
import { Sparkline, CmvBar, DreLines } from "./LpDataParts";

/**
 * Tabuleiro · Casa exemplo — a vitrine logo abaixo do hero.
 *
 * Três cards com interface real: vendas, CMV e resultado. É a primeira prova
 * da promessa do hero, antes de qualquer argumento. Os três gráficos derivam
 * de EXEMPLO_DRE (ver LpDataParts), então a vitrine e o tabuleiro em abas
 * contam a mesma história sobre o mesmo dinheiro.
 */
export default function LpShowcase() {
  const cards = [
    { title: SHOWCASE.vendas, Visual: Sparkline },
    { title: SHOWCASE.cmv, Visual: CmvBar },
    { title: SHOWCASE.resultado, Visual: DreLines },
  ];

  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-6">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 70} className="h-full">
              <article className="lp-card flex h-full flex-col p-5">
                <p className="lp-label mb-3">{c.title}</p>
                <div
                  className="flex flex-1 items-center rounded-lg p-4"
                  style={{ backgroundColor: "var(--lp-bg)" }}
                >
                  <div className="w-full">
                    <c.Visual />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
