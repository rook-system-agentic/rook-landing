import Link from 'next/link'

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-rook-bg via-rook-bg to-rook-surface" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="section-container relative z-10 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Label */}
          <p className="section-label mb-6 animate-fade-in">
            Gestao Financeira para Restaurantes
          </p>

          {/* Headline — GEO: citavel, standalone */}
          <h1
            id="hero-heading"
            className="text-display-lg md:text-display-xl text-balance animate-slide-up"
          >
            Faturar nao e lucrar.{' '}
            <span className="gold-gradient-text">
              A Rook mostra onde esta o dinheiro.
            </span>
          </h1>

          {/* Subheadline — GEO: dados concretos */}
          <p className="mt-6 text-body-lg text-rook-text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Controle CMV, otimize compras e proteja a margem do seu restaurante com dados fiscais reais e 100% auditaveis. Sem achismo, sem planilha.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="https://app.rooksystem.com.br/registro"
              className="btn-primary text-lg px-8 py-4"
            >
              Comecar Gratis
            </Link>
            <Link
              href="/planos"
              className="btn-secondary text-lg px-8 py-4"
            >
              Ver Planos
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-rook-text-dim animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <span className="text-gold font-bold text-lg">100%</span>
              <span className="text-body-sm">Dados auditaveis</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-rook-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-gold font-bold text-lg">6</span>
              <span className="text-body-sm">Pilares de analise</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-rook-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-gold font-bold text-lg">R$124k</span>
              <span className="text-body-sm">Economia media/ano</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rook-text-dim">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  )
}
