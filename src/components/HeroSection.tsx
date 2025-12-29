import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
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
            <span className="w-2 h-2 rounded-full bg-rook-terracota animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">Análise Preditiva e Estatística</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-up animation-delay-100 text-rook-cafe">
            <span className="text-rook-marrom">397 mil</span> restaurantes{" "}
            <br className="hidden sm:block" />
            fecharam em 2024.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-up animation-delay-200">
            1 em cada 12 fecha este ano.{" "}
            <span className="text-rook-marrom font-semibold">Não seja o próximo.</span>
          </p>

          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up animation-delay-300">
            Reduza custos, aumente lucros e tome decisões estratégicas baseadas em dados com o Rook System.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up animation-delay-400">
            <a href="https://app.rooksystem.com.br/registro">
              <Button variant="rook" size="xl" className="w-full sm:w-auto">
                Começar Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="#calculadora">
              <Button variant="rookOutline" size="xl" className="w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Ver Demonstração
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up animation-delay-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-20 animate-fade-up animation-delay-500">
          <div className="text-center">
            <div className="stat-number text-rook-marrom">40%</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Redução CMV</p>
          </div>
          <div className="text-center">
            <div className="stat-number text-rook-pingado">3x</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Mais Rápido</p>
          </div>
          <div className="text-center">
            <div className="stat-number text-rook-terracota">100%</div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Automático</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
