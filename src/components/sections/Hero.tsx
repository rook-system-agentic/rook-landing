import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="relative py-24 lg:py-[96px] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(229,76,0,0.07), transparent 70%),
            radial-gradient(ellipse 50% 70% at 90% 80%, rgba(176,124,74,0.05), transparent 70%)
          `,
        }}
      />

      <div className="container-rook relative z-[2]">
        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p className="eyebrow mb-7">— Sistema de gestão para food service</p>

            <h1
              id="hero-heading"
              className="font-display font-medium m-0 mb-7"
              style={{
                fontSize: "clamp(48px, 7.4vw, 96px)",
                lineHeight: "0.95",
                letterSpacing: "-0.025em",
                color: "#F5EDE0",
              }}
            >
              Faturar não é{" "}
              <em className="italic font-normal" style={{ color: "#E79F4A" }}>
                lucrar
              </em>
              .
            </h1>

            <p
              className="text-[17.5px] leading-[1.55] max-w-[540px] m-0 mb-9"
              style={{ color: "#D8CCB8" }}
            >
              A maioria dos restaurantes fecha o mês sem saber onde está o
              dinheiro.{" "}
              <strong className="font-semibold" style={{ color: "#F5EDE0" }}>
                A Rook te mostra
              </strong>{" "}
              — em números, com fontes auditáveis, sem achismo.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap items-center">
              <Link href="/planos" className="btn btn-primary btn-lg">
                Começar grátis
              </Link>
              <Link href="/funcionalidades" className="btn btn-ghost btn-lg">
                Conhecer o produto
              </Link>
              <span
                className="font-mono text-[10.5px] tracking-[0.18em] uppercase ml-1"
                style={{ color: "rgba(245,237,224,0.58)" }}
              >
                Plano Pawn grátis · Sem cartão
              </span>
            </div>
          </div>

          {/* Right: Mosaic cards */}
          <div className="flex flex-col gap-[14px] w-full">
            {/* Card 1: Score */}
            <div
              className="rounded-rook border p-[18px_20px] relative transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(160deg, #241A11 0%, #1A130C 100%)",
                borderColor: "rgba(176,124,74,0.32)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
              }}
            >
              <p
                className="font-mono text-[9.5px] tracking-[0.22em] uppercase mb-[10px]"
                style={{ color: "rgba(245,237,224,0.58)" }}
              >
                — Score do mês
              </p>
              <div className="grid grid-cols-[56px_1fr] gap-[14px] items-center">
                <div
                  className="w-[56px] h-[56px] rounded-full flex items-center justify-center relative"
                  style={{
                    background:
                      "conic-gradient(#44604A 0 83%, rgba(255,255,255,0.06) 83% 100%)",
                  }}
                >
                  <div
                    className="absolute inset-[5px] rounded-full"
                    style={{ background: "#241A11" }}
                  />
                  <span className="relative z-[1] font-display font-medium text-[22px] leading-none tracking-[-0.02em]" style={{ color: "#F5EDE0" }}>
                    83
                  </span>
                </div>
                <div>
                  <p className="font-display font-medium text-[22px] leading-[1.05] tracking-[-0.01em] m-0" style={{ color: "#F5EDE0" }}>
                    Bom
                  </p>
                  <p className="text-[12px] mt-1 m-0" style={{ color: "rgba(245,237,224,0.58)" }}>
                    4 de 6 pilares saudáveis
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Recomendação */}
            <div
              className="rounded-rook border p-[18px_20px] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(160deg, #241A11 0%, #1A130C 100%)",
                borderColor: "rgba(229,76,0,0.32)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
              }}
            >
              <div
                className="absolute inset-0 rounded-rook pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(229,76,0,0.08), transparent 70%)",
                }}
              />
              <p
                className="font-mono text-[9.5px] tracking-[0.22em] uppercase mb-[10px] relative z-[1]"
                style={{ color: "#F87038" }}
              >
                — Recomendação · Impostos
              </p>
              <p className="text-[14px] leading-[1.4] m-0 mb-[10px] relative z-[1]" style={{ color: "#D8CCB8" }}>
                Migração para{" "}
                <strong className="font-semibold" style={{ color: "#F5EDE0" }}>
                  Lucro Presumido
                </strong>{" "}
                pode economizar
              </p>
              <div className="flex items-baseline gap-[6px] relative z-[1]">
                <span className="font-display font-medium text-[28px] leading-none tracking-[-0.015em]" style={{ color: "#F87038" }}>
                  R$ 124k
                </span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "rgba(245,237,224,0.58)" }}>
                  / ano
                </span>
              </div>
            </div>

            {/* Card 3: Atenção */}
            <div
              className="rounded-rook border p-[18px_20px] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(160deg, #241A11 0%, #1A130C 100%)",
                borderColor: "rgba(231,159,74,0.32)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
              }}
            >
              <div
                className="absolute inset-0 rounded-rook pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(231,159,74,0.06), transparent 70%)",
                }}
              />
              <p
                className="font-mono text-[9.5px] tracking-[0.22em] uppercase mb-[10px] relative z-[1]"
                style={{ color: "#E79F4A" }}
              >
                — Atenção · Compras
              </p>
              <p className="text-[14px] leading-[1.4] m-0 mb-[10px] relative z-[1]" style={{ color: "#D8CCB8" }}>
                <strong className="font-semibold" style={{ color: "#F5EDE0" }}>
                  Top fornecedor
                </strong>{" "}
                concentra
              </p>
              <div className="flex items-baseline gap-[6px] relative z-[1]">
                <span className="font-display font-medium text-[28px] leading-none tracking-[-0.015em]" style={{ color: "#E79F4A" }}>
                  41%
                </span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "rgba(245,237,224,0.58)" }}>
                  do CMV
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="mt-[88px] grid grid-cols-2 lg:grid-cols-4 gap-0 py-[22px]"
          style={{
            borderTop: "1px solid rgba(176,124,74,0.16)",
            borderBottom: "1px solid rgba(176,124,74,0.16)",
          }}
        >
          {[
            { val: "100%", label: "Dados auditáveis" },
            { val: "6", label: "Pilares de saúde" },
            { val: "0", label: "Planilhas necessárias" },
            { val: "11", label: "Páginas no relatório anual" },
          ].map((stat, i) => (
            <div
              key={i}
              className="px-7 py-2 lg:py-0"
              style={{
                borderRight: i < 3 ? "1px solid rgba(176,124,74,0.16)" : "none",
              }}
            >
              <p className="font-display font-medium text-[30px] leading-none tracking-[-0.015em] mb-1 m-0" style={{ color: "#F5EDE0" }}>
                {stat.val}
              </p>
              <p className="font-mono text-[9.5px] tracking-[0.20em] uppercase m-0" style={{ color: "rgba(245,237,224,0.58)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
