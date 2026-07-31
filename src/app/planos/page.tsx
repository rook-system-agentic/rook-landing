import Link from "next/link";

const plans = [
  {
    name: "Knight",
    desc: "Para estabelecimentos com faturamento bruto mensal de até R$ 250 mil.",
    monthly: 479.9,
    priceSuffix: "/estabelecimento/mês",
    badge: null as string | null,
    cta: "Testar Knight por 7 dias",
    href: null as string | null,
    planKey: "knight" as string | null,
    note: "Teste único de 7 dias · cartão obrigatório",
    prefix: "Acesso funcional completo da unidade:",
    features: [
      "Seis pilares financeiros com score",
      "DRE, fluxo de caixa e indicadores",
      "Análises comparativas e recomendações",
      "Leitura de documentos e integrações habilitadas",
      "Suporte pelos canais oficiais",
    ],
    highlight: false,
  },
  {
    name: "Rook",
    desc: "Para estabelecimentos com faturamento bruto mensal acima de R$ 250 mil.",
    monthly: 779.9,
    priceSuffix: "/estabelecimento/mês",
    badge: "Recomendado" as string | null,
    cta: "Testar Rook por 7 dias",
    href: null as string | null,
    planKey: "rook" as string | null,
    note: "Teste único de 7 dias · cartão obrigatório",
    prefix: "Acesso funcional completo da unidade:",
    features: [
      "Seis pilares financeiros com score",
      "DRE, fluxo de caixa e indicadores",
      "Análises comparativas e recomendações",
      "Leitura de documentos e integrações habilitadas",
      "Suporte pelos canais oficiais",
    ],
    highlight: true,
  },
  {
    name: "Módulo Chess",
    desc: "Consolidação e gestão para organizações com múltiplas unidades.",
    monthly: 279.9,
    priceSuffix: "/organização/mês",
    badge: "Multiunidade" as string | null,
    cta: "Falar sobre o Chess",
    href: "mailto:contato@rooksystem.com.br?subject=Módulo%20Chess" as string | null,
    planKey: null as string | null,
    note: "Cobrado uma vez por grupo · adicional aos planos das unidades",
    prefix: "Além do Knight ou Rook de cada estabelecimento:",
    features: [
      "Painel consolidado do grupo",
      "Visão individual por estabelecimento",
      "Comparação e ranking entre unidades",
      "Gestão de acessos da organização",
      "Vínculo auditável a um CNPJ mestre",
    ],
    highlight: false,
  },
];

export default function PlanosPage() {
  return (
    <>
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="section-label mb-6">— Planos</p>
          <h1 className="heading-hero mb-6">
            Invista no <em>controle</em> do seu negócio.
          </h1>
          <p className="text-body mx-auto text-center mb-14">
            Cada estabelecimento contrata Knight ou Rook conforme o próprio faturamento. A oferta padrão é mensal e inclui um teste único de 7 dias com cartão.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {plans.map((plan) => (
              <div key={plan.name} className={`card p-6 flex flex-col ${plan.highlight ? "ring-2 ring-terracota" : ""}`}>
                {plan.badge && (
                  <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${plan.highlight ? "bg-terracota/20 text-terracota" : "bg-ocre/20 text-ocre"}`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-cream">{plan.name}</h3>
                <p className="text-sm text-muted mt-1 mb-4">{plan.desc}</p>

                <p className="text-2xl font-bold text-cream mb-1">
                  R$ {plan.monthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  <span className="text-sm font-normal text-muted">{plan.priceSuffix}</span>
                </p>
                <p className="text-xs text-muted mb-6">{plan.note}</p>

                <p className="text-xs text-ocre italic mb-2">{plan.prefix}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-floresta mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.planKey ? `https://app.rook.com.br/registro?plan=${plan.planKey}_monthly` : plan.href ?? "#"}
                  className={plan.highlight ? "btn-primary text-center" : "btn-ghost text-center"}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted mt-10 max-w-3xl mx-auto">
            O módulo Chess não substitui os planos individuais: cada unidade mantém Knight ou Rook, e o Chess é cobrado uma única vez por grupo.
          </p>
        </div>
      </section>

      <section className="section-spacing border-t border-border text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="section-label mb-6">— Dúvidas sobre o produto?</p>
          <h2 className="heading-section mb-4">Veja como <em>funciona.</em></h2>
          <p className="text-body mx-auto text-center mb-8">Conheça os módulos e indicadores que ajudam a entender e operar o seu negócio.</p>
          <Link href="/funcionalidades/" className="btn-ghost">Explorar →</Link>
        </div>
      </section>
    </>
  );
}
