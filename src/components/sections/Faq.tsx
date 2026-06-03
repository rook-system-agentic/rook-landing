'use client'

const faqs = [
  {
    question: 'O que e CMV e por que e tao importante para restaurantes?',
    answer:
      'CMV (Custo de Mercadoria Vendida) e o indicador que mede quanto voce gasta em insumos para produzir o que vende. Em restaurantes, o CMV ideal fica entre 28% e 35% do faturamento. Acima disso, sua margem esta sendo corroida — mesmo que o faturamento pareca alto. A Rook calcula seu CMV real com base em dados fiscais, nao em estimativas.',
  },
  {
    question: 'Como a Rook e diferente de uma planilha ou ERP?',
    answer:
      'Planilhas dependem de input manual (propenso a erro) e ERPs sao generalistas. A Rook e especializada em food service: classifica automaticamente por categoria NCM, calcula CMV por grupo de produto, identifica tendencias e gera alertas. Tudo baseado em dados fiscais reais (XML de NF-e), nao em lancamentos manuais.',
  },
  {
    question: 'Preciso de contador ou conhecimento tecnico para usar?',
    answer:
      'Nao. A Rook foi desenhada para donos de restaurante, nao para contadores. A interface e intuitiva, os relatorios sao em linguagem de negocios e o onboarding guiado leva menos de 10 minutos. Se voce sabe ler uma nota fiscal, sabe usar a Rook.',
  },
  {
    question: 'Meus dados estao seguros?',
    answer:
      'Sim. Usamos criptografia em transito (TLS 1.3) e em repouso (AES-256). Seus dados ficam em servidores no Brasil, com backup diario e acesso restrito por autenticacao multi-fator. Somos LGPD-compliant e nunca compartilhamos dados individuais.',
  },
  {
    question: 'Quanto tempo leva para ver resultados?',
    answer:
      'Com 1 mes de dados fiscais importados, voce ja tem visibilidade completa do CMV por categoria. Com 3 meses, as tendencias e projecoes ficam confiaveis. Clientes reportam identificar oportunidades de economia de R$5k a R$15k/mes ja no primeiro relatorio.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim. Sem fidelidade, sem multa. Cancele quando quiser pelo proprio painel. Seus dados ficam disponiveis por 30 dias apos o cancelamento para exportacao.',
  },
]

export function FaqSection() {
  return (
    <section className="py-24 lg:py-32" aria-labelledby="faq-heading">
      {/* FAQ Schema for GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="section-label mb-4">FAQ</p>
          <h2 id="faq-heading" className="text-display-md">
            Perguntas frequentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border border-rook-border rounded-rook overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-rook-surface/50 transition-colors">
                <h3 className="text-body-lg font-medium text-rook-text pr-4 text-left">
                  {faq.question}
                </h3>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="faq-chevron flex-shrink-0 text-rook-text-dim"
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-body-md text-rook-text-muted leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
