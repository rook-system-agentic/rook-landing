import { AlertTriangle, TrendingDown, DollarSign, XCircle } from "lucide-react";

const stats = [
  {
    icon: AlertTriangle,
    number: "397 mil",
    label: "Restaurantes fecharam em 2024",
    source: "Abrasel/Sebrae",
  },
  {
    icon: TrendingDown,
    number: "40%",
    label: "Estão endividados",
    source: "Dívidas em impostos e fornecedores",
  },
  {
    icon: XCircle,
    number: "71%",
    label: "Fecham por 'queda de vendas'",
    source: "O problema real é CMV alto",
  },
  {
    icon: DollarSign,
    number: "50%",
    label: "Fecham em 2 anos",
    source: "Microempresas são as mais vulneráveis",
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
            Não é falta de clientes.{" "}
            <span className="text-rook-marrom">É falta de controle.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Você trabalha 14 horas por dia, tem fila na porta, vende bem. 
            Mas no final do mês: <span className="text-rook-terracota font-semibold">prejuízo.</span>
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
            Alerta Crítico
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-4 text-rook-cafe">
            CMV acima de 36% significa{" "}
            <span className="text-rook-terracota">-11,84%</span> de lucro
          </p>
          <p className="text-muted-foreground text-lg">
            Insumos subiram 30% em 2024, mas 40% dos restaurantes não reajustaram preços.
            <br />
            <span className="text-rook-marrom font-semibold">O Rook System nasceu para mudar isso.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
