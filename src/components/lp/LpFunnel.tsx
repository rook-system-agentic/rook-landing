import { FUNNEL_STAGES } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * As seis etapas do dinheiro, como funil.
 *
 * Não inventa informação: é a encenação do parágrafo que já está no manifesto
 * — "o dinheiro passa por seis etapas... em cada uma, a margem pode estar
 * escapando sem você ver". Aqui a margem escapa na tela.
 *
 * As barras são centradas de propósito. Alinhadas à esquerda seriam um gráfico
 * de barras qualquer; centradas, o formato do funil aparece sozinho e o
 * argumento se lê antes do texto.
 *
 * Os percentuais são ilustrativos e servem à narrativa da queda — não são a
 * DRE de nenhum cliente.
 */
export default function LpFunnel() {
  return (
    <section
      data-lp-funnel
      className="py-20 lg:py-28"
      style={{
        // Fundo elevado, não invertido: separa a seção sem trocar o tema no
        // meio da leitura. As réguas são terracota fixo, e não `--lp-accent`,
        // porque no tema claro o accent é verde — a borda sairia verde.
        backgroundColor: "var(--lp-elevated)",
        color: "var(--lp-ink)",
        borderTop: "1px solid rgba(229, 76, 0, 0.30)",
        borderBottom: "1px solid rgba(229, 76, 0, 0.30)",
      }}
      aria-label="As seis etapas pelas quais o dinheiro passa"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="lp-label mb-10">— Entre o caixa e o bolso, seis etapas</p>

        <ol className="space-y-3">
          {FUNNEL_STAGES.map((j, i) => {
            const last = i === FUNNEL_STAGES.length - 1;
            // `as="li"`, e não um `<li>` dentro do Reveal: o wrapper de animação
            // é filho direto do `<ol>`, e um `<div>` nessa posição desmonta a
            // lista para leitor de tela — os seis itens deixavam de ser
            // anunciados como itens e o `<ol>` ficava sem filho válido.
            return (
              <Reveal
                key={j.stage}
                delay={i * 70}
                as="li"
                className="flex items-center gap-4 sm:gap-5"
              >
                {/* Sem `opacity`: o cinza já mede 5,16:1 sobre o fundo
                    elevado, e 0.6 derrubava para 2,40:1. A hierarquia continua
                    dada pelo corpo pequeno e pela fonte monoespaçada. */}
                <span
                  className="w-7 shrink-0 font-mono text-xs"
                  style={{ color: "var(--lp-muted)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="w-24 shrink-0 font-display text-base font-semibold capitalize sm:w-32 sm:text-lg"
                  style={{ color: "var(--lp-ink)" }}
                >
                  {j.stage}
                </span>
                <span className="relative h-10 flex-1 overflow-hidden rounded-lg">
                  <span
                    className="lp-funnel-bar absolute inset-y-0 left-1/2 rounded-lg"
                    style={{
                      width: `${j.remaining}%`,
                      transform: "translateX(-50%)",
                      background: last
                        ? "linear-gradient(90deg, #e54c00, #e79f4a)"
                        : `color-mix(in srgb, #e54c00 ${30 + j.remaining / 2}%, transparent)`,
                    }}
                  />
                </span>
                {/* Terracota, não ocre: no tema claro o ocre fica de baixo
                    contraste sobre o fundo elevado. E o terracota da marca
                    também não serve aqui — como texto de 14px media 3,45:1
                    no claro e 3,32:1 no escuro. `--color-terracota-text` é a
                    face legível dele, e vira 4,58:1 / 5,32:1. */}
                <span
                  className="w-14 shrink-0 text-right font-mono text-sm font-semibold"
                  style={{ color: last ? "var(--color-terracota-text)" : "var(--lp-muted)" }}
                >
                  {j.remaining}%
                </span>
              </Reveal>
            );
          })}
        </ol>

        <p className="lp-body mt-10">
          Em cada etapa, a margem pode estar escapando sem você ver. O Rook mostra{" "}
          <strong className="lp-strong">em qual delas</strong>.
        </p>

        <p
          className="mt-4 font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "var(--lp-muted)" }}
        >
          Percentuais ilustrativos
        </p>
      </div>
    </section>
  );
}
