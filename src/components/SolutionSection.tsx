import { Calculator, BarChart3, Bell, LineChart, FileText, ShoppingCart } from "lucide-react";
import pattern from "@/assets/pattern.png";

const features = [
  {
    icon: Calculator,
    title: "Controle de CMV",
    description: "Acompanhe seu Custo de Mercadoria Vendida em tempo real. Saiba se está dentro da meta antes que vire prejuízo.",
  },
  {
    icon: FileText,
    title: "DRE Automático",
    description: "Demonstrativo de Resultado gerado automaticamente. Visualize receita, custos, despesas e lucro de forma clara.",
  },
  {
    icon: BarChart3,
    title: "Análise Tributária",
    description: "Compare Simples Nacional, Lucro Presumido e Lucro Real. Descubra o regime mais vantajoso para seu faturamento.",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Receba notificações quando indicadores saírem da meta. Aja antes que pequenos desvios virem grandes problemas.",
  },
  {
    icon: LineChart,
    title: "Projeções e Tendências",
    description: "Visualize a evolução dos seus indicadores em gráficos interativos. Identifique padrões e antecipe cenários.",
  },
  {
    icon: ShoppingCart,
    title: "Gestão de Compras",
    description: "Registre compras por categoria e veja o impacto direto no CMV e na margem de lucro do seu restaurante.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solucao" className="py-24 relative bg-background overflow-hidden">
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
            <span className="text-rook-marrom">Visão completa do seu negócio</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Análise de dados financeiros que transforma números em decisões. 
            Controle de CMV, DRE automático, análise tributária e projeções — tudo em um só lugar.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 border border-border hover:border-rook-pingado/50 hover:shadow-lg transition-all duration-300 group"
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
