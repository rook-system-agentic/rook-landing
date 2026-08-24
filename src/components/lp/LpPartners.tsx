import Image from "next/image";
import { PARTNERS, PARTNERS_SECTION, type Partner } from "@/lib/lp-content";
import LpIntegrationRequest from "./LpIntegrationRequest";

/**
 * Um parceiro na faixa.
 *
 * A placa é branca nos dois temas, de propósito. Logo de terceiro não se
 * recolore nem se aplica filtro — quase todo manual de marca proíbe, e é o que
 * mantém o uso defensável. Placa clara atrás resolve o contraste no tema
 * escuro sem tocar no logo.
 *
 * Parceiro sem arquivo cai no nome em tipografia. Não é buraco: é o estado de
 * quem ainda não teve o logo obtido de fonte oficial, e some sozinho quando o
 * arquivo chegar.
 */
function PartnerPlate({ p }: { p: Partner }) {
  return (
    <li className="lp-partner shrink-0" aria-label={`${p.name} — ${p.categoria}`}>
      <div className="lp-partner-plate">
        {p.logo ? (
          <Image
            src={p.logo}
            alt={p.name}
            width={p.w ?? 140}
            height={p.h ?? 44}
            className="max-h-9 w-auto max-w-[116px] object-contain"
          />
        ) : (
          <span className="text-xl font-semibold tracking-tight text-[#1a1a1a]">{p.name}</span>
        )}
      </div>
      <p className="lp-label mt-3 text-center">{p.categoria}</p>
    </li>
  );
}

/**
 * Seção de integrações.
 *
 * Responde à dúvida que trava compra — "vai funcionar com o que eu já uso?" —
 * antes de a página falar de preço.
 *
 * A faixa é um marquee em CSS puro, com a lista duplicada para o laço não ter
 * emenda. A cópia é marcada `aria-hidden`, senão um leitor de tela anunciaria
 * cada parceiro duas vezes. Com `prefers-reduced-motion`, o CSS transforma a
 * faixa numa grade estática — nenhum parceiro fica fora de vista.
 */
export default function LpPartners() {
  return (
    <section
      className="overflow-hidden py-20 lg:py-28"
      style={{ borderTop: "1px solid var(--lp-line)" }}
      aria-labelledby="partners-title"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* v5.1: sem o diagrama de rede — no preview aprovado a seção é o
            argumento em texto e a faixa de logos, nada mais. */}
        <div className="max-w-3xl">
          <p className="lp-label mb-4">{PARTNERS_SECTION.label}</p>
          <h2
            id="partners-title"
            className="mb-5 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {PARTNERS_SECTION.headlinePlain}
            <span style={{ color: "#e54c00" }}>{PARTNERS_SECTION.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-6">{PARTNERS_SECTION.intro}</p>
          {/*
            * Era um `mailto:` — que depende de cliente de e-mail configurado,
            * não registra o pedido e chega ao Comercial sem dizer qual sistema
            * foi pedido. Virou formulário; ver LpIntegrationRequest.
            */}
          <LpIntegrationRequest label={PARTNERS_SECTION.ctaLabel} />
        </div>
      </div>

      {/*
        A faixa sangra até a borda da tela — é o que faz ela parecer contínua.

        Três trilhas: a primeira é a real, as outras duas são cópias marcadas
        `aria-hidden` (sem isso, um leitor de tela anunciaria cada parceiro três
        vezes). O porquê de serem três, e não duas, está no CSS: é a largura
        mínima para o laço não abrir buraco numa tela larga.
      */}
      <div className="lp-marquee mt-16" aria-label="Sistemas integrados ao Rook">
        <ul className="lp-marquee-track">
          {PARTNERS.map((p) => (
            <PartnerPlate key={p.name} p={p} />
          ))}
        </ul>
        {[1, 2].map((n) => (
          <ul className="lp-marquee-track" aria-hidden="true" key={n}>
            {PARTNERS.map((p) => (
              <PartnerPlate key={`${p.name}-clone-${n}`} p={p} />
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
