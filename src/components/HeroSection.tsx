import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle } from "lucide-react";
import pattern from "@/assets/pattern.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-gradient-to-b from-background to-rook-beige">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: '800px',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
      
      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 animate-fade-up shadow-sm">
            <BarChart3 className="w-4 h-4 text-rook-marrom" />
            <span className="text-sm text-muted-foreground font-medium">Gestão Financeira para Restaurantes</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-up animation-delay-100 text-rook-cafe">
            Você sabe quanto{" "}
            <span className="text-rook-marrom">sobra</span>{" "}
            <br className="hidden sm:block" />
            no final do mês?
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-up animation-delay-200">
            A maioria dos donos de restaurante{" "}
            <span className="text-rook-marrom font-semibold">não sabe responder essa pergunta.</span>
          </p>

          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up animation-delay-300">
            O Rook analisa seus números, identifica onde o dinheiro está indo e mostra exatamente o que fazer para sobrar mais.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up animation-delay-400">
            <a href="https://diagnostico.rooksystem.com.br">
              <Button variant="rook" size="xl" className="w-full sm:w-auto">
                Fazer Diagnóstico Gratuito
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="#planos">
              <Button variant="rookOutline" size="xl" className="w-full sm:w-auto">
                Ver Planos
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up animation-delay-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Resultado em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Dados 100% seguros</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-20 animate-fade-up animation-delay-500">
          <div className="text-center">
            <div className="stat-number text-rook-marrom">397 mil</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Restaurantes fecharam em 2024</p>
          </div>
          <div className="text-center">
            <div className="stat-number text-rook-pingado">&lt; 10%</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Lucro líquido médio do setor</p>
          </div>
          <div className="text-center">
            <div className="stat-number text-rook-terracota">55%</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Não geram lucro</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
