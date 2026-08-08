import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdsPixel from "@/components/GoogleAdsPixel";
import MetaPixel from "@/components/MetaPixel";
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
      "offers": [
        {
          "@type": "Offer",
          "name": "Knight",
          "price": "479.90",
          "priceCurrency": "BRL",
          "priceValidUntil": "2027-12-31",
          "url": "https://rook.com.br/planos/",
          "description": "Plano para restaurantes com faturamento mensal de at\u00e9 R$ 250 mil. Acesso completo \u00e0 plataforma. 7 dias de teste gr\u00e1tis."
        },
        {
          "@type": "Offer",
          "name": "Rook",
          "price": "779.90",
          "priceCurrency": "BRL",
          "priceValidUntil": "2027-12-31",
          "url": "https://rook.com.br/planos/",
          "description": "Plano para restaurantes com faturamento mensal acima de R$ 250 mil. Acesso completo \u00e0 plataforma. 7 dias de teste gr\u00e1tis."
        },
        {
          "@type": "Offer",
          "name": "Chess",
          "price": "279.90",
          "priceCurrency": "BRL",
          "priceValidUntil": "2027-12-31",
          "url": "https://rook.com.br/planos/",
          "description": "Add-on organizacional para consolida\u00e7\u00e3o multiunidade (redes e franquias)."
        }
      ],
      "description": "Sistema de intelig\u00eancia financeira e gest\u00e3o para restaurantes. Controle CMV, DRE gerencial autom\u00e1tico, score de sa\u00fade financeira e recomenda\u00e7\u00f5es com impacto em R$."
    },
    {
      "@type": "Organization",
      "name": "Rook System",
      "url": "https://rook.com.br",
      "logo": "https://rook.com.br/brand/rook-logo-horizontal-light.png"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Quanto custa o Rook System?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O Rook tem dois planos base: Knight (R$ 479,90/m\u00eas) para restaurantes com faturamento de at\u00e9 R$ 250 mil/m\u00eas, e Rook (R$ 779,90/m\u00eas) para faturamento acima de R$ 250 mil/m\u00eas. Ambos oferecem acesso completo \u00e0 plataforma. Para redes e franquias, h\u00e1 o add-on Chess (R$ 279,90/m\u00eas por organiza\u00e7\u00e3o). Todos incluem 7 dias de teste gr\u00e1tis."
          }
        },
        {
          "@type": "Question",
          "name": "Como funciona o Rook System?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O Rook coleta, analisa e interpreta os dados financeiros e fiscais do seu restaurante, classificando cada linha com base em metodologia cont\u00e1bil e traduzindo tudo em um diagn\u00f3stico. Pelo fluxo de caixa ou pelo DRE, voc\u00ea recebe recomenda\u00e7\u00f5es direcionadas \u00e0 constru\u00e7\u00e3o do seu lucro."
          }
        },
        {
          "@type": "Question",
          "name": "Posso testar o Rook antes de pagar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim. O per\u00edodo de teste dura 7 dias, \u00e9 oferecido uma vez por Empresa/CNPJ e exige um cart\u00e3o v\u00e1lido. Se voc\u00ea cancelar antes do t\u00e9rmino, a primeira cobran\u00e7a n\u00e3o ser\u00e1 realizada."
          }
        },
        {
          "@type": "Question",
          "name": "Preciso trocar o sistema que j\u00e1 uso?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "N\u00e3o. O Rook n\u00e3o substitui seu PDV ou ERP. Nossa metodologia l\u00ea seus dados e traduz seu resultado. Possu\u00edmos integra\u00e7\u00e3o com os principais ERPs do mercado."
          }
        },
        {
          "@type": "Question",
          "name": "O Rook funciona em qualquer cidade do Brasil?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim. O Rook opera em todos os 26 estados + Distrito Federal. O c\u00e1lculo tribut\u00e1rio considera a UF do estabelecimento automaticamente."
          }
        }
      ]
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
        <GoogleAdsPixel />
        <MetaPixel />
        <MicrosoftClarity />
        <Header />
        <main className="pt-[72px]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
