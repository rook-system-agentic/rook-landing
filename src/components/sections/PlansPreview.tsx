'use client'

import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Pawn',
    subtitle: 'Gratuito',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Para quem quer comecar a entender seu CMV.',
    features: [
      'Calculadora basica de CMV',
      'Limite de 3 calculos/mes',
      '1 usuario',
      'Dados nao persistidos',
    ],
    cta: 'Comecar Gratis',
    href: 'https://app.rooksystem.com.br/registro?plan=pawn',
    highlighted: false,
  },
  {
    name: 'Knight',
    subtitle: 'Essencial',
    monthlyPrice: 197,
    annualPrice: 148,
    description: 'Para restaurantes que querem controle real.',
    features: [
      'Calculos ilimitados',
      'Historico 12 meses',
      'Dashboard completo',
      'Projecoes e tendencias',
      'Ate 3 usuarios',
      'Suporte por email',
    ],
    cta: 'Assinar Knight',
    href: 'https://app.rooksystem.com.br/registro?plan=knight',
    highlighted: false,
  },
  {
    name: 'Rook',
    subtitle: 'Profissional',
    monthlyPrice: 497,
    annualPrice: 373,
    description: 'Para operacoes que exigem excelencia.',
    features: [
      'Tudo do Knight +',
      'Integracao ERP/PDV',
      'Analise preditiva',
      'Curva ABC completa',
      'Projecoes 24 meses',
      'Ate 10 usuarios',
      'Suporte prioritario',
    ],
    cta: 'Assinar Rook',
    href: 'https://app.rooksystem.com.br/registro?plan=rook',
    highlighted: true,
  },
  {
    name: 'Chess',
    subtitle: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'Para redes e grupos com necessidades especificas.',
    features: [
      'Tudo do Rook +',
      'Multi-unidades',
      'API dedicada',
      'SLA garantido',
      'Onboarding personalizado',
      'Usuarios ilimitados',
      'Gerente de conta',
    ],
    cta: 'Falar com Vendas',
    href: '#contato',
    highlighted: false,
  },
]

export function PlansPreview() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="py-24 lg:py-32 bg-rook-surface" aria-labelledby="plans-heading" id="planos">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="section-label mb-4">Planos</p>
          <h2 id="plans-heading" className="text-display-md">
            Invista no controle.{' '}
            <span className="gold-gradient-text">Colha margem.</span>
          </h2>
          <p className="mt-6 text-body-lg text-rook-text-muted">
            Todos os planos incluem dados 100% auditaveis e rastreabilidade fiscal completa.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-body-md ${!annual ? 'text-rook-text' : 'text-rook-text-dim'}`}>Mensal</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-gold' : 'bg-rook-border'}`}
            aria-label={annual ? 'Mudar para plano mensal' : 'Mudar para plano anual'}
            role="switch"
            aria-checked={annual}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${annual ? 'translate-x-8' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-body-md ${annual ? 'text-rook-text' : 'text-rook-text-dim'}`}>
            Anual <span className="text-accent-green text-body-sm font-medium">-25%</span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col p-6 rounded-rook-lg border transition-all ${
                plan.highlighted
                  ? 'border-gold bg-rook-bg shadow-gold'
                  : 'border-rook-border bg-rook-bg hover:border-rook-border-light'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-rook-bg text-body-sm font-semibold rounded-full">
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-display-sm font-bold text-rook-text">{plan.name}</h3>
                <p className="text-body-sm text-rook-text-dim">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-display-md text-rook-text font-bold">
                      R${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-body-sm text-rook-text-dim">/mes</span>
                    {annual && plan.monthlyPrice > 0 && (
                      <p className="text-body-sm text-rook-text-dim line-through mt-1">
                        R${plan.monthlyPrice}/mes
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-display-sm text-rook-text font-bold">Sob consulta</span>
                )}
              </div>

              <p className="text-body-sm text-rook-text-muted mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5 text-gold">
                      <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="text-body-sm text-rook-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-auto text-center py-3 px-4 rounded-rook font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-gold text-rook-bg hover:bg-gold-light'
                    : 'border border-rook-border text-rook-text hover:border-gold hover:text-gold'
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
