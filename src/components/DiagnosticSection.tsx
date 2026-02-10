import { Button } from "@/components/ui/button";
import { ArrowRight, FileBarChart, Clock, Shield, TrendingUp } from "lucide-react";
import pattern from "@/assets/pattern.png";

const steps = [
  {
    number: "01",
    title: "Identifique-se",
    description: "Nome, e-mail, estado e regime tributário do seu restaurante.",
  },
  {
    number: "02",
    title: "Informe seus números",
    description: "Receita mensal, custos com mercadoria, despesas operacionais e dívidas.",
  },
  {
    number: "03",
    title: "Receba seu diagnóstico",
    description: "DRE completo, análise tributária, comparativo de regimes e recomendações.",
  },
];

const benefits = [
  {
    icon: FileBarChart,
    title: "DRE Completo",
    description: "Demonstrativo de Resultado do Exercício com todos os indicadores financeiros do seu restaurante.",
  },
  {
    icon: TrendingUp,
    title: "Comparativo Tributário",
    description: "Descubra se o seu regime tributário atual é o mais vantajoso para o seu faturamento.",
  },
  {
    icon: Clock,
    title: "Em 2 Minutos",
    description: "Responda algumas perguntas simples e receba uma análise financeira completa do seu negócio.",
  },
  {
    icon: Shield,
    title: "100% Gratuito",
    description: "O diagnóstico básico é totalmente gratuito. Sem cartão de crédito, sem compromisso.",
  },
];

const DiagnosticSection = () => {
  return (
    <section id="diagnostico" className="py-24 relative bg-rook-beige/50 overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: '600px',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label mb-4 block">
            Diagnóstico Financeiro
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Descubra a{" "}
            <span className="text-rook-marrom">saúde financeira</span>{" "}
            do seu restaurante
          </h2>
          <p className="text-lg text-muted-foreground">
            Um raio-x completo do seu negócio em poucos minutos. 
            Saiba exatamente quanto sobra, onde está vazando e o que fazer para melhorar.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rook-pingado to-rook-marrom flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-xl font-bold text-primary-foreground">{step.number}</span>
              </div>
              <h3 className="text-lg font-bold text-rook-cafe mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute">
                  {/* Arrow connector would go here */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-6 border border-border hover:border-rook-pingado/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rook-pingado to-rook-marrom flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                <benefit.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-rook-cafe">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="https://diagnostico.rooksystem.com.br">
            <Button variant="rook" size="xl" className="group">
              Fazer Meu Diagnóstico Gratuito
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            Mais de 500 diagnósticos realizados. Seus dados estão protegidos.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiagnosticSection;
