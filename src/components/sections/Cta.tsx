import Link from "next/link";

export function CtaSection() {
  return (
    <section
      className="section text-center"
      aria-labelledby="cta-heading"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 50% 80%, rgba(229,76,0,0.10), transparent 70%),
          #0F0A06
        `,
        borderTop: "1px solid rgba(176,124,74,0.16)",
      }}
    >
      <div className="container-rook max-w-[680px]">
        <p className="eyebrow mb-[22px]">— Comece agora</p>
        <h2
          id="cta-heading"
          className="font-display font-medium m-0 mb-6"
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            color: "#F5EDE0",
          }}
        >
          Pronto para saber onde está o{" "}
          <em className="italic font-normal" style={{ color: "#E79F4A" }}>
            seu dinheiro
          </em>
          ?
        </h2>
        <p className="text-[17px] leading-[1.55] mb-10" style={{ color: "#D8CCB8" }}>
          Comece grátis com o plano Pawn. Sem cartão de crédito, sem compromisso.
          Quando estiver pronto, evolua para Knight ou Bishop.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/planos" className="btn btn-primary btn-xl">
            Começar grátis
          </Link>
          <Link href="#contato" className="btn btn-ghost btn-xl">
            Falar com vendas
          </Link>
        </div>
      </div>
    </section>
  );
}
