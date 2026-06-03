import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-24 lg:py-32 bg-rook-surface relative overflow-hidden" aria-labelledby="cta-heading">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-gold/3 rounded-full blur-3xl" aria-hidden="true" />

      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="cta-heading" className="text-display-md md:text-display-lg">
            Pare de adivinhar.{' '}
            <span className="gold-gradient-text">Comece a controlar.</span>
          </h2>
          <p className="mt-6 text-body-lg text-rook-text-muted max-w-xl mx-auto">
            Crie sua conta gratuita em menos de 2 minutos. Sem cartao de credito, sem compromisso. Veja onde esta o dinheiro do seu restaurante.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://app.rooksystem.com.br/registro"
              className="btn-primary text-lg px-10 py-4"
            >
              Comecar Gratis Agora
            </Link>
          </div>

          <p className="mt-6 text-body-sm text-rook-text-dim">
            Plano Pawn gratuito para sempre. Upgrade quando estiver pronto.
          </p>
        </div>
      </div>
    </section>
  )
}
