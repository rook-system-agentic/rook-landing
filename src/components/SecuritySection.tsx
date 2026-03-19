import { Lock, Users, FileSearch, Scale } from "lucide-react";
import pattern from "@/assets/pattern.png";

const securityPillars = [
  {
    icon: Lock,
    title: "Criptografia de Ponta a Ponta",
    description: "Todos os dados são protegidos com criptografia AES-256 em repouso e TLS 1.3 em trânsito. Sua informação financeira nunca fica exposta.",
  },
  {
    icon: Scale,
    title: "Conformidade com a LGPD",
    description: "Nossas políticas e práticas são desenhadas para estar em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018).",
  },
  {
    icon: Users,
    title: "Controle de Acesso por Perfil",
    description: "Defina permissões para cada membro da equipe. Cada usuário acessa apenas o que é necessário para sua função, com níveis granulares de acesso.",
  },
  {
    icon: FileSearch,
    title: "Auditoria e Logs Completos",
    description: "Todas as ações na plataforma são registradas com data, hora e identificação do usuário, garantindo rastreabilidade total e conformidade.",
  },
];

const SecuritySection = () => {
  return (
    <section id="seguranca" className="py-24 relative bg-rook-beige/50 overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-15"
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
            Segurança
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rook-cafe">
            Seus dados,{" "}
            <span className="text-rook-marrom">sua fortaleza.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Levamos a segurança dos seus dados financeiros a sério. 
            Nossa infraestrutura é construída sobre as melhores práticas do mercado 
            para garantir total confidencialidade e controle.
          </p>
        </div>

        {/* Security Pillars Grid — 4 cards em grid 2x2 */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {securityPillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-6 border border-border hover:border-rook-verde/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-rook-verde/10 flex items-center justify-center mb-4 group-hover:bg-rook-verde/20 transition-colors">
                <pillar.icon className="w-6 h-6 text-rook-verde" />
              </div>
              <h3 className="text-lg font-bold text-rook-cafe mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* Nota sobre automação fiscal */}
        <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mt-8">
          Quando habilitada, a automação fiscal utiliza conexão autenticada e criptografada para manter seus documentos sempre atualizados.
        </p>
      </div>
    </section>
  );
};

export default SecuritySection;
