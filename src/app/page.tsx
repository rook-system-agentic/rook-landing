import Link from "next/link";

/* ─── Hero ─── */
const STATS = [
  { value: "R$ 495 bi", label: "O tamanho do setor", source: "Abrasel, 2025" },
  { value: "39%", label: "Controlam contas na planilha ou caderno", source: "Conta Simples + Visa, 2024" },
  { value: "37%", label: "Com contas em atraso", source: "Abrasel, mai/2025" },
  { value: "62,7%", label: "Das empresas fecham em 5 anos", source: "IBGE, 2022" },
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
            Num setor que movimenta <strong className="text-cream">R$ 495 bilhões por ano</strong>, a maioria
            dos restaurantes mal passa de 10% de lucro — e seis em cada dez não chegam aos cinco anos.
            O que separa quem fatura de quem lucra são números que quase ninguém acompanha.{" "}
            <strong className="text-cream">O Rook é o sistema de inteligência financeira para restaurante que coloca todos eles na sua frente.</strong>
          </p>
          <p className="text-xs text-muted/70 mb-6 font-mono">
            Setor: Abrasel, 2025 · Mortalidade: IBGE, empresas brasileiras, 2022
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
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Projeções ajustadas de suporte ao planejamento operacional</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Comunicação ativa via WhatsApp para acompanhamento diário, semanal e mensal</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Validação mensal do cálculo apresentado pela sua contabilidade</li>
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
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Despesas com pessoal — monitoramento do CMO com indicadores de produtividade</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Despesas administrativas — clareza sobre ocupação, serviços, manutenções e gastos gerais</li>
            </ul>
          </div>
          <div className="card p-5">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">— Resultados</p>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>DRE gerencial, fluxo de caixa e projeções</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Score de saúde financeira e liquidez</li>
              <li className="flex items-start gap-2"><span className="text-floresta mt-0.5">✓</span>Open Finance com análise de endividamento</li>
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

/* ─── Pricing Summary ─── */
function PricingSummary() {
  return (
    <section className="section-spacing border-t border-border" aria-labelledby="pricing-title">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-6">— Planos e pre\u00E7os</p>
          <h2 id="pricing-title" className="heading-section mb-4">
            Quanto custa o <em>Rook?</em>
          </h2>
          <p className="text-body mx-auto text-center">
            O enquadramento \u00E9 por faturamento bruto mensal. Ambos os planos entregam acesso completo \u00E0 plataforma.
            Teste gr\u00E1tis por 7 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Knight */}
          <div className="card p-6 text-center">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Knight</p>
            <p className="text-3xl font-bold text-cream">R$ 479,90<span className="text-sm font-normal text-muted">/m\u00EAs</span></p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Para estabelecimentos com faturamento mensal de at\u00E9 R$ 250 mil.
            </p>
            <p className="text-xs text-muted/70 mt-2">Acesso completo \u00E0 plataforma</p>
          </div>

          {/* Rook */}
          <div className="card p-6 text-center border-terracota/30">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Rook</p>
            <p className="text-3xl font-bold text-cream">R$ 779,90<span className="text-sm font-normal text-muted">/m\u00EAs</span></p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Para estabelecimentos com faturamento mensal acima de R$ 250 mil.
            </p>
            <p className="text-xs text-muted/70 mt-2">Acesso completo \u00E0 plataforma</p>
          </div>

          {/* Chess */}
          <div className="card p-6 text-center">
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-2">Chess</p>
            <p className="text-3xl font-bold text-cream">R$ 279,90<span className="text-sm font-normal text-muted">/m\u00EAs</span></p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Add-on para organiza\u00E7\u00F5es multiunidade (redes e franquias).
            </p>
            <p className="text-xs text-muted/70 mt-2">Consolida\u00E7\u00E3o de grupo</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/planos/" className="btn-primary">Ver detalhes e contratar \u2192</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    { q: "Quanto custa o Rook System?", a: "O Rook tem dois planos base: Knight (R$ 479,90/m\u00EAs) para restaurantes com faturamento de at\u00E9 R$ 250 mil/m\u00EAs, e Rook (R$ 779,90/m\u00EAs) para faturamento acima de R$ 250 mil/m\u00EAs. Ambos oferecem acesso completo \u00E0 plataforma. Para redes e franquias, h\u00E1 o add-on Chess (R$ 279,90/m\u00EAs por organiza\u00E7\u00E3o). Todos incluem 7 dias de teste gr\u00E1tis." },
    { q: "Como funciona a Rook?", a: "O Rook coleta, analisa e interpreta os dados financeiros e fiscais do seu restaurante, classificando cada linha com base em metodologia cont\u00E1bil e traduzindo tudo em um diagn\u00F3stico. Pelo fluxo de caixa ou pelo DRE, voc\u00EA recebe recomenda\u00E7\u00F5es direcionadas \u00E0 constru\u00E7\u00E3o do seu lucro." },
    { q: "Funciona em qualquer cidade do Brasil?", a: "Sim. O Rook opera em todos os 26 estados + Distrito Federal. O c\u00E1lculo tribut\u00E1rio considera a UF do estabelecimento automaticamente \u2014 voc\u00EA s\u00F3 precisa ter o cadastro do CNPJ correto." },
    { q: "\u00C9 seguro? Quem mais v\u00EA meus dados?", a: "Os dados s\u00E3o criptografados em tr\u00E2nsito (TLS 1.3) e em repouso (AES-256). Cada empresa tem seu pr\u00F3prio ambiente isolado \u2014 ningu\u00E9m v\u00EA seus n\u00FAmeros fora da sua equipe. O Rook est\u00E1 adequado \u00E0 LGPD." },
    { q: "Preciso mudar de contador?", a: "N\u00E3o. O Rook \u00E9 uma intelig\u00EAncia de performance para o dono \u2014 ele n\u00E3o substitui o contador, nem precisa dele para funcionar." },
    { q: "Preciso trocar o sistema que j\u00E1 uso?", a: "N\u00E3o. O Rook n\u00E3o substitui seu PDV ou ERP \u2014 nossa metodologia l\u00EA seus dados e traduz seu resultado. Para aumentar ainda mais a nossa capacidade de an\u00E1lise, possu\u00EDmos integra\u00E7\u00E3o com os principais ERPs do mercado.", cta: { label: "Caso seu ERP ainda n\u00E3o tenha integra\u00E7\u00E3o, solicite aqui.", href: "mailto:contato@rooksystem.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20integra%C3%A7%C3%A3o%20com%20ERP" } },
    { q: "Posso testar antes de pagar?", a: "Sim. O per\u00EDodo de teste dura 7 dias, \u00E9 oferecido uma vez por Empresa/CNPJ e exige um cart\u00E3o v\u00E1lido. Se voc\u00EA cancelar antes do t\u00E9rmino, a primeira cobran\u00E7a n\u00E3o ser\u00E1 realizada." },
    { q: "Como funciona o pagamento?", a: "A oferta padr\u00E3o tem cobran\u00E7a mensal recorrente em reais. O plano Knight custa R$ 479,90/m\u00EAs e o Rook custa R$ 779,90/m\u00EAs. Ao final do per\u00EDodo de teste de 7 dias, a mensalidade do plano contratado \u00E9 cobrada no meio de pagamento cadastrado." },
    { q: "Posso cancelar quando quiser?", a: "Sim. O cancelamento pode ser solicitado pela plataforma ou pelo suporte, com anteced\u00EAncia m\u00EDnima de 15 dias do fim do ciclo, e produz efeitos ao final do per\u00EDodo pago." },
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
