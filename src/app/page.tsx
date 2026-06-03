import Link from "next/link";

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <p className="section-label mb-4">— Gestão financeira para food service</p>
          <h1 className="text-4xl lg:text-[3.5rem] font-bold leading-[1.1] mb-6">
            Faturar não é <em className="not-italic text-terracota">lucrar.</em>
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
            60% dos restaurantes fecham em 5 anos. 80% dos donos não sabem o CMV real.
            A Rook mostra onde está o dinheiro — e o que fazer com ele.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/planos/" className="btn-primary">Começar grátis</Link>
            <Link href="/funcionalidades/" className="btn-ghost">Ver funcionalidades</Link>
          </div>
        </div>

        {/* Right — 3 product cards mosaic */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 col-span-2">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Diagnóstico Anual</p>
            <p className="text-sm text-muted">11 páginas · Score de 0 a 100 por área · Recomendações com impacto em R$</p>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Calculadora CMV</p>
            <p className="text-sm text-muted">Simule economia em segundos</p>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Chess Multi-CNPJ</p>
            <p className="text-sm text-muted">Ranking entre filiais</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { value: "6", label: "Pilares de análise" },
          { value: "11", label: "Páginas no relatório" },
          { value: "4", label: "Regimes tributários" },
          { value: "∞", label: "CNPJs no Chess" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-bold text-terracota">{s.value}</p>
            <p className="text-sm text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Manifesto ─── */
function Manifesto() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <p className="section-label mb-4">— O problema</p>
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6">
            Você sabe quanto <em className="not-italic text-terracota">sobrou</em> este mês?
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Entre o pedido no salão e o lucro no bolso há seis camadas — vendas, custos, impostos,
            despesas, endividamento, resultado — e cada uma pode estar corroendo a margem agora.
          </p>
          <p className="text-muted leading-relaxed">
            Planilha em Excel, &ldquo;feeling&rdquo; do gerente, conversa solta com o contador uma vez por ano.
            A maioria dos restaurantes opera no escuro. A Rook acende a luz.
          </p>
        </div>
        <div className="flex flex-col gap-6 justify-center">
          {[
            { wrong: "Receita ≠ Lucro", right: "DRE mostra a diferença" },
            { wrong: "CMV no achismo", right: "Benchmark por segmento" },
            { wrong: "Imposto no automático", right: "Simulação de 4 regimes" },
          ].map((item) => (
            <div key={item.wrong} className="card p-5 flex items-center gap-4">
              <span className="text-red-400 font-mono text-sm line-through">{item.wrong}</span>
              <span className="text-floresta font-mono text-sm">→ {item.right}</span>
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
    { q: "Preciso de contador para usar?", a: "Não. A Rook foi feita para o dono do restaurante. O relatório é claro o suficiente para você e auditável o suficiente para seu contador." },
    { q: "Quanto tempo leva para configurar?", a: "Menos de 10 minutos. Você preenche os dados financeiros básicos e o diagnóstico é gerado automaticamente." },
    { q: "Funciona para qualquer tipo de restaurante?", a: "Sim. Restaurantes, cafeterias, bares, padarias, dark kitchens — qualquer operação de food service." },
    { q: "Posso cancelar a qualquer momento?", a: "Sim. Sem fidelidade, sem multa. Mensal cancela no mês seguinte, anual vale até o fim do período." },
    { q: "Meus dados estão seguros?", a: "Infraestrutura em nuvem com criptografia em trânsito e em repouso. Seus dados financeiros nunca são compartilhados." },
    { q: "O que acontece quando meu plano vence?", a: "Você volta para o plano Pawn (gratuito). Seus dados ficam salvos por 90 dias para reativação." },
  ];

  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-16">
        {/* Left */}
        <div>
          <p className="section-label mb-4">— Perguntas frequentes</p>
          <h2 className="text-3xl font-bold mb-4">Ainda tem <em className="not-italic text-terracota">dúvidas?</em></h2>
          <p className="text-muted text-sm mb-6">Se não encontrar sua resposta aqui, fale com a gente.</p>
          <a href="mailto:contato@rooksystem.com.br" className="btn-ghost text-sm">Falar com a equipe</a>
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
    <section className="py-24 border-t border-border text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="section-label mb-4">— Pronto para ver os seus números?</p>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Comece <em className="not-italic text-terracota">grátis.</em></h2>
        <p className="text-muted mb-8">Plano Pawn sem cartão de crédito. Quando quiser mais, evolua para Knight, Rook ou Chess.</p>
        <Link href="/planos/" className="btn-primary">Ver planos →</Link>
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
