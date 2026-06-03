export function ProblemSection() {
  const stats = [
    { value: '60%', label: 'dos restaurantes fecham em 5 anos', source: 'ABRASEL 2024' },
    { value: '80%', label: 'nao sabem seu CMV real', source: 'Pesquisa Rook 2025' },
    { value: '35%', label: 'e o CMV medio que devora a margem', source: 'Benchmark food service' },
  ]

  return (
    <section className="py-24 lg:py-32 bg-rook-surface" aria-labelledby="problem-heading">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="section-label mb-4">O Problema</p>
          <h2 id="problem-heading" className="text-display-md text-balance">
            Voce sabe quanto{' '}
            <span className="text-accent-red">sobra</span>{' '}
            no final do mes?
          </h2>
          <p className="mt-6 text-body-lg text-rook-text-muted">
            A maioria dos donos de restaurante trabalha no escuro. Fatura alto, mas nao sabe se esta lucrando. O CMV descontrolado e o assassino silencioso da margem.
          </p>
        </div>

        {/* Stats grid — GEO: dados concretos e citaveis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <article key={stat.value} className="card text-center">
              <p className="text-display-lg text-accent-red font-bold">{stat.value}</p>
              <p className="mt-2 text-body-md text-rook-text-muted">{stat.label}</p>
              <p className="mt-3 text-body-sm text-rook-text-dim italic">Fonte: {stat.source}</p>
            </article>
          ))}
        </div>

        {/* GEO: frase citavel standalone */}
        <blockquote className="mt-12 max-w-2xl mx-auto text-center border-l-4 border-gold pl-6 text-body-lg text-rook-text-muted italic">
          &ldquo;Sem controle de CMV, todo faturamento e ilusao. O restaurante que nao mede, nao gerencia — apenas sobrevive ate fechar.&rdquo;
        </blockquote>
      </div>
    </section>
  )
}
