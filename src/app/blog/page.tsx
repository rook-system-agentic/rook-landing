import type { Metadata } from 'next'
import { NewsletterForm } from '@/components/ui/NewsletterForm'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Conteudo especializado em gestao financeira para restaurantes: benchmarks de CMV, otimizacao de compras, tendencias do food service e analise tributaria.',
  alternates: { canonical: 'https://rooksystem.com.br/blog' },
}

const upcomingTopics = [
  {
    category: 'Benchmarks',
    title: 'CMV medio por segmento: dados reais de restaurantes brasileiros',
    description: 'Margem, CMV, ticket medio e prime cost por porte e tipo de operacao.',
  },
  {
    category: 'Tributario',
    title: 'Simples Nacional vs Lucro Presumido: simulacao para food service',
    description: 'Mudancas regulatorias e simulacoes por regime tributario.',
  },
  {
    category: 'CMV e Compras',
    title: 'Como reduzir 15% do CMV sem cortar qualidade',
    description: 'Comportamento de categorias, sazonalidade e estrategias de compra.',
  },
  {
    category: 'Tendencias',
    title: 'O que os dados de 2025 mostram sobre o food service brasileiro',
    description: 'Comportamento do consumidor, sazonalidade e projecoes.',
  },
]

export default function BlogPage() {
  return (
    <div className="pt-20">
      <section className="py-24 lg:py-32" aria-labelledby="blog-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-label mb-4">Blog</p>
            <h1 id="blog-heading" className="text-display-lg mb-6">
              Conteudo para quem quer{' '}
              <span className="gold-gradient-text">lucrar de verdade</span>
            </h1>
            <p className="text-body-lg text-rook-text-muted">
              Em breve: artigos baseados em dados reais do mercado food service brasileiro. Benchmarks, analises e estrategias para proteger sua margem.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming topics */}
      <section className="py-16 bg-rook-surface" aria-labelledby="topics-heading">
        <div className="section-container">
          <h2 id="topics-heading" className="text-display-sm text-gold mb-8 text-center">
            Frentes Editoriais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {upcomingTopics.map((topic) => (
              <article key={topic.title} className="card">
                <p className="text-label text-gold mb-2">{topic.category}</p>
                <h3 className="text-lg font-semibold text-rook-text mb-2">{topic.title}</h3>
                <p className="text-body-md text-rook-text-muted">{topic.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24" aria-labelledby="newsletter-heading">
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center">
            <h2 id="newsletter-heading" className="text-display-sm mb-4">
              Receba em primeira mao
            </h2>
            <p className="text-body-lg text-rook-text-muted mb-8">
              Cadastre-se para receber nossos artigos, benchmarks e analises direto no seu email. Sem spam, conteudo de valor.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  )
}
