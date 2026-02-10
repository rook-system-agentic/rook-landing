import { AlertTriangle, TrendingDown, DollarSign, XCircle } from "lucide-react";

const stats = [
  {
    icon: XCircle,
    number: "397 mil",
    label: "Restaurantes fecharam em 2024",
    source: "Valor Econômico / ABIA",
  },
  {
    icon: TrendingDown,
    number: "55%",
    label: "Não geram lucro",
    source: "Operam no zero a zero ou no vermelho",
  },
  {
    icon: DollarSign,
    number: "< R$ 0,10",
    label: "Sobra por real faturado",
    source: "Lucro líquido médio do setor",
  },
  {
    icon: AlertTriangle,
    number: "36%",
    label: "Estão endividados",
    source: "Dívidas com impostos e fornecedores",
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
            Você vende bem, trabalha 14h por dia.{" "}
            <br className="hidden md:block" />
            <span className="text-rook-marrom">Mas cadê o lucro?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Salão cheio, delivery disparando, equipe trabalhando. 
            Mas quando chega o final do mês, a conta não fecha.{" "}
            <span className="text-rook-terracota font-semibold">Você não está sozinho.</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 hover:border-rook-pingado/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-rook-terracota/10 flex items-center justify-center mb-4 group-hover:bg-rook-terracota/20 transition-colors">
                <stat.icon className="w-6 h-6 text-rook-terracota" />
              </div>
              <div className="stat-number text-3xl md:text-4xl text-rook-marrom mb-2">
                {stat.number}
              </div>
              <p className="font-semibold text-foreground mb-1">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.source}</p>
            </div>
          ))}
        </div>

        {/* Key Insight */}
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto border-rook-terracota/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rook-terracota/10 text-rook-terracota text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            A Verdade que Ninguém Conta
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-4 text-rook-cafe">
            O problema não é falta de cliente.{" "}
            <span className="text-rook-terracota">É falta de visão financeira.</span>
          </p>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Sem saber seu CMV real, sua margem de lucro, seus impostos e suas despesas operacionais, 
            você toma decisões no escuro. O Rook System nasceu para acender essa luz.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
