import Link from "next/link";

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="section-spacing">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <p className="section-label mb-6">— Inteligência financeira para donos de restaurante</p>
          <h1 className="heading-hero mb-8">
            Faturar não é <em>lucrar.</em>
          </h1>
          <p className="text-body mb-8">
            Num setor que movimenta <strong className="text-cream">R$ 495 bilhões por ano</strong>, a maioria
            dos restaurantes mal passa de 10% de lucro — e seis em cada dez não chegam aos cinco anos.
            O que separa quem fatura de quem lucra são números que quase ninguém acompanha.{" "}
            <strong className="text-cream">O Rook coloca todos eles na sua frente.</strong>
          </p>
          <p className="text-xs text-muted/70 mb-6 font-mono">
            Setor: Abrasel, 2025 · Mortalidade: IBGE, empresas brasileiras, 2022
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/planos/" className="btn-primary">Testar por 7 dias</Link>
            <Link href="/funcionalidades/" className="btn-ghost">Conhecer o produto</Link>
            <span className="text-xs text-muted font-mono uppercase tracking-wider">7 dias de teste · cartão obrigatório</span>
          </div>
        </div>

        {/* Right — 3 product cards mosaic */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 col-span-2">
            <p className="font-mono text-xs text-muted uppercase tracking-wider mb-2">— Score do mês</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-floresta">83</span>
              <div>
                <p className="text-sm font-semibold text-cream">Bom</p>
                <p className="text-xs text-muted">4 de 6 pilares saudáveis</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">— Recomendação</p>
            <p className="text-xs text-muted mb-1">Migração para <strong className="text-cream">Lucro Presumido</strong> pode economizar</p>
            <p className="text-xl font-bold text-floresta">R$ 124k<span className="text-xs text-muted font-normal"> / ano</span></p>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">— Atenção</p>
            <p className="text-xs text-muted mb-1"><strong className="text-cream">Top fornecedor</strong> concentra</p>
            <p className="text-xl font-bold text-terracota">41%<span className="text-xs text-muted font-normal"> do CMV</span></p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="max-w-7xl mx-auto px-6 mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { value: "R$ 495 bi", label: "O tamanho do setor", source: "Abrasel, 2025" },
          { value: "39%", label: "Controlam contas na planilha ou caderno", source: "Conta Simples + Visa, 2024" },
          { value: "37%", label: "Com contas em atraso", source: "Abrasel, mai/2025" },
          { value: "62,7%", label: "Das empresas fecham em 5 anos", source: "IBGE, 2022" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl lg:text-3xl font-bold text-terracota">{s.value}</p>
            <p className="text-sm text-muted mt-1">{s.label}</p>
            <p className="text-[10px] text-muted/60 mt-0.5 font-mono uppercase tracking-wider">{s.source}</p>
          </div>
        ))}
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
              Movimento no caixa é uma <strong className="text-cream">sensação</strong>. Lucro é um{" "}
              <strong className="text-cream">número</strong>. Entre os dois, o dinheiro passa por seis casas:
              vendas, custos, impostos, despesas, dívidas e resultado. Em cada uma, a margem pode estar
              escapando sem você ver.
            </p>
            <p>
              A maioria dos restaurantes joga sem enxergar o tabuleiro inteiro — planilha solta,
              &ldquo;feeling&rdquo; do gerente, conversa com o contador uma vez por ano.
            </p>
            <p>
              O Rook põe as <strong className="text-cream">seis casas na mesma tela</strong> e mostra em qual
              delas o seu dinheiro está indo embora.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5 justify-center">
          {[
            { contrast: "Receita ≠ Lucro", desc: "O que entra no caixa não é o que fica no bolso. Entre os dois há 6 pilares — e qualquer um deles pode estar corroendo sua margem agora." },
            { contrast: "Faturamento ≠ Resultado", desc: "Crescer 30% em vendas e perder dinheiro acontece todo mês em food service. Sem visão por linha de DRE, ninguém sabe explicar onde." },
            { contrast: "Movimento ≠ Margem", desc: "Filas no salão, delivery cheio, ticket bom — e a margem real pode ser positiva ou negativa. A diferença muda decisões importantes." },
            { contrast: "Dívida ≠ Estratégia", desc: "Financiamento pode ser alavanca ou armadilha. Sem saber quanto da receita você precisa para amortizar a dívida, o resultado é o aumento insustentável do endividamento." },
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

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    { q: "Como funciona a Rook?", a: "O Rook coleta, analisa e interpreta os dados financeiros e fiscais do seu restaurante, classificando cada linha com base em metodologia contábil e traduzindo tudo em um diagnóstico. Pelo fluxo de caixa ou pelo DRE, você recebe recomendações direcionadas à construção do seu lucro." },
    { q: "Funciona em qualquer cidade do Brasil?", a: "Sim. O Rook opera em todos os 26 estados + Distrito Federal. O cálculo tributário considera a UF do estabelecimento automaticamente — você só precisa ter o cadastro do CNPJ correto." },
    { q: "É seguro? Quem mais vê meus dados?", a: "Os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Cada empresa tem seu próprio ambiente isolado — ninguém vê seus números fora da sua equipe. O Rook está adequado à LGPD." },
    { q: "Preciso mudar de contador?", a: "Não. O Rook é uma inteligência de performance para o dono — ele não substitui o contador, nem precisa dele para funcionar." },
    { q: "Preciso trocar o sistema que já uso?", a: "Não. O Rook não substitui seu PDV ou ERP — nossa metodologia lê seus dados e traduz seu resultado. Para aumentar ainda mais a nossa capacidade de análise, possuímos integração com os principais ERPs do mercado.", cta: { label: "Caso seu ERP ainda não tenha integração, solicite aqui.", href: "mailto:contato@rooksystem.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20integra%C3%A7%C3%A3o%20com%20ERP" } },
    { q: "Posso testar antes de pagar?", a: "Sim. O período de teste dura 7 dias, é oferecido uma vez por Empresa/CNPJ e exige um cartão válido. Se você cancelar antes do término, a primeira cobrança não será realizada." },
    { q: "Como funciona o pagamento?", a: "A oferta padrão tem cobrança mensal recorrente em reais. Ao final do período de teste, a mensalidade do plano contratado é cobrada no meio de pagamento cadastrado." },
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
      <FAQ />
      <CTA />
    </>
  );
}
