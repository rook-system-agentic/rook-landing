"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/planos", label: "Planos" },
  { href: "/sobre", label: "Sobre o Rook" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(15,10,6,0.78)",
        backdropFilter: "blur(20px) saturate(1.4)",
        borderColor: "rgba(176,124,74,0.16)",
      }}
      role="banner"
    >
      <div className="container-rook">
        <div className="flex items-center justify-between gap-6 py-[14px]">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-[10px] no-underline"
            aria-label="Rook System - Página inicial"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 20h16v2H4v-2zm2-2h12v2H6v-2zm1-1l1-7h8l1 7H7zm2-9h6V5h-1V3h-1v2h-2V3h-1v2H9v3z"
                fill="#F5EDE0"
              />
            </svg>
            <span
              className="font-display font-bold text-[17px] tracking-[0.04em]"
              style={{ color: "#F5EDE0" }}
            >
              ROOK
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] no-underline transition-colors duration-150 hover:text-fg-primary"
                style={{ color: "#D8CCB8" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-[10px]">
            <Link
              href="https://app.rooksystem.com.br/login"
              className="btn btn-ghost"
            >
              Entrar
            </Link>
            <Link href="/planos" className="btn btn-primary">
              Começar grátis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            style={{ color: "#F5EDE0" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav
            className="md:hidden pb-6 pt-2"
            style={{ borderTop: "1px solid rgba(176,124,74,0.16)" }}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[15px] no-underline transition-colors hover:text-fg-primary"
                  style={{ color: "#D8CCB8" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div
                className="flex flex-col gap-3 pt-4"
                style={{ borderTop: "1px solid rgba(176,124,74,0.16)" }}
              >
                <Link
                  href="https://app.rooksystem.com.br/login"
                  className="btn btn-ghost justify-center"
                >
                  Entrar
                </Link>
                <Link href="/planos" className="btn btn-primary justify-center">
                  Começar grátis
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
