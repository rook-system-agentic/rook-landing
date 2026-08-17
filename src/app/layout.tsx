import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdsPixel from "@/components/GoogleAdsPixel";
import MetaPixel from "@/components/MetaPixel";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import { Analytics } from "@vercel/analytics/react";
import { siteUrl } from "@/lib/site-origin";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
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
    canonical: siteUrl(),
  },
  openGraph: {
    title: "Rook System — Inteligência Financeira e Gestão para Restaurantes",
    description: "Controle CMV, otimize compras e proteja a margem do seu restaurante com inteligência financeira.",
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
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Quanto custa o Rook System?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O Rook tem dois planos base: Knight (R$ 479,90/mês) para restaurantes com faturamento de até R$ 250 mil/mês, e Rook (R$ 779,90/mês) para faturamento acima de R$ 250 mil/mês. Ambos oferecem acesso completo à plataforma. Para redes e franquias, há o add-on Chess (R$ 279,90/mês por grupo econômico). Todos incluem 7 dias de teste grátis."
          }
        },
        {
          "@type": "Question",
          "name": "Como funciona o Rook System?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O Rook coleta, analisa e interpreta os dados financeiros e fiscais do seu restaurante, classificando cada linha com base em metodologia contábil e traduzindo tudo em um diagnóstico. Pelo fluxo de caixa ou pelo DRE, você recebe recomendações direcionadas à construção do seu lucro."
          }
        },
        {
          "@type": "Question",
          "name": "Posso testar o Rook antes de pagar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim. O período de teste dura 7 dias, é oferecido uma vez por Empresa/CNPJ e exige um cartão válido. Se você cancelar antes do término, a primeira cobrança não será realizada."
          }
        },
        {
          "@type": "Question",
          "name": "Preciso trocar o sistema que já uso?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Não. O Rook não substitui seu PDV ou ERP. Nossa metodologia lê seus dados e traduz seu resultado. Possuímos integração com os principais ERPs do mercado."
          }
        },
        {
          "@type": "Question",
          "name": "O Rook funciona em qualquer cidade do Brasil?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim. O Rook opera em todos os 26 estados + Distrito Federal. O cálculo tributário considera a UF do estabelecimento automaticamente."
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
