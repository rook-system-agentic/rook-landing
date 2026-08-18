import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleTagManager from "@/components/GoogleTagManager";
import AppHandoffTracker from "@/components/AppHandoffTracker";
import { Analytics } from "@vercel/analytics/react";
import { siteUrl } from "@/lib/site-origin";
import { FAQ_ITEMS } from "@/lib/lp-content";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Rook System — Inteligência financeira para food service",
  description:
    "Inteligência financeira para food service. O Rook lê a operação, interpreta as seis etapas — vendas, impostos, custos, despesas, dívidas e resultado — e aponta a próxima decisão em reais.",
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
    canonical: siteUrl(),
  },
  openGraph: {
    title: "Rook System — Inteligência financeira para food service",
    description: "Faturar não é lucrar. O Rook lê a operação, interpreta as seis etapas e aponta, em reais, a próxima decisão.",
    url: siteUrl(),
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
      "url": siteUrl(),
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": [
        {
          "@type": "Offer",
          "name": "Knight",
          "price": "479.90",
          "priceCurrency": "BRL",
          "priceValidUntil": "2027-12-31",
          "url": siteUrl("/planos/"),
          "description": "Plano para restaurantes com faturamento mensal de até R$ 250 mil. Acesso completo à plataforma. 7 dias de teste grátis."
        },
        {
          "@type": "Offer",
          "name": "Rook",
          "price": "779.90",
          "priceCurrency": "BRL",
          "priceValidUntil": "2027-12-31",
          "url": siteUrl("/planos/"),
          "description": "Plano para restaurantes com faturamento mensal acima de R$ 250 mil. Acesso completo à plataforma. 7 dias de teste grátis."
        },
        {
          "@type": "Offer",
          "name": "Chess",
          "price": "279.90",
          "priceCurrency": "BRL",
          "priceValidUntil": "2027-12-31",
          "url": siteUrl("/planos/"),
          "description": "Add-on organizacional para consolidação multiunidade (redes e franquias)."
        }
      ],
      "description": "Sistema de inteligência financeira e gestão para restaurantes. Controle CMV, DRE gerencial automático, score de saúde financeira e recomendações com impacto em R$."
    },
    {
      "@type": "Organization",
      "name": "Rook System",
      "url": siteUrl(),
      "logo": siteUrl("/brand/rook-logo-horizontal-light.png")
    },
    {
      "@type": "FAQPage",
      // Derivado do FAQ visível da home: uma fonte só, sem cópia para
      // dessincronizar. O texto do buscador é o texto que o visitante lê.
      "mainEntity": FAQ_ITEMS.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
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
        <GoogleTagManager />
        <AppHandoffTracker />
        <Header />
        <main className="pt-[72px]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
