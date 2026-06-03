import Link from "next/link";

export function ChessSection() {
  const pillars = [
    {
      icon: "♜",
      name: "CMV",
      desc: "Custo de Mercadoria Vendida por categoria NCM, com rastreabilidade até a nota fiscal.",
    },
    {
      icon: "♞",
      name: "Compras",
      desc: "Curva ABC de fornecedores, concentração de risco e evolução de preço unitário.",
    },
    {
      icon: "♝",
      name: "Impostos",
      desc: "Carga tributária real sobre vendas, comparativo de regimes e simulação de migração.",
    },
    {
      icon: "♛",
      name: "Ocupação",
      desc: "Aluguel, condomínio, utilities — quanto do faturamento é consumido pela estrutura.",
    },
    {
      icon: "♚",
      name: "Pessoal",
      desc: "Folha + encargos como % da receita, benchmark setorial e alertas de desvio.",
    },
    {
      icon: "♟",
      name: "Endividamento",
      desc: "Dívidas ativas, custo financeiro, projeção de quitação e impacto no fluxo de caixa.",
    },
  ];

  return (
    <section
      className="section"
      aria-labelledby="chess-heading"
      style={{ borderTop: "1px solid rgba(176,124,74,0.16)" }}
    >
      <div className="container-rook">
        <p className="eyebrow mb-[22px]">— Os 6 pilares do Chess</p>
        <h2 id="chess-heading" className="section-title">
          Cada pilar é uma <em>camada de margem</em>.
        </h2>
        <p className="section-lede mb-16">
          O Chess é o framework proprietário da Rook. Ele divide a saúde
          financeira do restaurante em 6 dimensões independentes — e mostra onde
          agir primeiro.
        </p>

        {/* 6 pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {pillars.map((p) => (
            <div
              key={p.name}
              className="rounded-rook border p-6 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(160deg, #241A11 0%, #1A130C 100%)",
                borderColor: "rgba(176,124,74,0.24)",
              }}
            >
              <span className="text-[28px] mb-3 block">{p.icon}</span>
              <h3
                className="font-display font-medium text-[18px] tracking-[-0.01em] mb-2"
                style={{ color: "#F5EDE0" }}
              >
                {p.name}
              </h3>
              <p className="text-[13.5px] leading-[1.5] m-0" style={{ color: "#D8CCB8" }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-wrap items-center gap-4">
          <Link href="/funcionalidades" className="btn btn-primary btn-lg">
            Ver funcionalidades completas
          </Link>
          <Link href="#contato" className="btn btn-ghost btn-lg">
            Falar com vendas
          </Link>
        </div>
      </div>
    </section>
  );
}
