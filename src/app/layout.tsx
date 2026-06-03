import type { Metadata } from 'next'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SchemaOrg } from '@/components/layout/SchemaOrg'
import { Analytics } from '@/components/layout/Analytics'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rooksystem.com.br'),
  title: {
    default: 'Rook System — Gestao Financeira para Restaurantes',
    template: '%s | Rook System',
  },
  description:
    'Controle CMV, otimize compras e proteja a margem do seu restaurante. Dados fiscais reais, 100% auditaveis. Faturar nao e lucrar — a Rook mostra onde esta o dinheiro.',
  keywords: [
    'gestao financeira restaurante',
    'controle CMV',
    'custo mercadoria vendida',
    'margem restaurante',
    'food cost',
    'gestao restaurante',
    'SaaS restaurante',
    'otimizacao compras restaurante',
  ],
  authors: [{ name: 'Rook System', url: 'https://rooksystem.com.br' }],
  creator: 'Rook System',
  publisher: 'CCGN LTDA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://rooksystem.com.br',
    siteName: 'Rook System',
    title: 'Rook System — Gestao Financeira para Restaurantes',
    description:
      'Controle CMV, otimize compras e proteja a margem do seu restaurante. Dados fiscais reais, 100% auditaveis.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rook System — Visao, Estrategia, Controle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rook System — Gestao Financeira para Restaurantes',
    description:
      'Controle CMV, otimize compras e proteja a margem do seu restaurante.',
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: 'https://rooksystem.com.br',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <head>
        <SchemaOrg />
        <Analytics />
      </head>
      <body className="font-body antialiased">
        <Header />
        <main id="main-content" role="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
