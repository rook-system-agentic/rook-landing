import logoHorizontal from "@/assets/logo-horizontal.png";
import { Button } from "@/components/ui/button";

const Header = () => {
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
          <a href="#solucao" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Solução
          </a>
          <a href="#calculadora" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Calculadora
          </a>
          <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://app.rooksystem.com.br/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Entrar
            </Button>
          </a>
          <a href="https://app.rooksystem.com.br/registro">
            <Button variant="rook" size="sm">
              Começar Grátis
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
