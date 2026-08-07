import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://rook.com.br"),
  title: "Rook System — Inteligência Financeira e Gestão para Restaurantes",
  description:
    "Sistema de inteligência financeira e gestão para restaurantes. Controle CMV, ficha técnica automática, DRE em tempo real e análise preditiva de compras e vendas.",
  keywords: [
    "sistema de inteligência financeira para restaurantes",
    "sistema de gestão para restaurante",
    "sistema de gestão para restaurantes",
    "sistema para restaurante",
    "software para restaurante",
    "gestão financeira restaurante",
    "controle de CMV",
    "food service",
    "controle de custos",
    "margem de lucro restaurante"
  ],
  alternates: {
    canonical: "https://rook.com.br",
  },
  openGraph: {
    title: "Rook System — Inteligência Financeira e Gestão para Restaurantes",
    description: "Controle CMV, otimize compras e proteja a margem do seu restaurante com inteligência financeira.",
    url: "https://rook.com.br",
    siteName: "Rook System",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rook System",
      "url": "https://rook.com.br",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL"
      },
      "description": "Sistema de gestão para restaurante com controle de CMV, ficha técnica e inteligência financeira."
    },
    {
      "@type": "Organization",
      "name": "Rook System",
      "url": "https://rook.com.br",
      "logo": "https://rook.com.br/brand/rook-logo-horizontal-light.png"
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rook-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <Header />
        <main className="pt-[72px]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
