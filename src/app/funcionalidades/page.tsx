import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Funcionalidades',
  description:
    'Controle de CMV, curva ABC, DRE simplificado, alertas de desvio e mais. Conheca todas as funcionalidades do Rook System para gestao financeira de restaurantes.',
  alternates: { canonical: 'https://rooksystem.com.br/funcionalidades' },
}

const features = [
  {
    category: 'Controle de CMV',
    items: [
      {
        title: 'CMV por Categoria NCM',
        description: 'Classificacao automatica de insumos em proteinas, laticinios, bebidas, FLV, mercearia e outros. Cada item rastreavel ate a NF-e de origem.',
      },
      {
        title: 'Tendencias de Custo',
        description: 'Visualize a evolucao do CMV mes a mes. Identifique sazonalidades e desvios antes que impactem a margem.',
      },
      {
        title: 'Alertas de Desvio',
        description: 'Receba notificacoes quando um fornecedor aumentar preco acima do threshold ou quando uma categoria ultrapassar o CMV-alvo.',
      },
    ],
  },
  {
    category: 'Analise de Compras',
    items: [
      {
        title: 'Curva ABC de Fornecedores',
        description: 'Identifique quais fornecedores concentram maior volume de compra e onde ha oportunidade de renegociacao.',
      },
      {
        title: 'Variacao de Preco',
        description: 'Compare precos do mesmo item entre fornecedores e ao longo do tempo. Encontre a melhor janela de compra.',
      },
      {
        title: 'Historico de Compras',
        description: 'Acesse todo o historico de compras com filtros por fornecedor, categoria, periodo e valor.',
      },
    ],
  },
  {
    category: 'Visao Financeira',
    items: [
      {
        title: 'DRE Simplificado',
        description: 'Demonstrativo de Resultado do Exercicio adaptado para food service: receita bruta, deducoes, CMV, margem bruta, despesas operacionais e resultado.',
      },
      {
        title: 'Score de Saude (Chess)',
        description: 'Diagnostico com 6 pilares (CMV, Compras, Margem, Estoque, Receita, Fiscal) gerando um score de 0 a 100.',
      },
      {
        title: 'Projecoes e Cenarios',
        description: 'Simule cenarios de aumento de custo, reducao de receita ou mudanca de mix para antecipar impactos na margem.',
      },
    ],
  },
  {
    category: 'Integracao e Dados',
    items: [
      {
        title: 'Import de XML (NF-e)',
        description: 'Importe notas fiscais eletronicas em lote. A Rook extrai automaticamente fornecedor, itens, valores e impostos.',
      },
      {
        title: 'Integracao ERP/PDV',
        description: 'Conecte com sistemas de frente de caixa e ERP para fluxo automatico de dados de venda e compra.',
      },
      {
        title: 'Rastreabilidade Fiscal',
        description: 'Cada numero no dashboard e rastreavel ate a nota fiscal de origem. 100% auditavel, zero achismo.',
      },
    ],
  },
]

export default function FuncionalidadesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32" aria-labelledby="feat-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-label mb-4">Funcionalidades</p>
            <h1 id="feat-heading" className="text-display-lg">
              Tudo que voce precisa para{' '}
              <span className="gold-gradient-text">controlar a margem</span>
            </h1>
            <p className="mt-6 text-body-lg text-rook-text-muted">
              Ferramentas especializadas em food service, construidas sobre dados fiscais reais. Sem input manual, sem achismo.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      {features.map((group) => (
        <section key={group.category} className="py-16 even:bg-rook-surface" aria-labelledby={`feat-${group.category}`}>
          <div className="section-container">
            <h2 id={`feat-${group.category}`} className="text-display-sm text-gold mb-8">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {group.items.map((item) => (
                <article key={item.title} className="card">
                  <h3 className="text-lg font-semibold text-rook-text mb-2">{item.title}</h3>
                  <p className="text-body-md text-rook-text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="section-container">
          <h2 className="text-display-md mb-6">Pronto para ver na pratica?</h2>
          <Link href="https://app.rooksystem.com.br/registro" className="btn-primary text-lg px-8 py-4">
            Criar Conta Gratuita
          </Link>
        </div>
      </section>
    </div>
  )
}
