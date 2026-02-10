import { useState } from "react";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="flex items-center group">
          <img 
            src={logoHorizontal} 
            alt="Rook System - Visão | Estratégia | Controle" 
            className="h-10 w-auto"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#problema" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            O Problema
          </a>
          <a href="#diagnostico" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Diagnóstico
          </a>
          <a href="#solucao" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Solução
          </a>
          <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Planos
          </a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://app.rooksystem.com.br/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Entrar
            </Button>
          </a>
          <a href="https://diagnostico.rooksystem.com.br" className="hidden sm:block">
            <Button variant="rook" size="sm">
              Diagnóstico Gratuito
            </Button>
          </a>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border/50 animate-fade-up">
          <nav className="container py-4 flex flex-col gap-3">
            <a 
              href="#problema" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              O Problema
            </a>
            <a 
              href="#diagnostico" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Diagnóstico
            </a>
            <a 
              href="#solucao" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solução
            </a>
            <a 
              href="#planos" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Planos
            </a>
            <a 
              href="#faq" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
              <a href="https://app.rooksystem.com.br/login">
                <Button variant="ghost" size="sm" className="w-full">
                  Entrar
                </Button>
              </a>
              <a href="https://diagnostico.rooksystem.com.br">
                <Button variant="rook" size="sm" className="w-full">
                  Diagnóstico Gratuito
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
