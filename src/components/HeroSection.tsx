import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle, Shield } from "lucide-react";
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
            <span className="text-sm text-muted-foreground font-medium">Gestão Financeira e Fiscal para Restaurantes</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-up animation-delay-100 text-rook-cafe">
            Descubra o{" "}
            <span className="text-rook-marrom">lucro real</span>{" "}
            <br className="hidden sm:block" />
            do seu restaurante
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-up animation-delay-200">
            Controle de custos, DRE automático e simulação tributária{" "}
            <span className="text-rook-marrom font-semibold">em um só lugar.</span>
          </p>

          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up animation-delay-300">
            Tenha clareza sobre cada centavo que entra e sai do seu negócio, e simule cenários tributários para tomar decisões mais inteligentes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up animation-delay-400">
            <a href="https://app.rooksystem.com.br/registro">
              <Button variant="rook" size="xl" className="w-full sm:w-auto">
                Começar Grátis
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
              <span>Plano gratuito disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-rook-verde" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rook-verde" />
              <span>Dados protegidos com criptografia</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20 animate-fade-up animation-delay-500">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border text-center hover:border-rook-pingado/50 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-rook-marrom font-display mb-1">CMV</div>
            <p className="text-xs md:text-sm text-muted-foreground">Controle de Custos</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border text-center hover:border-rook-pingado/50 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-rook-marrom font-display mb-1">DRE</div>
            <p className="text-xs md:text-sm text-muted-foreground">Diagnóstico Financeiro</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border text-center hover:border-rook-pingado/50 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-rook-marrom font-display mb-1">SEFAZ</div>
            <p className="text-xs md:text-sm text-muted-foreground">Saúde Fiscal</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border text-center hover:border-rook-pingado/50 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-rook-marrom font-display mb-1">Tributos</div>
            <p className="text-xs md:text-sm text-muted-foreground">Simulador Tributário</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
