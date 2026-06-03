import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(176,124,74,0.16)",
        background: "#0F0A06",
      }}
      role="contentinfo"
    >
      <div className="container-rook py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-[10px] no-underline mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20h16v2H4v-2zm2-2h12v2H6v-2zm1-1l1-7h8l1 7H7zm2-9h6V5h-1V3h-1v2h-2V3h-1v2H9v3z"
                  fill="#F5EDE0"
                />
              </svg>
              <span
                className="font-display font-bold text-[15px] tracking-[0.04em]"
                style={{ color: "#F5EDE0" }}
              >
                ROOK
              </span>
            </Link>
            <p
              className="text-[13px] leading-[1.55] max-w-[260px]"
              style={{ color: "rgba(245,237,224,0.58)" }}
            >
              Sistema de gestão financeira para food service. Controle CMV,
              otimize compras e proteja sua margem.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4
              className="font-mono text-[10px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "#E79F4A" }}
            >
              Produto
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
              <li>
                <Link
                  href="/funcionalidades"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  href="/planos"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4
              className="font-mono text-[10px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "#E79F4A" }}
            >
              Empresa
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
              <li>
                <Link
                  href="/sobre"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Sobre o Rook
                </Link>
              </li>
              <li>
                <a
                  href="https://app.rooksystem.com.br/login"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Entrar
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@rooksystem.com.br"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-mono text-[10px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "#E79F4A" }}
            >
              Legal
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
              <li>
                <Link
                  href="/privacidade"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-[13px] no-underline hover:text-fg-primary transition-colors"
                  style={{ color: "#D8CCB8" }}
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(176,124,74,0.16)" }}
        >
          <p className="text-[12px] m-0" style={{ color: "rgba(245,237,224,0.34)" }}>
            &copy; {new Date().getFullYear()} CCGN LTDA. CNPJ 51.629.346/0001-94. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/rooksystem"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "rgba(245,237,224,0.34)" }}
              aria-label="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/rooksystem"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "rgba(245,237,224,0.34)" }}
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
