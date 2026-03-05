import logoHorizontal from "@/assets/logo-horizontal.png";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container">
        <div className="flex flex-col gap-8">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <a href="#">
              <img 
                src={logoHorizontal} 
                alt="Rook System - Visão | Estratégia | Controle" 
                className="h-8 w-auto"
              />
            </a>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#solucao" className="hover:text-rook-marrom transition-colors font-medium">
                Solução
              </a>
              <a href="#como-funciona" className="hover:text-rook-marrom transition-colors font-medium">
                Como Funciona
              </a>
              <a href="#seguranca" className="hover:text-rook-marrom transition-colors font-medium">
                Segurança
              </a>
              <a href="#planos" className="hover:text-rook-marrom transition-colors font-medium">
                Planos
              </a>
              <a href="#faq" className="hover:text-rook-marrom transition-colors font-medium">
                FAQ
              </a>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="mailto:contato@rooksystem.com.br" className="hover:text-rook-marrom transition-colors">
                contato@rooksystem.com.br
              </a>
              <a href="/legal/termos-de-uso.html" className="hover:text-rook-marrom transition-colors">
                Termos de Uso
              </a>
              <a href="/legal/politica-de-privacidade.html" className="hover:text-rook-marrom transition-colors">
                Política de Privacidade
              </a>
              <a href="/legal/politica-de-cookies.html" className="hover:text-rook-marrom transition-colors">
                Política de Cookies
              </a>
              <a href="/legal/lgpd.html" className="hover:text-rook-marrom transition-colors">
                LGPD
              </a>
            </nav>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2025-2026 Rook System. Todos os direitos reservados.<br />
              <span className="text-xs">CNPJ: 51.629.346/0001-94 | CCGN LTDA</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
