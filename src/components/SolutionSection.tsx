import { Calculator, FileText, Shield, BarChart3 } from "lucide-react";
import pattern from "@/assets/pattern.png";

const pillars = [
  {
    icon: Calculator,
    label: "Pilar 1",
    title: "Controle de CMV e Custos",
    description: "Acompanhe seu Custo de Mercadoria Vendida em tempo real. Registre compras por categoria, defina metas por segmento e saiba se está dentro do ideal antes que pequenos desvios virem prejuízo.",
    highlights: ["CMV por período e categoria", "Meta personalizada por segmento", "Alertas quando sair da meta"],
  },
  {
    icon: FileText,
    label: "Pilar 2",
    title: "Diagnóstico e DRE Automático",
    description: "Tenha um Demonstrativo de Resultado do Exercício gerado automaticamente a partir dos seus dados. Visualize receita, custos, despesas e lucro de forma clara, com indicadores de saúde financeira.",
    highlights: ["DRE completo e automático", "Health score do negócio", "Recomendações personalizadas"],
  },
  {
    icon: Shield,
    label: "Pilar 3",
    title: "Saúde Fiscal e Integração SEFAZ",
    description: "Conecte seu certificado digital A1 e tenha seus dados fiscais sempre atualizados. O Rook sincroniza com a Secretaria da Fazenda para manter sua base de documentos organizada e acessível.",
    highlights: ["Conexão direta com a SEFAZ", "Documentos fiscais organizados", "CNAE e dados da empresa automáticos"],
  },
  {
    icon: BarChart3,
    label: "Pilar 4",
    title: "Simulador Tributário Avançado",
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
            <span className="text-rook-marrom">Do prato ao imposto.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            O Rook conecta gestão de custos, análise financeira e planejamento tributário 
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
