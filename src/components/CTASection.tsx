import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import pattern from "@/assets/pattern.png";
import ContactModal from "./ContactModal";

const CTASection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
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
              Descubra quanto{" "}
              <span className="opacity-90">sobra no seu restaurante.</span>
            </h2>
            
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Faça o diagnóstico financeiro gratuito e tenha clareza sobre a saúde do seu negócio. 
              Em 2 minutos, sem compromisso.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://diagnostico.rooksystem.com.br">
                <Button 
                  size="xl" 
                  className="w-full sm:w-auto bg-background text-rook-marrom hover:bg-background/90 shadow-lg hover:shadow-xl"
                >
                  Fazer Diagnóstico Gratuito
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 group"
                onClick={() => setIsModalOpen(true)}
              >
                <MessageCircle className="w-4 h-4 group-hover:animate-pulse" />
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default CTASection;
