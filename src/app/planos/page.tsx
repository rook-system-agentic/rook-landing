import type { Metadata } from 'next'
import { PlansPreview } from '@/components/sections/PlansPreview'

export const metadata: Metadata = {
  title: 'Planos e Precos',
  description:
    'Planos a partir de R$0/mes. Pawn (gratuito), Knight (R$197/mes), Rook (R$497/mes) e Chess (enterprise). Desconto de 25% no plano anual. Sem fidelidade.',
  alternates: { canonical: 'https://rooksystem.com.br/planos' },
}

export default function PlanosPage() {
  return (
    <div className="pt-20">
      <PlansPreview />

      {/* Comparison table */}
      <section className="py-24 lg:py-32" aria-labelledby="compare-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 id="compare-heading" className="text-display-md">
              Compare os planos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Comparativo de planos">
              <thead>
                <tr className="border-b border-rook-border">
                  <th className="py-4 px-4 text-body-sm text-rook-text-dim font-medium">Recurso</th>
                  <th className="py-4 px-4 text-body-sm text-rook-text-dim font-medium text-center">Pawn</th>
                  <th className="py-4 px-4 text-body-sm text-rook-text-dim font-medium text-center">Knight</th>
                  <th className="py-4 px-4 text-body-sm text-rook-text-dim font-medium text-center">Rook</th>
                  <th className="py-4 px-4 text-body-sm text-rook-text-dim font-medium text-center">Chess</th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {[
                  ['Calculos CMV', '3/mes', 'Ilimitado', 'Ilimitado', 'Ilimitado'],
                  ['Historico', '-', '12 meses', '24 meses', 'Ilimitado'],
                  ['Dashboard', 'Basico', 'Completo', 'Completo', 'Customizado'],
                  ['Usuarios', '1', '3', '10', 'Ilimitado'],
                  ['Curva ABC', '-', '-', 'Sim', 'Sim'],
                  ['Integracao ERP/PDV', '-', '-', 'Sim', 'Sim'],
                  ['Analise Preditiva', '-', '-', 'Sim', 'Sim'],
                  ['API Dedicada', '-', '-', '-', 'Sim'],
                  ['SLA', '-', '-', '-', 'Garantido'],
                  ['Suporte', 'Comunidade', 'Email', 'Prioritario', 'Gerente dedicado'],
                ].map(([feature, ...values]) => (
                  <tr key={feature} className="border-b border-rook-border/50 hover:bg-rook-surface/30">
                    <td className="py-3 px-4 text-rook-text-muted">{feature}</td>
                    {values.map((val, i) => (
                      <td key={i} className="py-3 px-4 text-center text-rook-text-muted">
                        {val === 'Sim' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline text-gold">
                            <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ) : val === '-' ? (
                          <span className="text-rook-text-dim">—</span>
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
