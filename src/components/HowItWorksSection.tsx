import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileBarChart, Target } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Alimente seus dados",
    description: "Insira seus dados financeiros de forma simples — manualmente ou de forma automatizada. Em poucos minutos, o Rook já começa a trabalhar por você.",
  },
  {
    number: "02",
    icon: FileBarChart,
    title: "Receba seu diagnóstico",
    description: "A plataforma analisa seus números e gera um diagnóstico financeiro completo: resultado do exercício, análise de compras, indicadores de saúde e comparação com o mercado. Tudo automático.",
  },
  {
    number: "03",
    icon: Target,
    title: "Decida com clareza",
    description: "Com os dados organizados, use o Simulador Tributário para comparar regimes fiscais e tome decisões baseadas em números reais, não em achismos.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 relative bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label mb-4 block">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Clareza financeira em{" "}
            <span className="text-rook-marrom">3 passos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Do cadastro ao primeiro diagnóstico em poucos minutos. Sem complexidade, sem curva de aprendizado.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-gradient-to-r from-rook-pingado/40 to-rook-pingado/10" />
              )}
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rook-pingado to-rook-marrom flex items-center justify-center mx-auto mb-6 shadow-lg relative">
                  <step.icon className="w-9 h-9 text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rook-cafe text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-rook-cafe mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Call + CTA */}
        <div className="text-center">
          <p className="text-lg md:text-xl font-semibold text-rook-cafe mb-6 max-w-2xl mx-auto">
            Você cuida do seu restaurante.{" "}
            <span className="text-rook-marrom">Deixe o Rook te ajudar a chegar lá.</span>
          </p>
          <a href="https://app.rooksystem.com.br/registro">
            <Button variant="rook" size="xl" className="group">
              Começar Grátis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            Cadastro em menos de 2 minutos. Sem cartão de crédito.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
