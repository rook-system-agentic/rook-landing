import Link from 'next/link'

export function PdfDemoSection() {
  return (
    <section className="py-24 lg:py-32 bg-cream" aria-labelledby="pdf-heading">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <p className="section-label mb-4 !text-gold-dark">Relatorio de Exemplo</p>
            <h2 id="pdf-heading" className="text-display-md text-rook-bg">
              Veja o nivel de detalhe que voce tera
            </h2>
            <p className="mt-6 text-body-lg text-rook-bg/70">
              Cada relatorio gerado pela Rook e um documento completo com dados fiscais reais, classificacao por categoria NCM, tendencias de custo e recomendacoes acionaveis.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'CMV detalhado por categoria (proteinas, laticinios, bebidas, FLV)',
                'Curva ABC de fornecedores com variacao de preco',
                'DRE simplificado com margem bruta e operacional',
                'Alertas de desvio e recomendacoes automaticas',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-1 text-gold-dark">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" />
                    <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-body-md text-rook-bg/80">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="https://app.rooksystem.com.br/registro"
              className="mt-8 inline-flex items-center justify-center px-6 py-3 bg-rook-bg text-gold font-semibold rounded-rook hover:bg-rook-surface transition-all"
            >
              Gerar Meu Relatorio
            </Link>
          </div>

          {/* PDF Preview mockup */}
          <div className="relative">
            <div className="bg-white rounded-rook-lg shadow-rook-lg p-8 border border-cream-dark">
              <div className="space-y-4">
                {/* Header mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-cream-dark">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gold/20 rounded" />
                    <span className="font-display font-bold text-rook-bg text-sm">Rook System</span>
                  </div>
                  <span className="text-body-sm text-rook-bg/50">Relatorio Mensal</span>
                </div>

                {/* Score mockup */}
                <div className="text-center py-6">
                  <p className="text-body-sm text-rook-bg/50 uppercase tracking-wider">Score de Saude Financeira</p>
                  <p className="text-6xl font-bold text-gold-dark mt-2">83</p>
                  <p className="text-body-sm text-accent-green mt-1">Bom</p>
                </div>

                {/* Bars mockup */}
                <div className="space-y-3">
                  {[
                    { label: 'Proteinas', value: '32%', width: '32%', color: 'bg-gold' },
                    { label: 'Bebidas', value: '24%', width: '24%', color: 'bg-gold-dark' },
                    { label: 'FLV', value: '18%', width: '18%', color: 'bg-gold/70' },
                    { label: 'Laticinios', value: '14%', width: '14%', color: 'bg-gold/50' },
                    { label: 'Mercearia', value: '12%', width: '12%', color: 'bg-gold/30' },
                  ].map((bar) => (
                    <div key={bar.label} className="flex items-center gap-3">
                      <span className="text-body-sm text-rook-bg/60 w-20 text-right">{bar.label}</span>
                      <div className="flex-1 h-4 bg-cream-dark rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                      </div>
                      <span className="text-body-sm font-mono text-rook-bg/80 w-10">{bar.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/10 rounded-full blur-xl" aria-hidden="true" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gold/5 rounded-full blur-xl" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
