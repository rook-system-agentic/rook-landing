import Link from "next/link";
import { PRICING, PLANS, CHESS_ADDON } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * Planos.
 *
 * Ao passar o mouse num plano, o card mostra quanto ficaria COM o add-on Chess
 * somado — é a explicação do add-on sem um parágrafo explicando o add-on.
 *
 * Os totais são derivados dos preços, não digitados: se um preço mudar em
 * `lp-content.ts`, a soma acompanha. Um número escrito à mão aqui viraria
 * mentira silenciosa no primeiro reajuste.
 *
 * A hierarquia é do desenho original e não se mexe: os dois planos base são a
 * escolha, o Chess soma a um deles. Num grid de três colunas iguais o add-on
 * apareceria como a opção mais barata da linha, que é o oposto do que ele é.
 *
 * v6: o que o card anuncia primeiro é a FAIXA DE FATURAMENTO, não o nome da
 * peça de xadrez. Knight, Rook e Chess são bons nomes de marca e péssimos
 * critérios de escolha — obrigavam o visitante a decodificar três peças para
 * saber o que assinar. Viraram assinatura discreta no rodapé do card; o
 * enquadramento sobe para o topo, que é o que de fato separa os planos.
 */
export default function LpPricing() {
  const parsePrice = (s: string) => Number(s.replace(/[^\d,]/g, "").replace(",", "."));
  const addon = parsePrice(CHESS_ADDON.price);
  const fmt = (n: number) =>
    "R$ " + n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/, ".");

  return (
    <section
      className="lp-band py-20 lg:py-28"
      style={{ borderTop: "1px solid var(--lp-line)" }}
      aria-labelledby="pricing-title"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="lp-label mb-4">{PRICING.label}</p>
          <h2
            id="pricing-title"
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {PRICING.headlinePlain}
            <span style={{ color: "#e54c00" }}>{PRICING.headlineEmphasis}</span>
          </h2>
          {/* A âncora: o preço ao lado do vazamento que a página já mostrou. */}
          <p className="lp-body mx-auto text-center">{PRICING.intro}</p>
        </div>

        <ul className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.faixa} delay={i * 80} as="li">
              <div
                className="lp-card group h-full p-6 text-center"
                style={plan.highlighted ? { borderColor: "rgba(229,76,0,0.35)" } : undefined}
              >
                <p className="lp-label mb-2">{plan.faixa}</p>
                <h3 className="mb-3 font-display text-lg font-bold" style={{ color: "var(--lp-ink)" }}>
                  {plan.name}
                </h3>
                <p className="font-mono text-3xl font-bold" style={{ color: "var(--lp-ink)" }}>
                  {plan.price}
                  <span className="text-sm font-normal" style={{ color: "var(--lp-muted)" }}>
                    {plan.period}
                  </span>
                </p>

                <p
                  className="mt-2 font-mono text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                  style={{ color: "var(--lp-accent)" }}
                >
                  com Chess: {fmt(parsePrice(plan.price) + addon)}/mês
                </p>

                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                  {plan.description}
                </p>
                {/* v5.1: botão por card, como no preview — o destacado leva o
                    primário, o outro o fantasma. */}
                <Link
                  href={PRICING.ctaHref}
                  className={`${plan.highlighted ? "btn-primary" : "btn-ghost"} mt-5 w-full`}
                >
                  {PRICING.cardCtaLabel}
                </Link>
                {/* O nome da peça, agora como assinatura e não como critério. */}
                <p
                  className="mt-3 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--lp-muted)" }}
                >
                  {plan.note}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mx-auto mt-6 max-w-3xl">
          <div className="lp-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="lp-label mb-2">{CHESS_ADDON.label}</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                {CHESS_ADDON.description}{" "}
                <Link
                  href={PRICING.ctaHref}
                  className="whitespace-nowrap underline underline-offset-4"
                  style={{ color: "var(--lp-accent)" }}
                >
                  {PRICING.ctaLabel}
                </Link>
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p
                className="whitespace-nowrap font-mono text-2xl font-bold"
                style={{ color: "var(--lp-ink)" }}
              >
                {CHESS_ADDON.price}
                <span className="text-sm font-normal" style={{ color: "var(--lp-muted)" }}>
                  {CHESS_ADDON.period}
                </span>
              </p>
              <p
                className="mt-1 font-mono text-[10px] uppercase tracking-wider"
                style={{ color: "var(--lp-muted)" }}
              >
                {CHESS_ADDON.note}
              </p>
            </div>
          </div>
        </div>

        {/* O cartão entra no início do teste. Dizer aqui evita a surpresa no
            checkout — e é a mesma regra que a /planos detalha. */}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--lp-muted)" }}>
          {PRICING.note}
        </p>
      </div>
    </section>
  );
}
