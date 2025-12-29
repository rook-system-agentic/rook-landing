import { Calculator, Brain, Bell, LineChart, Plug, ShoppingCart } from "lucide-react";
import pattern from "@/assets/pattern.png";

const features = [
  {
    icon: Calculator,
    title: "Calculadora Automática de CMV",
    description: "Insira receita e compras. O Rook calcula seu CMV instantaneamente, mostrando se está dentro da meta.",
  },
  {
    icon: Brain,
    title: "Inteligência Preditiva",
    description: "IA prevê quanto você pode comprar na próxima semana sem comprometer sua meta de CMV.",
  },
  {
    icon: Bell,
    title: "Alertas em Tempo Real",
    description: "Receba notificações quando o CMV estiver acima do ideal. Aja antes que vire prejuízo.",
  },
  {
    icon: LineChart,
    title: "Gráficos de Evolução",
    description: "Visualize a evolução do seu CMV em gráficos interativos. Compare períodos e identifique padrões.",
  },
  {
    icon: Plug,
    title: "Integração com ERP",
    description: "Conecte com Omie, Colibri, Saipo, Teknisa e outros. Dados sincronizados automaticamente.",
  },
  {
    icon: ShoppingCart,
    title: "Controle de Compras",
    description: "Registre compras por categoria e veja o impacto no CMV em tempo real.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solucao" className="py-24 relative bg-rook-beige/50 overflow-hidden">
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
            A Solução
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Rook System:{" "}
            <span className="text-rook-marrom">Inteligência que gera lucro</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Controle automático de CMV com inteligência artificial. 
            O Rook prevê, alerta e orienta suas decisões em tempo real.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 border border-border hover:border-rook-pingado/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rook-pingado to-rook-marrom flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-rook-cafe">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
