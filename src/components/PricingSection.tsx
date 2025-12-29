import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Pawn",
    description: "Para começar a controlar",
    price: "Grátis",
    period: "",
    icon: Zap,
    featured: false,
    features: [
      "Calculadora de CMV",
      "1 estabelecimento",
      "Histórico de 30 dias",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
  },
  {
    name: "Knight",
    description: "Para quem quer crescer",
    price: "R$ 99",
    period: "/mês",
    icon: Star,
    featured: false,
    features: [
      "Tudo do Pawn",
      "3 estabelecimentos",
      "Alertas em tempo real",
      "Relatórios semanais",
      "Histórico de 1 ano",
    ],
    cta: "Assinar Knight",
  },
  {
    name: "Rook",
    description: "Para gestão profissional",
    price: "R$ 179,90",
    period: "/mês",
    icon: Crown,
    featured: true,
    features: [
      "Tudo do Knight",
      "10 estabelecimentos",
      "IA Preditiva",
      "Integração ERP",
      "Suporte prioritário",
      "Histórico ilimitado",
    ],
    cta: "Assinar Rook",
  },
  {
    name: "Chess",
    description: "Para redes e franquias",
    price: "Sob consulta",
    period: "",
    icon: Crown,
    featured: false,
    features: [
      "Tudo do Rook",
      "Estabelecimentos ilimitados",
      "API personalizada",
      "Gerente de sucesso",
      "Treinamento exclusivo",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
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
              className={`bg-background rounded-2xl p-6 relative transition-all duration-300 hover:scale-[1.02] border ${
                plan.featured
                  ? "border-rook-marrom shadow-xl lg:scale-105"
                  : "border-border hover:border-rook-pingado/50 hover:shadow-lg"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-rook-pingado to-rook-marrom rounded-full text-xs font-bold text-primary-foreground">
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.featured ? "bg-gradient-to-br from-rook-pingado to-rook-marrom" : "bg-muted"
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.featured ? "text-primary-foreground" : "text-rook-marrom"}`} />
                </div>
                <h3 className="text-xl font-bold text-rook-cafe">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-rook-cafe">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? "text-rook-marrom" : "text-rook-pingado"}`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? "rook" : "rookOutline"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
