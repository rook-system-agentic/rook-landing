import Link from "next/link";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/company";

/*
 * Os três títulos de coluna são `<h2>`, não `<h4>`.
 *
 * O rodapé vive no layout, então ele fecha a hierarquia de TODA página. Como
 * `<h4>`, ele criava um salto h2 → h4 em nove das dez rotas, e um salto
 * h1 → h4 em /diagnostico, que não tem `<h2>` nenhum. Salto de nível é o que
 * faz o leitor de tela anunciar uma subseção inexistente entre o conteúdo e o
 * rodapé.
 *
 * O tamanho na tela não muda: as classes continuam as mesmas — quem define o
 * corpo aqui é `text-sm`, não a tag.
 *
 * v5.1: o rodapé é escuro nos dois temas (classe .footer-dark no globals.css),
 * como no preview aprovado — por isso o logo de texto claro é o único servido,
 * sem variante por tema.
 */
export default function Footer() {
  return (
    <footer className="footer-dark">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <Image src="/brand/rook-logo-horizontal.webp" alt="Rook System" width={144} height={47} className="h-10 w-auto" />
          </Link>
          <p className="text-sm leading-relaxed">
            O lucro do seu restaurante, visível todo dia — com a próxima decisão em reais. Faturar não é lucrar.
          </p>
        </div>

        {/* Produto */}
        <div>
          <h2 className="font-semibold text-sm mb-4">Produto</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/diagnostico/">Diagnóstico</Link></li>
            <li><Link href="/calculadora-cmv/">Calculadora de CMV</Link></li>
            <li><Link href="/planos/">Planos e teste</Link></li>
            <li><Link href="/sobre/">Sobre o Rook</Link></li>
          </ul>
        </div>

        {/* Conteúdo */}
        <div>
          <h2 className="font-semibold text-sm mb-4">Conteúdo</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/restaurantes/">Restaurantes</Link></li>
            <li><Link href="/restaurantes/">Restaurantes</Link></li>
            <li><Link href="/blog/">Blog</Link></li>
            <li><a href="mailto:contato@rook.com.br">contato@rook.com.br</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h2 className="font-semibold text-sm mb-4">Legal</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/privacidade/">Privacidade</Link></li>
            <li><Link href="/termos/">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">&copy; 2026 {COMPANY_INFO.razaoSocial}. CNPJ {COMPANY_INFO.cnpj}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/company/rooksystem" target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.instagram.com/rooksystem" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
