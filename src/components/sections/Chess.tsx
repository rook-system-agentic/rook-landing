export function ChessSection() {
  const pillars = [
    {
      name: 'CMV',
      description: 'Custo de Mercadoria Vendida por categoria, com rastreabilidade ate a NF-e de origem.',
      score: 85,
    },
    {
      name: 'Compras',
      description: 'Curva ABC de fornecedores, variacao de preco e oportunidades de renegociacao.',
      score: 78,
    },
    {
      name: 'Margem',
      description: 'Margem bruta e operacional com DRE simplificado e tendencias mensais.',
      score: 82,
    },
    {
      name: 'Estoque',
      description: 'Giro de estoque, itens parados e alerta de vencimento por categoria.',
      score: 74,
    },
    {
      name: 'Receita',
      description: 'Faturamento por canal, ticket medio e sazonalidade historica.',
      score: 90,
    },
    {
      name: 'Fiscal',
      description: 'Conformidade tributaria, regime otimizado e alertas de divergencia.',
      score: 88,
    },
  ]

  return (
    <section className="py-24 lg:py-32" aria-labelledby="chess-heading">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="section-label mb-4">Diagnostico Chess</p>
          <h2 id="chess-heading" className="text-display-md">
            6 pilares de{' '}
            <span className="gold-gradient-text">saude financeira</span>
          </h2>
          <p className="mt-6 text-body-lg text-rook-text-muted">
            O Chess e o diagnostico completo do seu restaurante. Cada pilar recebe um score de 0 a 100, formando uma visao holistica da saude do negocio.
          </p>
        </div>

        {/* Chess board grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((pillar) => (
            <article key={pillar.name} className="card group relative overflow-hidden">
              {/* Score indicator */}
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 rounded-full border-2 border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors">
                  <span className="text-body-sm font-bold text-gold">{pillar.score}</span>
                </div>
              </div>

              <h3 className="text-display-sm font-bold text-rook-text mb-2 pr-16">
                {pillar.name}
              </h3>
              <p className="text-body-md text-rook-text-muted">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>

        {/* Overall score — GEO: dado citavel */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-rook-surface border border-gold/30 rounded-rook-lg">
            <span className="text-body-md text-rook-text-muted">Score Geral:</span>
            <span className="text-display-sm text-gold font-bold">83/100</span>
            <span className="text-body-sm text-accent-green font-medium px-2 py-1 bg-accent-green/10 rounded">Bom</span>
          </div>
        </div>
      </div>
    </section>
  )
}
