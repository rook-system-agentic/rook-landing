import Reveal from "@/components/lp/LpReveal";
import HealthMoney from "@/components/health/HealthMoney";
import { HEALTH_EXEMPLO, HEALTH_PATH, healthReais } from "@/lib/health-content";

/**
 * "O caminho do dinheiro" — a tese da página, desenhada.
 *
 * Uma cascata: a primeira barra é o faturado inteiro; cada saída come um
 * pedaço pela direita; a última é o que sobra. A posição e a largura de cada
 * barra são CALCULADAS do valor (`HEALTH_EXEMPLO`), nunca digitadas — se
 * alguém mudar um número no conteúdo, o desenho acompanha.
 *
 * MOVIMENTO: as barras usam `lp-grow-bar`, que o `<Reveal>` dispara ao entrar
 * na tela. As saídas crescem a partir da direita (é dali que o dinheiro sai).
 * Em repouso, sem JS ou com movimento reduzido, a cascata está completa.
 *
 * A cor diz o papel: neutro para o total, Ocre para a glosa (é a perda que dá
 * para recuperar, o mesmo Ocre do alerta do painel), cinza para as saídas
 * previstas e Floresta para a sobra.
 */
const COR: Record<string, string> = {
  total: "var(--color-text-primary)",
  perda: "#e79f4a",
  saida: "var(--color-text-muted)",
  sobra: "var(--color-cta)",
};

export default function HealthMoneyPath() {
  const total = HEALTH_EXEMPLO.faturado;
  let restante = total;
  const barras = HEALTH_PATH.steps.map((step) => {
    if (step.sinal === "total") return { ...step, inicio: 0, largura: 100 };
    if (step.sinal === "sobra") return { ...step, inicio: 0, largura: (step.valor / total) * 100 };
    restante -= step.valor;
    return { ...step, inicio: (restante / total) * 100, largura: (step.valor / total) * 100 };
  });

  return (
    <Reveal>
      <figure className="card m-0 p-6 sm:p-10">
        <div className="mb-10 flex flex-wrap items-end gap-x-10 gap-y-6">
          <p className="m-0">
            <HealthMoney
              valor={HEALTH_EXEMPLO.faturado}
              className="block font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
            />
            <span className="section-label mt-2 block">{HEALTH_PATH.de}</span>
          </p>
          <span aria-hidden="true" className="health-arrow mb-7 inline-block font-mono text-2xl" style={{ color: "var(--color-text-muted)" }}>
            →
          </span>
          <p className="m-0" style={{ color: "var(--health-accent-text)" }}>
            <HealthMoney
              valor={HEALTH_EXEMPLO.sobra}
              className="block font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
            />
            <span className="section-label mt-2 block">{HEALTH_PATH.para}</span>
          </p>
        </div>

        <ol className="m-0 flex list-none flex-col gap-5 p-0">
          {barras.map((barra, i) => {
            const saida = barra.sinal === "perda" || barra.sinal === "saida";
            return (
              <li key={barra.key} className="grid items-center gap-x-6 gap-y-2 md:grid-cols-[13rem_1fr_7.5rem]">
                <span className="text-[15px] font-semibold md:order-1">{barra.label}</span>
                <span
                  className="font-mono text-[15px] tabular-nums md:order-3 md:text-right"
                  style={{ color: barra.sinal === "sobra" ? "var(--health-accent-text)" : undefined }}
                >
                  {saida ? "− " : ""}
                  {healthReais(barra.valor)}
                </span>
                <span
                  aria-hidden="true"
                  className="relative block h-7 overflow-hidden rounded-md md:order-2"
                  style={{ backgroundColor: "var(--color-bg-elevated)" }}
                >
                  <span
                    className="lp-grow-bar absolute inset-y-0 rounded-md"
                    style={{
                      left: `${barra.inicio}%`,
                      width: `${barra.largura}%`,
                      backgroundColor: COR[barra.sinal],
                      opacity: barra.sinal === "total" ? 0.85 : barra.sinal === "saida" ? 0.55 : 1,
                      transformOrigin: saida ? "right center" : "left center",
                      animationDelay: `${i * 220}ms`,
                    }}
                  />
                </span>
              </li>
            );
          })}
        </ol>

        <figcaption className="section-label mt-8">{HEALTH_PATH.disclaimer}</figcaption>
      </figure>
    </Reveal>
  );
}
