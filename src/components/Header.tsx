"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/funcionalidades/", label: "Funcionalidades" },
  { href: "/calculadora-cmv/", label: "Calculadora CMV" },
  { href: "/planos/", label: "Planos" },
  { href: "/sobre/", label: "Sobre o Rook" },
  { href: "/blog/", label: "Blog" },
];

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("rook-theme");
    if (stored === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("rook-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("rook-theme", "light");
    }
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all hover:scale-105"
      style={{ borderColor: "var(--color-btn-ghost-border)" }}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md" style={{ backgroundColor: "var(--color-header-bg)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Rook System - Página inicial">
          <Image src="/brand/rook-logo-horizontal-light.png" alt="Rook — Visão | Estratégia | Controle" width={118} height={40} className="h-10 w-auto dark:hidden" />
          <Image src="/brand/rook-logo-horizontal.png" alt="Rook — Visão | Estratégia | Controle" width={122} height={40} className="h-10 w-auto hidden dark:block" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] font-medium transition-colors" style={{ color: "var(--color-btn-ghost-text)" }}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <a href="https://app.rook.com.br/login" className="btn-ghost text-sm">Entrar</a>
          <Link href="/planos/" className="btn-primary text-sm">Testar por 7 dias</Link>
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu" style={{ color: "var(--color-cream)" }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — always in DOM for crawlers/SEO, toggled via CSS */}
      <nav
        className={`lg:hidden px-6 py-4 flex flex-col gap-3 ${open ? "" : "hidden"}`}
        style={{ backgroundColor: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}
        aria-label="Menu de navegação mobile"
      >
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[15px] py-2" style={{ color: "var(--color-btn-ghost-text)" }}>
            {l.label}
          </Link>
        ))}
        <div className="flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <a href="https://app.rook.com.br/login" className="btn-ghost text-sm text-center">Entrar</a>
          <Link href="/planos/" className="btn-primary text-sm text-center">Testar por 7 dias</Link>
        </div>
      </nav>
    </header>
  );
}
