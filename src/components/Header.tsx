"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/funcionalidades/", label: "Funcionalidades" },
  { href: "/planos/", label: "Planos" },
  { href: "/sobre/", label: "Sobre o Rook" },
  { href: "/blog/", label: "Blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Rook System - Página inicial">
          <Image src="/brand/rook-logo-horizontal.png" alt="Rook — Visão | Estratégia | Controle" width={160} height={40} className="h-10 w-auto" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] text-cream/70 hover:text-cream transition-colors font-medium">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="https://app.rook.com.br/login" className="btn-ghost text-sm">Entrar</a>
          <Link href="/planos/" className="btn-primary text-sm">Testar por 7 dias</Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-cream p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="lg:hidden bg-bg border-t border-border px-6 py-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[15px] text-cream/70 hover:text-cream py-2">
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-border">
            <a href="https://app.rook.com.br/login" className="btn-ghost text-sm text-center">Entrar</a>
            <Link href="/planos/" className="btn-primary text-sm text-center">Testar por 7 dias</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
