export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Conecte seus dados fiscais',
      description:
        'Importe XMLs de notas fiscais ou conecte via integracao automatica. Seus dados reais de compra sao a base de tudo.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Analise automatica por categoria',
      description:
        'A Rook classifica cada item por categoria NCM (proteinas, laticinios, bebidas, FLV, mercearia) e calcula o CMV real por grupo.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M12 3v9l6 3" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Visibilidade total da margem',
      description:
        'Dashboard com DRE, curva ABC, tendencias de custo e alertas de desvio. Cada numero e rastreavel ate a nota fiscal de origem.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
          <path d="M13 16l2-2 2 2" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Decisoes baseadas em dados',
      description:
        'Saiba exatamente onde cortar, onde investir e onde renegociar. Proteja sua margem com decisoes informadas, nao com achismo.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-24 lg:py-32 bg-rook-surface" aria-labelledby="how-heading">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="section-label mb-4">Como Funciona</p>
          <h2 id="how-heading" className="text-display-md">
            De dados brutos a{' '}
            <span className="gold-gradient-text">decisoes inteligentes</span>
          </h2>
          <p className="mt-6 text-body-lg text-rook-text-muted">
            4 passos para transformar notas fiscais em controle financeiro real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {steps.map((step) => (
            <article key={step.number} className="card group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gold/10 rounded-rook group-hover:bg-gold/20 transition-colors">
                  {step.icon}
                </div>
                <div>
                  <p className="text-label text-gold mb-1">{step.number}</p>
                  <h3 className="text-display-sm text-lg font-semibold text-rook-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-body-md text-rook-text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
