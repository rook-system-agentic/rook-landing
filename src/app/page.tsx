import Link from "next/link";

/* ─── Hero ─── */
const STATS = [
  { value: "R$ 495 bi", label: "O tamanho do setor", source: "Abrasel, 2025" },
  { value: "39%", label: "Controlam contas na planilha ou caderno", source: "Conta Simples + Visa, 2024" },
  { value: "37%", label: "Com contas em atraso", source: "Abrasel, mai/2025" },
  { value: "62,7%", label: "Das empresas fecham em 5 anos", source: "IBGE, 2024" },
];

function Hero() {
  return (
    <section className="section-spacing">
      {/* items-start: com quatro cards a coluna direita ficou ~300px mais alta
          que a esquerda, e o items-center empurrava o título 154px para baixo,
          abrindo um vazio acima da manchete. */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div>
          <p className="section-label mb-6">— Sistema de Inteligência Financeira e Gestão para Restaurantes</p>
          <h1 className="heading-hero mb-8">
            Faturar não é <em>lucrar.</em>
          </h1>
          <p className="text-body mb-8">
            Num setor que movimenta <strong className="text-cream">R$ 495 bilhões por ano</strong>, aproximadamente
            60% dos bares e restaurantes não geram lucro. O que separa as empresas que sobrevivem
            das que lucram e prosperam é a gestão pelos números corretos.{" "}
            <strong className="text-cream">O Rook é a inteligência financeira que te apoia na coleta, análise e interpretação desses dados.</strong>
          </p>
          <p className="text-xs text-muted/70 mb-6 font-mono">
            Setor: Abrasel, 2025 · Mortalidade: IBGE, empresas brasileiras, 2024
          </p>

          {/* Números do setor — ficavam numa faixa solta abaixo do hero. Com os
              quatro cards de módulos a coluna direita ficou ~300px mais alta, e
              sobrava um vazio aqui embaixo; trazê-los para dentro dele equilibra
              as colunas e encurta a página. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 mt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl lg:text-3xl font-bold text-terracota">{s.value}</p>
                <p className="text-sm text-muted mt-1">{s.label}</p>
                <p className="text-[10px] text-muted/60 mt-0.5 font-mono uppercase tracking-wider">{s.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Module highlights */}
        <div className="grid grid-cols-1 gap-4">
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">— Vendas e Tributos</p>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Faturamento diário, semanal e mensal, com pacote completo de indicadores de performance</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Projeções ajustadas para suporte ao planejamento operacional</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Comunicação ativa via WhatsApp para acompanhamento diário, semanal e mensal</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Análise mensal dos impostos apurados</li>
            </ul>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">— Compras (CMV)</p>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Compras diárias, semanais e mensais com pacote completo de indicadores de performance e controle</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>CMV real vs. meta por período, com limite de compras</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Monitoramento de preços dos insumos com alerta de inflação</li>
            </ul>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">— Despesas</p>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Despesas com vendas — análise e comparação com benchmarking</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Despesas com pessoal — monitoramento do Custo de Mão de Obra (CMO) com indicadores de produtividade</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Despesas administrativas — clareza sobre ocupação, serviços, manutenções e gastos gerais</li>
            </ul>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">— Resultados</p>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>DRE gerencial, fluxo de caixa realizado e projeções de receita e compras</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Score de saúde financeira e liquidez</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Análise de endividamento</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Manifesto ─── */
function Manifesto() {
  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <p className="section-label mb-6">— A pergunta de quase todo dono de restaurante</p>
          <h2 className="heading-section mb-8">
            Você sabe quanto <em>sobrou</em> no final do mês?
          </h2>
          <div className="text-body space-y-4">
            <p>
              Movimento no caixa é uma <strong className="text-cream">percepção</strong>. Lucro é{" "}
              <strong className="text-cream">uma realidade</strong>. Entre os dois, o dinheiro passa por seis etapas:
              vendas, impostos, custos, despesas, dívidas e resultado. Em cada uma, a margem pode estar
              escapando sem você ver.
            </p>
            <p>
              A maioria dos restaurantes joga sem enxergar o tabuleiro e sem uma estratégia clara
              para ganhar o jogo — planilhas superficiais, &ldquo;feeling&rdquo; do gerente, sem
              fundamento econômico, financeiro ou contábil.
            </p>
            <p>
              O Rook organiza as <strong className="text-cream">seis etapas na mesma tela</strong>, trazendo
              visão, estratégia e controle.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5 justify-center">
          {[
            { contrast: "Receita ≠ Lucro", desc: "O que entra no caixa não é o que fica no bolso — entre os dois há 6 etapas. Crescer 30% em vendas e ainda assim perder dinheiro acontece todo mês em food service: sem visão por linha de DRE, ninguém sabe em qual etapa a margem se perdeu." },
            { contrast: "Movimento ≠ Margem", desc: "Filas no salão, delivery cheio, ticket bom — e a margem real pode ser positiva ou negativa. Decidir pelo número certo, e não pela sensação de movimento, muda o resultado do mês inteiro." },
            { contrast: "Dívida ≠ Estratégia", desc: "Financiamento pode ser alavanca ou armadilha. Sem saber o porquê do endividamento e sem ter a certeza de como pagá-lo, o resultado é a queima insustentável de caixa." },
          ].map((item) => (
            <div key={item.contrast} className="card p-5">
              <p className="font-semibold text-cream mb-1">{item.contrast}</p>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Summary ─── */
function PricingSummary() {
  return (
    <section className="section-spacing border-t border-border" aria-labelledby="pricing-title">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-6">— Planos e preços</p>
          <h2 id="pricing-title" className="heading-section mb-4">
            Quanto custa o <em>Rook?</em>
          </h2>
          <p className="text-body mx-auto text-center">
            O enquadramento é por faturamento bruto mensal. Ambos os planos entregam acesso completo à plataforma.
            Teste grátis por 7 dias.
          </p>
        </div>

        {/* Os DOIS planos base — a escolha é entre eles, por faixa de
            faturamento. O Chess não entra aqui: ele soma a um destes, e num
            grid de três colunas iguais aparecia como a opção mais barata da
            linha, que é o oposto do que ele é. */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Knight */}
          <div className="card p-6 text-center">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Knight</p>
            <p className="text-3xl font-bold text-cream">R$ 479,90<span className="text-sm font-normal text-muted">/mês</span></p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Para estabelecimentos com faturamento mensal de até R$ 250 mil.
            </p>
            <p className="text-xs text-muted/70 mt-2">Acesso completo à plataforma</p>
          </div>

          {/* Rook */}
          <div className="card p-6 text-center border-terracota/30">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Rook</p>
            <p className="text-3xl font-bold text-cream">R$ 779,90<span className="text-sm font-normal text-muted">/mês</span></p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Para estabelecimentos com faturamento mensal acima de R$ 250 mil.
            </p>
            <p className="text-xs text-muted/70 mt-2">Acesso completo à plataforma</p>
          </div>
        </div>

        {/* Chess — add-on. O "+" antes do preço é o que diz, sem precisar de
            explicação, que este valor SOMA ao do plano escolhido. */}
        <div className="max-w-3xl mx-auto mt-6">
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">
                Chess · Add-on
              </p>
              <p className="text-sm text-muted leading-relaxed">
                Para redes e franquias: consolidação de grupo e visão multiunidade,
                somada ao plano escolhido acima.
              </p>
            </div>
            <p className="text-2xl font-bold text-cream text-center sm:text-right whitespace-nowrap">
              + R$ 279,90<span className="text-sm font-normal text-muted">/mês</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/planos/" className="btn-primary">Ver detalhes e contratar →</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    { q: "Quanto custa o Rook System?", a: "O Rook tem dois planos base: Knight (R$ 479,90/mês) para restaurantes com faturamento de até R$ 250 mil/mês, e Rook (R$ 779,90/mês) para faturamento acima de R$ 250 mil/mês. Ambos oferecem acesso completo à plataforma. Para redes e franquias, há o add-on Chess (R$ 279,90/mês por grupo econômico). Todos incluem 7 dias de teste grátis." },
    { q: "Como funciona o Rook?", a: "O Rook coleta, analisa e interpreta os dados financeiros e fiscais do seu restaurante, classificando cada linha com base em metodologia contábil e traduzindo tudo em um diagnóstico. Pelo fluxo de caixa ou pelo DRE, você recebe recomendações direcionadas à construção do seu lucro." },
    { q: "Funciona em qualquer cidade do Brasil?", a: "Sim. O Rook opera em todos os 26 estados + Distrito Federal. O cálculo tributário considera a UF do estabelecimento automaticamente — você só precisa ter o cadastro do CNPJ correto." },
    { q: "É seguro? Quem mais vê meus dados?", a: "Os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Cada empresa tem seu próprio ambiente isolado — ninguém vê seus números fora da sua equipe. O Rook está adequado à LGPD." },
    { q: "Preciso mudar de contador?", a: "Não. O Rook é uma inteligência de performance para o dono — ele não substitui o contador." },
    { q: "Preciso trocar o sistema que já uso?", a: "Não. O Rook não substitui seu PDV ou ERP — nossa metodologia lê seus dados e traduz seu resultado. Para aumentar ainda mais a nossa capacidade de análise, possuímos integração com os principais ERPs do mercado.", cta: { label: "Caso seu ERP ainda não tenha integração, solicite aqui.", href: "mailto:contato@rooksystem.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20integra%C3%A7%C3%A3o%20com%20ERP" } },
    { q: "Posso testar antes de pagar?", a: "Sim. O período de teste dura 7 dias, é oferecido uma vez por Empresa/CNPJ e exige um cartão válido. Se você cancelar antes do término, a primeira cobrança não será realizada." },
    { q: "Como funciona o pagamento?", a: "A oferta padrão tem cobrança mensal recorrente em reais. O plano Knight custa R$ 479,90/mês e o Rook custa R$ 779,90/mês. Ao final do período de teste de 7 dias, a mensalidade do plano contratado é cobrada no meio de pagamento cadastrado." },
    { q: "Posso cancelar quando quiser?", a: "Sim. O cancelamento pode ser solicitado pela plataforma ou pelo suporte, com antecedência mínima de 15 dias do fim do ciclo, e produz efeitos ao final do período pago." },
  ];

  return (
    <section className="section-spacing border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-16">
        {/* Left */}
        <div>
          <p className="section-label mb-6">— Perguntas</p>
          <h2 className="heading-section mb-4">Antes de <em>começar.</em></h2>
          <p className="text-body mb-6">As dúvidas mais comuns dos donos de restaurante que estão avaliando o Rook. Não encontrou o que precisa?</p>
          <a href="mailto:contato@rooksystem.com.br" className="btn-ghost text-sm">Enviar e-mail →</a>
        </div>

        {/* Right — FAQ items */}
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="card p-5 group">
              <summary className="cursor-pointer font-semibold text-cream flex items-center justify-between">
                {f.q}
                <span className="text-ocre group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted leading-relaxed">{f.a}</p>
              {f.cta && (
                <a href={f.cta.href} className="mt-3 inline-block text-sm text-ocre hover:text-cream transition-colors underline underline-offset-4">
                  {f.cta.label}
                </a>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="section-spacing border-t border-border text-center">
      <div className="max-w-3xl mx-auto px-6">
        <p className="section-label mb-6">— Pronto para ver os seus números?</p>
        <h2 className="heading-section mb-4">Teste por <em>7 dias.</em></h2>
        <p className="text-body mx-auto text-center mb-8">Escolha o plano adequado ao faturamento do seu estabelecimento. Organizações multiunidade também podem contratar o módulo Chess.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/planos/" className="btn-primary">Ver planos e testar →</Link>
          <Link href="/funcionalidades/" className="btn-ghost">Conhecer o produto</Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <PricingSummary />
      <FAQ />
      <CTA />
    </>
  );
}
