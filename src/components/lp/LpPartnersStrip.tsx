import Image from "next/image";
import { PARTNERS, PARTNERS_STRIP } from "@/lib/lp-content";

/**
 * A faixa de credibilidade logo abaixo do hero (v6).
 *
 * Por que existe: a página não tinha nenhuma prova de terceiro acima da dobra
 * — nem cliente, nem parceiro, nem número. A primeira coisa depois da promessa
 * era o próprio Rook falando de si.
 *
 * Por que são parceiros e não clientes: não há casa referenciável para citar
 * ainda (Gabriel, 24/08/2026). Inventar depoimento não está em questão, e
 * "junte-se a centenas de restaurantes" sem centenas de restaurantes é a mesma
 * mentira com outra roupa. Os parceiros são verdade verificável e resolvem a
 * objeção nº 1 do visitante — "vou ter que trocar meu sistema?" — antes mesmo
 * de ele formular a pergunta.
 *
 * É uma linha estática, não o carrossel de LpPartners: aqui o papel é ser
 * reconhecido de relance, e movimento acima da dobra rouba a atenção do CTA.
 * Quando houver clientes referenciáveis, é este o lugar deles.
 */
export default function LpPartnersStrip() {
  return (
    <section
      className="lp-band py-8 lg:py-10"
      style={{ borderTop: "1px solid var(--lp-line)", borderBottom: "1px solid var(--lp-line)" }}
      aria-label="Sistemas integrados ao Rook"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="lp-label mb-5">{PARTNERS_STRIP.label}</p>
        <ul className="grid grid-cols-2 items-center gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-7">
          {PARTNERS.map((p) => (
            <li key={p.name} className="flex flex-col items-center gap-1.5 text-center">
              {p.logo ? (
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={p.w ?? 120}
                  height={p.h ?? 40}
                  className="h-7 w-auto object-contain lg:h-8"
                />
              ) : (
                /* Sem arquivo de logo, o nome em tipografia. Ver PARTNERS. */
                <span
                  className="font-display text-lg font-bold lg:text-xl"
                  style={{ color: "var(--lp-ink)" }}
                >
                  {p.name}
                </span>
              )}
              <span
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: "var(--lp-muted)" }}
              >
                {p.categoria}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
