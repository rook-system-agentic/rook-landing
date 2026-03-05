import { AlertTriangle, TrendingDown, DollarSign, Receipt } from "lucide-react";

const painPoints = [
  {
    icon: DollarSign,
    title: "CMV descontrolado",
    description: "Sem saber o custo real de cada prato, a margem de lucro vira uma incógnita. Pequenos desvios acumulados podem comprometer o resultado do mês inteiro.",
  },
  {
    icon: TrendingDown,
    title: "Lucro invisível",
    description: "Faturamento alto não significa lucro. Sem um DRE claro, é impossível saber se o restaurante está realmente gerando resultado ou apenas girando dinheiro.",
  },
  {
    icon: Receipt,
    title: "Regime tributário inadequado",
    description: "Muitos restaurantes pagam mais impostos do que precisariam simplesmente por não terem visibilidade sobre qual regime tributário é mais vantajoso para o seu perfil.",
  },
  {
    icon: AlertTriangle,
    title: "Decisões no escuro",
    description: "Sem dados organizados, cada decisão — de precificação a investimento — é baseada em intuição. Isso aumenta o risco e reduz a previsibilidade do negócio.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problema" className="py-24 relative bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label mb-4 block">
            O Problema
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Você sabe exatamente{" "}
            <br className="hidden md:block" />
            <span className="text-rook-marrom">para onde vai o seu dinheiro?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Entre CMV, aluguel, folha de pagamento e impostos, entender o que realmente sobra no final do mês é um desafio.
            A falta de clareza financeira e planejamento tributário é um dos principais motivos que levam restaurantes a fechar as portas prematuramente.
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 hover:border-rook-pingado/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-rook-terracota/10 flex items-center justify-center mb-4 group-hover:bg-rook-terracota/20 transition-colors">
                <point.icon className="w-6 h-6 text-rook-terracota" />
              </div>
              <h3 className="text-lg font-bold text-rook-cafe mb-2">{point.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        {/* Key Insight */}
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto border-rook-terracota/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rook-terracota/10 text-rook-terracota text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            O ponto cego
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-4 text-rook-cafe">
            O problema não é falta de cliente.{" "}
            <span className="text-rook-terracota">É falta de visão financeira.</span>
          </p>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Sem saber seu CMV real, sua margem de lucro, seus impostos e suas despesas operacionais, 
            você toma decisões no escuro. O Rook nasceu para dar clareza a esses números.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
