import { Calculator, FileText, RefreshCw, BarChart3 } from "lucide-react";
import pattern from "@/assets/pattern.png";

const pillars = [
  {
    icon: Calculator,
    label: "Pilar 1",
    title: "Controle de Compras e Custos",
    description: "Acompanhe suas compras em tempo real. Registre-as por categoria, defina metas por segmento e saiba se está dentro do ideal antes que pequenos desvios virem prejuízo.",
    highlights: ["Compras por período e categoria", "Meta personalizada (e sugerida) por segmento", "Alertas para quando saírem da meta"],
  },
  {
    icon: FileText,
    label: "Pilar 2",
    title: "Diagnóstico Financeiro e Resultado",
    description: "Tenha um demonstrativo de resultado do exercício (DRE) gerado automaticamente a partir dos seus dados. Visualize receita, custos, despesas e lucro de forma clara, com indicadores de saúde financeira.",
    highlights: ["Resultado completo e automático", "Como está o seu negócio em comparação ao mercado", "Recomendações personalizadas"],
  },
  {
    icon: RefreshCw,
    label: "Pilar 3",
    title: "Alimentação Automatizada",
    description: "A alimentação do sistema poderá ser manual, mas todos os dados poderão ser automatizados, aliviando seu tempo — que é o mais precioso.",
    highlights: ["Documentos fiscais organizados", "Classificação das despesas automática"],
  },
  {
    icon: BarChart3,
    label: "Pilar 4",
    title: "Simulador Tributário",
    description: "Compare Simples Nacional, Lucro Presumido e Lucro Real com base nos seus próprios dados. Simule cenários com e sem créditos de PIS/COFINS para entender qual regime pode ser mais vantajoso.",
    highlights: ["Comparativo entre 3 regimes", "Simulação com dados reais", "Histórico de simulações"],
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
            Visão completa.{" "}
            <span className="text-rook-marrom">Do prato ao lucro.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            O Rook conecta gestão de compras, análise financeira e planejamento tributário 
            em uma única plataforma, projetada para restaurantes.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 border border-border hover:border-rook-pingado/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rook-pingado to-rook-marrom flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow">
                  <pillar.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-widest uppercase text-rook-pingado">{pillar.label}</span>
                  <h3 className="text-xl font-bold text-rook-cafe">{pillar.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {pillar.description}
              </p>
              <ul className="space-y-2">
                {pillar.highlights.map((highlight, hIndex) => (
                  <li key={hIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-rook-pingado flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
