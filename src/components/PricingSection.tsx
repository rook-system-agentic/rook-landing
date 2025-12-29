import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Zap, Clock } from "lucide-react";

const plans = [
  {
    name: "Pawn",
    emoji: "♟️",
    description: "O primeiro passo estratégico",
    price: "Grátis",
    period: "",
    oldPrice: null,
    savings: null,
    icon: Zap,
    featured: false,
    disabled: false,
    comingSoon: false,
    features: [
      "Calculadora básica de CMV",
      "1 estabelecimento",
      "Até 30 cálculos/mês",
      "Histórico de 30 dias",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    link: "https://app.rooksystem.com.br/registro",
  },
  {
    name: "Knight",
    emoji: "♞",
    description: "Movimentos táticos e versáteis",
    price: "R$ 99",
    period: "/mês",
    oldPrice: "R$ 179,90",
    savings: "Economize R$ 80,90 por mês! 🎉",
    promoBadge: "PROMOÇÃO DE LANÇAMENTO",
    icon: Star,
    featured: true,
    disabled: false,
    comingSoon: false,
    features: [
      "Tudo do Pawn",
      "Cálculos ilimitados",
      "Alertas em tempo real",
      "IA Preditiva de compras",
      "Histórico de 1 ano",
      "Até 3 usuários",
      "Suporte por email e chat",
      "Relatórios personalizados",
    ],
    cta: "Assinar Knight",
    link: "https://app.rooksystem.com.br/registro?plan=basic_monthly",
  },
  {
    name: "Rook",
    emoji: "♜",
    description: "Domínio total da estratégia",
    price: "Em breve",
    period: "",
    oldPrice: null,
    savings: null,
    icon: Crown,
    featured: false,
    disabled: true,
    comingSoon: true,
    features: [
      "Tudo do Knight",
      "Integração automática ERP",
      "Omie, Colibri, Saipo, Teknisa",
      "Até 10 estabelecimentos",
      "Histórico ilimitado",
      "Suporte prioritário",
    ],
    cta: "Em Breve",
    link: "#",
  },
  {
    name: "Chess",
    emoji: "♔",
    description: "Para redes e franquias",
    price: "Personalizado",
    period: "",
    oldPrice: null,
    savings: null,
    icon: Crown,
    featured: false,
    disabled: false,
    comingSoon: false,
    isEnterprise: true,
    features: [
      "Tudo do Rook",
      "Visão consolidada multi-unidade",
      "Comparação de CMV por unidade",
      "Dashboard multi-restaurante",
      "Suporte prioritário dedicado",
      "Auxílio na implantação",
    ],
    cta: "Falar com Vendas",
    link: "mailto:contato@rooksystem.com.br?subject=Interesse%20no%20Plano%20Chess",
  },
];

const PricingSection = () => {
  return (
    <section id="planos" className="py-24 relative bg-rook-beige/50">
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label mb-4 block">
            Planos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Escolha o plano{" "}
            <span className="text-rook-marrom">ideal para você</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece grátis e evolua conforme seu negócio cresce
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-background rounded-2xl p-6 relative transition-all duration-300 border ${
                plan.featured
                  ? "border-rook-marrom shadow-xl lg:scale-105 hover:scale-[1.07]"
                  : plan.disabled
                  ? "border-border opacity-75"
                  : "border-border hover:border-rook-pingado/50 hover:shadow-lg hover:scale-[1.02]"
              }`}
            >
              {/* Badges */}
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-rook-pingado to-rook-marrom rounded-full text-xs font-bold text-primary-foreground whitespace-nowrap">
                  MAIS POPULAR
                </div>
              )}
              {plan.promoBadge && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-rook-verde rounded-full text-xs font-bold text-white">
                  {plan.promoBadge}
                </div>
              )}
              {plan.comingSoon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  EM BREVE
                </div>
              )}
              {plan.isEnterprise && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-rook-cafe rounded-full text-xs font-bold text-white">
                  ♔ ENTERPRISE
                </div>
              )}

              <div className="mb-6 pt-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.featured ? "bg-gradient-to-br from-rook-pingado to-rook-marrom" : "bg-muted"
                }`}>
                  <span className="text-2xl">{plan.emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-rook-cafe uppercase">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through block mb-1">
                    {plan.oldPrice}
                  </span>
                )}
                <span className={`text-3xl font-bold ${plan.disabled ? "text-gray-400" : "text-rook-cafe"}`}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
                {plan.savings && (
                  <p className="text-sm text-rook-verde font-medium mt-2">
                    {plan.savings}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      plan.disabled ? "text-gray-400" : plan.featured ? "text-rook-marrom" : "text-rook-pingado"
                    }`} />
                    <span className={plan.disabled ? "text-gray-400" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.disabled ? (
                <Button
                  variant="outline"
                  className="w-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  {plan.cta}
                </Button>
              ) : (
                <a href={plan.link} className="block">
                  <Button
                    variant={plan.featured ? "rook" : "rookOutline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
