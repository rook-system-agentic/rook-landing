import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'Conheca a historia do Rook System. Fundado por Gabriel Abdala e Eraldo Paixao, o Rook nasceu para resolver o problema que mais fecha restaurantes: falta de controle financeiro.',
  alternates: { canonical: 'https://rooksystem.com.br/sobre' },
}

export default function SobrePage() {
  return (
    <div className="pt-20">
      <section className="py-24 lg:py-32" aria-labelledby="about-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <p className="section-label mb-4">Sobre Nos</p>
            <h1 id="about-heading" className="text-display-lg mb-8">
              Nascemos para resolver o problema que mais{' '}
              <span className="gold-gradient-text">fecha restaurantes</span>
            </h1>

            <div className="space-y-6 text-body-lg text-rook-text-muted leading-relaxed">
              <p>
                O Rook System nasceu da experiencia direta com a realidade financeira de restaurantes brasileiros. Vimos de perto operacoes que faturavam R$200k/mes e nao sabiam se estavam lucrando. Vimos donos trabalhando 14 horas por dia sem saber para onde ia o dinheiro.
              </p>
              <p>
                O problema nao era falta de esforco. Era falta de <strong className="text-rook-text">visibilidade</strong>. Planilhas manuais, ERPs generalistas e contadores que entregam balancetes 45 dias depois nao resolvem a dor de quem precisa tomar decisoes hoje.
              </p>
              <p>
                Fundamos a Rook com uma missao clara: <strong className="text-rook-text">dar ao dono de restaurante a mesma qualidade de informacao financeira que uma grande rede tem</strong>, mas com a simplicidade que uma operacao de 1 unidade precisa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-16 bg-rook-surface" aria-labelledby="founders-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 id="founders-heading" className="text-display-sm text-gold mb-8">Fundadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="card">
                <h3 className="text-lg font-bold text-rook-text">Gabriel Abdala</h3>
                <p className="text-body-sm text-gold mb-3">Produto e Estrategia</p>
                <p className="text-body-md text-rook-text-muted">
                  Atua na intersecao entre produto, financas e execucao. Foco em decisoes baseadas em dados com clareza de trade-offs e impactos.
                </p>
              </article>
              <article className="card">
                <h3 className="text-lg font-bold text-rook-text">Eraldo Paixao</h3>
                <p className="text-body-sm text-gold mb-3">Financas e Turnaround</p>
                <p className="text-body-md text-rook-text-muted">
                  Especialista em reestruturacao financeira de restaurantes. Experiencia direta em diagnostico e recuperacao de operacoes food service.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24" aria-labelledby="values-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 id="values-heading" className="text-display-sm text-gold mb-8">Principios</h2>
            <div className="space-y-6">
              {[
                { title: 'Dados primeiro, opiniao depois', desc: 'Toda recomendacao e baseada em dados fiscais reais, nao em estimativas ou benchmarks genericos.' },
                { title: 'Rastreabilidade total', desc: 'Cada numero no sistema e auditavel ate a nota fiscal de origem. Zero caixa-preta.' },
                { title: 'Simplicidade que resolve', desc: 'Minimo necessario com qualidade maxima. Sem features que ninguem usa, sem complexidade desnecessaria.' },
                { title: 'Causa raiz, nao sintoma', desc: 'Nao mostramos apenas que o CMV subiu — mostramos qual fornecedor, qual categoria, qual item causou o desvio.' },
              ].map((value) => (
                <article key={value.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-3 bg-gold rounded-full" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-semibold text-rook-text">{value.title}</h3>
                    <p className="text-body-md text-rook-text-muted mt-1">{value.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company info — GEO: dados citaveis */}
      <section className="py-16 bg-rook-surface">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-sm text-gold mb-6">Informacoes</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-md">
              <div>
                <dt className="text-rook-text-dim">Razao Social</dt>
                <dd className="text-rook-text font-medium">CCGN LTDA</dd>
              </div>
              <div>
                <dt className="text-rook-text-dim">CNPJ</dt>
                <dd className="text-rook-text font-medium font-mono">51.629.346/0001-94</dd>
              </div>
              <div>
                <dt className="text-rook-text-dim">Fundacao</dt>
                <dd className="text-rook-text font-medium">2024</dd>
              </div>
              <div>
                <dt className="text-rook-text-dim">Segmento</dt>
                <dd className="text-rook-text font-medium">SaaS / Food Service / FinTech</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  )
}
