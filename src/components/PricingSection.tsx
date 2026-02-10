import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Zap } from "lucide-react";
import ContactModal from "./ContactModal";

type BillingPeriod = "monthly" | "annual";

interface PlanPricing {
  monthly: {
    price: string;
    period: string;
    oldPrice?: string;
    savings?: string;
    link: string;
  };
  annual: {
    price: string;
    period: string;
    oldPrice?: string;
    savings?: string;
    equivalent?: string;
    link: string;
  };
}

interface Plan {
  name: string;
  description: string;
  icon: typeof Zap;
  featured: boolean;
  disabled: boolean;
  isEnterprise?: boolean;
  features: string[];
  cta: string;
  pricing: PlanPricing;
  openModal?: boolean;
}

const plans: Plan[] = [
  {
    name: "Pawn",
    description: "Comece a entender seus números",
    icon: Zap,
    featured: false,
    disabled: false,
    features: [
      "Calculadora básica de CMV",
      "1 estabelecimento",
      "Até 5 cálculos/mês",
      "Histórico de 30 dias",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    pricing: {
      monthly: {
        price: "Grátis",
        period: "",
        link: "https://app.rooksystem.com.br/registro",
      },
      annual: {
        price: "Grátis",
        period: "",
        link: "https://app.rooksystem.com.br/registro",
      },
    },
  },
  {
    name: "Knight",
    description: "Controle financeiro completo",
    icon: Star,
    featured: true,
    disabled: false,
    features: [
      "Tudo do Pawn",
      "Cálculos ilimitados",
      "DRE automático",
      "Alertas em tempo real",
      "Análise tributária",
      "Histórico de 1 ano",
      "Até 3 usuários",
      "Suporte por email e chat",
    ],
    cta: "Assinar Knight",
    pricing: {
      monthly: {
        price: "R$ 179,90",
        period: "/mês",
        link: "https://app.rooksystem.com.br/registro?plan=basic_monthly",
      },
      annual: {
        price: "R$ 1.619",
        period: "/ano",
        oldPrice: "R$ 2.158,80",
        savings: "Economize R$ 539,80/ano",
        equivalent: "Equivale a R$ 134,92/mês",
        link: "https://app.rooksystem.com.br/registro?plan=basic_annual_card",
      },
    },
  },
  {
    name: "Rook",
    description: "Gestão estratégica avançada",
    icon: Crown,
    featured: false,
    disabled: false,
    features: [
      "Tudo do Knight",
      "Diagnóstico financeiro completo",
      "Projeções e cenários",
      "Relatórios personalizados",
      "Até 5 estabelecimentos",
      "Histórico ilimitado",
      "Suporte prioritário",
    ],
    cta: "Assinar Rook",
    pricing: {
      monthly: {
        price: "R$ 379,90",
        period: "/mês",
        link: "https://app.rooksystem.com.br/registro?plan=rook_monthly",
      },
      annual: {
        price: "R$ 3.419",
        period: "/ano",
        oldPrice: "R$ 4.558,80",
        savings: "Economize R$ 1.139,80/ano",
        equivalent: "Equivale a R$ 284,92/mês",
        link: "https://app.rooksystem.com.br/registro?plan=rook_annual_card",
      },
    },
  },
  {
    name: "Chess",
    description: "Para redes e franquias",
    icon: Crown,
    featured: false,
    disabled: false,
    isEnterprise: true,
    openModal: true,
    features: [
      "Tudo do Rook",
      "Visão consolidada multi-unidade",
      "Comparação por unidade",
      "Dashboard multi-restaurante",
      "Até 10+ estabelecimentos",
      "Suporte prioritário dedicado",
      "Auxílio na implantação",
    ],
    cta: "Falar com Vendas",
    pricing: {
      monthly: {
        price: "Personalizado",
        period: "",
        link: "#",
      },
      annual: {
        price: "Personalizado",
        period: "",
        link: "#",
      },
    },
  },
];

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section id="planos" className="py-24 relative bg-rook-beige/50">
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="section-label mb-4 block">Planos</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Invista no{" "}
            <span className="text-rook-marrom">controle do seu negócio</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece grátis e evolua conforme seu restaurante cresce
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-muted rounded-xl p-1.5 gap-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                billingPeriod === "monthly"
                  ? "bg-background text-rook-cafe shadow-md"
                  : "text-muted-foreground hover:text-rook-cafe"
              }`}
            >
              MENSAL
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                billingPeriod === "annual"
                  ? "bg-background text-rook-cafe shadow-md"
                  : "text-muted-foreground hover:text-rook-cafe"
              }`}
            >
              ANUAL
              <span className="bg-rook-verde text-white text-xs px-2 py-0.5 rounded-full">
                Economize
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const currentPricing = plan.pricing[billingPeriod];
            
            return (
              <div
                key={index}
                className={`bg-background rounded-2xl p-6 relative transition-all duration-300 border ${
                  plan.featured
                    ? "border-rook-marrom shadow-xl lg:scale-105 hover:scale-[1.07]"
                    : "border-border hover:border-rook-pingado/50 hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                {/* Badges */}
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-rook-pingado to-rook-marrom rounded-full text-xs font-bold text-primary-foreground whitespace-nowrap">
                    MAIS POPULAR
                  </div>
                )}
                {plan.isEnterprise && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-rook-cafe rounded-full text-xs font-bold text-white">
                    ENTERPRISE
                  </div>
                )}

                <div className="mb-6 pt-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.featured
                        ? "bg-gradient-to-br from-rook-pingado to-rook-marrom"
                        : "bg-muted"
                    }`}
                  >
                    <plan.icon className={`w-6 h-6 ${plan.featured ? "text-primary-foreground" : "text-rook-marrom"}`} />
                  </div>
                  <h3 className="text-xl font-bold text-rook-cafe uppercase">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  {currentPricing.oldPrice && (
                    <span className="text-sm text-muted-foreground line-through block mb-1">
                      {currentPricing.oldPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-rook-cafe">
                    {currentPricing.price}
                  </span>
                  <span className="text-muted-foreground">
                    {currentPricing.period}
                  </span>
                  {currentPricing.savings && (
                    <p className="text-sm text-rook-verde font-medium mt-2">
                      {currentPricing.savings}
                    </p>
                  )}
                  {currentPricing.equivalent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentPricing.equivalent}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.featured
                            ? "text-rook-marrom"
                            : "text-rook-pingado"
                        }`}
                      />
                      <span className="text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.openModal ? (
                  <Button
                    variant={plan.featured ? "rook" : "rookOutline"}
                    className="w-full"
                    onClick={() => setIsContactModalOpen(true)}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <a href={currentPricing.link}>
                    <Button
                      variant={plan.featured ? "rook" : "rookOutline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </section>
  );
};

export default PricingSection;
