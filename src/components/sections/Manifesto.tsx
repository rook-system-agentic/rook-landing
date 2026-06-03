export function ManifestoSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="manifesto-heading">
      {/* Subtle gold accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-4">Manifesto</p>
          <h2 id="manifesto-heading" className="text-display-md mb-8">
            Visao. Estrategia.{' '}
            <span className="gold-gradient-text">Controle.</span>
          </h2>

          <div className="space-y-6 text-body-lg text-rook-text-muted leading-relaxed">
            <p>
              O Rook System nasceu de uma constatacao simples: <strong className="text-rook-text">restaurantes que faturam alto nao necessariamente lucram</strong>. A diferenca entre os que prosperam e os que fecham esta em uma unica variavel — controle financeiro real.
            </p>
            <p>
              Nao vendemos dashboards bonitos. Nao prometemos magica. Entregamos <strong className="text-rook-text">visibilidade total sobre o dinheiro do seu restaurante</strong>, com dados fiscais reais, auditaveis e rastreaveis ate a nota fiscal de origem.
            </p>
            <p>
              Cada real que entra, cada custo que sai, cada margem que escapa — tudo visivel, tudo mensuravel, tudo sob controle. Porque <strong className="text-rook-text">gestao financeira nao e sobre contabilidade — e sobre decisoes melhores, mais rapidas, baseadas em dados</strong>.
            </p>
          </div>

          {/* Equation — GEO: visual formula citavel */}
          <div className="mt-12 p-8 bg-rook-surface border border-rook-border rounded-rook-lg">
            <p className="text-label text-gold mb-4">A Equacao Rook</p>
            <p className="font-mono text-xl md:text-2xl text-rook-text text-center">
              <span className="text-gold">Dados Fiscais Reais</span>
              {' + '}
              <span className="text-gold">Analise Inteligente</span>
              {' = '}
              <span className="text-accent-green font-bold">Margem Protegida</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
