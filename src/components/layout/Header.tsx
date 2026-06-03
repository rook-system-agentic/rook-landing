'use client'

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '/funcionalidades', label: 'Funcionalidades' },
  { href: '/planos', label: 'Planos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/blog', label: 'Blog' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-rook-bg/90 backdrop-blur-md border-b border-rook-border/50"
      role="banner"
    >
      <nav className="section-container flex items-center justify-between h-16 lg:h-20" aria-label="Navegacao principal">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Rook System - Pagina inicial">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gold group-hover:text-gold-light transition-colors"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="8" y="8" width="6" height="10" rx="1" fill="currentColor" />
            <rect x="18" y="8" width="6" height="10" rx="1" fill="currentColor" />
            <rect x="10" y="6" width="2" height="4" rx="1" fill="currentColor" />
            <rect x="20" y="6" width="2" height="4" rx="1" fill="currentColor" />
            <rect x="8" y="18" width="16" height="4" rx="1" fill="currentColor" opacity="0.6" />
          </svg>
          <span className="font-display font-bold text-xl text-rook-text">
            Rook<span className="text-gold">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-sm text-rook-text-muted hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://app.rooksystem.com.br/login"
            className="text-body-sm text-rook-text-muted hover:text-rook-text transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="https://app.rooksystem.com.br/registro"
            className="btn-primary text-sm"
          >
            Comecar Gratis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-rook-text-muted hover:text-rook-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-rook-surface border-t border-rook-border animate-fade-in">
          <div className="section-container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-md text-rook-text-muted hover:text-gold py-2 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-rook-border" />
            <Link
              href="https://app.rooksystem.com.br/login"
              className="text-body-md text-rook-text-muted hover:text-rook-text py-2"
              onClick={() => setMobileOpen(false)}
            >
              Entrar
            </Link>
            <Link
              href="https://app.rooksystem.com.br/registro"
              className="btn-primary text-center"
              onClick={() => setMobileOpen(false)}
            >
              Comecar Gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
