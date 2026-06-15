"use client";
import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Pawn",
    desc: "Para começar a entender o negócio sem custo.",
    monthly: 0,
    badge: null,
    cta: "Começar grátis",
    href: "https://app.rooksystem.com.br/signup",
    note: "Grátis para sempre · 1 CNPJ",
    features: ["3 pilares essenciais", "DRE resumida", "Relatório PDF objetivo (3 pg.)", "Cadastro de vendas e compras", "Suporte por documentação"],
    highlight: false,
  },
  {
    name: "Knight",
    desc: "Para o restaurante que quer enxergar mais.",
    monthly: 479.9,
    badge: null,
    cta: "Assinar Knight",
    href: "https://app.rooksystem.com.br/signup",
    note: "14 dias grátis · 1 CNPJ",
    prefix: "Tudo do Pawn, mais:",
    features: ["6 pilares completos com score", "Análise por pilar", "Relatório objetivo (todas as áreas)", "Análise comparativa MoM", "Suporte por e-mail"],
    highlight: false,
  },
  {
    name: "Rook",
    desc: "Gestão estratégica avançada.",
    monthly: 779.9,
    badge: "Recomendado",
    cta: "Assinar Rook",
    href: "https://app.rooksystem.com.br/signup",
    note: "14 dias grátis · 1 CNPJ",
    prefix: "Tudo do Knight, mais:",
    features: ["Simulador tributário (4 regimes)", "Relatório anual estendido (11 pg.)", "Recomendações com impacto em R$", "Análise IA · SCI-R por pilar", "Atendimento prioritário"],
    highlight: true,
  },
  {
    name: "Chess",
    desc: "Para redes, franqueados e holdings.",
    monthly: -1,
    badge: "Enterprise",
    cta: "Falar com Vendas",
    href: "#contato",
    note: "Multi-CNPJ · descontos progressivos",
    prefix: "Tudo do Rook, em todas as unidades:",
    features: ["Painel consolidado do grupo", "Ranking automático por pilar", "Benchmark interno entre filiais", "Gestão de papéis (matriz × franqueado)", "Onboarding assistido"],
    highlight: false,
  },
];

export default function PlanosPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="section-label mb-6">— Planos</p>
          <h1 className="heading-hero mb-6">
            Invista no <em>controle</em> do seu negócio.
          </h1>
          <p className="text-body mx-auto text-center mb-10">
            Comece com o Pawn (grátis para sempre). Evolua quando o negócio crescer. Mensal recorrente ou anual com desconto.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 bg-bg-card border border-border rounded-full p-1 mb-14">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-terracota text-white" : "text-muted hover:text-cream"}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? "bg-terracota text-white" : "text-muted hover:text-cream"}`}
            >
              Anual <span className="text-xs opacity-80">Economize 25%</span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {plans.map((plan) => (
              <div key={plan.name} className={`card p-6 flex flex-col ${plan.highlight ? "ring-2 ring-terracota" : ""}`}>
                {plan.badge && (
                  <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${plan.highlight ? "bg-terracota/20 text-terracota" : "bg-ocre/20 text-ocre"}`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-cream">{plan.name}</h3>
                <p className="text-sm text-muted mt-1 mb-4">{plan.desc}</p>

                {plan.monthly === -1 ? (
                  <p className="text-2xl font-bold text-cream mb-1">Personalizado</p>
                ) : plan.monthly === 0 ? (
                  <p className="text-2xl font-bold text-cream mb-1">R$ 0</p>
                ) : (
                  <p className="text-2xl font-bold text-cream mb-1">
                    R$ {(annual ? plan.monthly * 0.75 : plan.monthly).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-muted">/mês</span>
                  </p>
                )}
                <p className="text-xs text-muted mb-6">{plan.note}</p>

                {plan.prefix && <p className="text-xs text-ocre italic mb-2">{plan.prefix}</p>}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-floresta mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a href={plan.href} className={plan.highlight ? "btn-primary text-center" : "btn-ghost text-center"}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted mt-10 max-w-2xl mx-auto">
            <strong className="text-cream">Mensal:</strong> cartão de crédito recorrente, sem consumir limite. ·{" "}
            <strong className="text-cream">Anual:</strong> pagamento à vista (cartão único ou Pix) com 25% de desconto sobre o valor consolidado.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing border-t border-border text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="section-label mb-6">— Dúvidas sobre o produto?</p>
          <h2 className="heading-section mb-4">Veja como <em>funciona.</em></h2>
          <p className="text-body mx-auto text-center mb-8">Sete módulos, calculadora interativa e relatório anual — tudo para entender e operar seu negócio.</p>
          <Link href="/funcionalidades/" className="btn-ghost">Explorar →</Link>
        </div>
      </section>
    </>
  );
}
