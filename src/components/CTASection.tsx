import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import pattern from "@/assets/pattern.png";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-rook-pingado via-rook-marrom to-rook-cafe">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: '500px',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <img 
            src={logoIcon} 
            alt="Rook System" 
            className="w-20 h-20 mx-auto mb-8 drop-shadow-2xl"
          />
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-primary-foreground">
            Pronto para ter{" "}
            <span className="opacity-90">clareza financeira</span>{" "}
            no seu restaurante?
          </h2>
          
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Comece gratuitamente e descubra o que seus números têm a dizer. 
            Do controle de CMV à simulação tributária, tudo em um só lugar.
          </p>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Plano gratuito disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://app.rooksystem.com.br/registro">
              <Button 
                size="xl" 
                className="w-full sm:w-auto bg-background text-rook-marrom hover:bg-background/90 shadow-lg hover:shadow-xl group"
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#planos">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Ver Planos
              </Button>
            </a>
          </div>

          <p className="text-sm text-primary-foreground/60 mt-6">
            Cadastro em menos de 2 minutos
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
