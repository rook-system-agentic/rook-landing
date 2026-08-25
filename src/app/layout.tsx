import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleTagManager from "@/components/GoogleTagManager";
import AppHandoffTracker from "@/components/AppHandoffTracker";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { siteUrl } from "@/lib/site-origin";
import { OG_IMAGE, OG_IMAGE_PATH, TWITTER_CARD } from "@/lib/og-image";
import { FAQ_ITEMS } from "@/lib/lp-content";
import { descricaoParaBuscador } from "@/lib/planos-copy.mjs";
import { getLandingBillingCatalog } from "@/lib/billing-catalog-server";
import type { PublicBillingCatalog } from "@/lib/public-billing-catalog.mjs";

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
  /*
   * AQUI NÃO ENTRA `alternates.canonical`. (ROO-1125, 21/08/2026)
   *
   * Havia `canonical: siteUrl()` neste lugar, e o efeito era o oposto do
   * pretendido: metadata de layout é HERDADA por toda página que não declara a
   * sua. Então `/termos/`, `/privacidade/` e `/sobre/` diziam ao Google que a
   * URL oficial delas era a HOME — e o Google fez o que foi mandado, tirando as
   * três do índice. É o mesmo defeito de canonical que a ROO-1125 abriu para
   * consertar, só que vindo de dentro em vez de vir do www.
   *
   * A canonical da home agora mora em `src/app/page.tsx`, junto da home. Sem
   * valor global, página que esquecer a sua fica SEM canonical — e sem canonical
   * o Google auto-referencia a própria URL, que é o certo. Errar por omissão
   * custa nada; errar apontando para outra página custa a indexação.
   *
   * A trava está em `tests/canonical-origin.test.mjs`.
   */
  /*
   * A IMAGEM DE COMPARTILHAMENTO. (24/08/2026)
   *
   * O site não declarava `og:image`. Quando o link era colado no LinkedIn, o
   * scraper varria a página e escolhia sozinho — e escolheu o LOGO DA OMIE.
   *
   * O motivo é específico e vale registrar, porque a armadilha volta: as duas
   * primeiras imagens da página são os logos do Rook em `.webp`, formato que o
   * scraper do LinkedIn não consome. A terceira é `/partners/omie.png` — o
   * primeiro PNG do documento. Sem `og:image`, o compartilhamento do Rook
   * anunciava um parceiro.
   *
   * A arte fica em `public/og/`, e não em `public/brand/`, de propósito: o teste
   * de performance limita arte de marca a 20 KB porque ela é baixada por todo
   * visitante. Esta aqui NUNCA é carregada pela página — só por scraper de
   * rede social —, e 20 KB inviabilizariam 1200×630 legível. PNG e não WebP,
   * pelo mesmo motivo que causou o problema.
   */
  openGraph: {
    title: "Rook System — Inteligência financeira para food service",
    description: "Faturar não é lucrar. O Rook lê a operação, interpreta as seis etapas e aponta, em reais, a próxima decisão.",
    url: siteUrl(),
    siteName: "Rook System",
    type: "website",
    locale: "pt_BR",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: "Rook System — Inteligência financeira para food service",
    description: "Faturar não é lucrar. O Rook lê a operação, interpreta as seis etapas e aponta, em reais, a próxima decisão.",
    images: [OG_IMAGE_PATH],
  },
};

/**
 * Ofertas do dado estruturado, montadas a partir do CATÁLOGO.
 *
 * POR QUE ISTO NÃO É MAIS LITERAL (25/08/2026)
 *
 * Aqui estavam os três planos digitados à mão — preço, limiar de faturamento,
 * dias de teste e a frase — dentro do bloco que vai em TODA página do site e é
 * lido pelo Google. Batiam com o catálogo por terem sido escritos no mesmo dia,
 * não por construção.
 *
 * O dia em que deixassem de bater seria silencioso: a /planos lê o catálogo e
 * mudaria sozinha, enquanto este bloco seguiria anunciando o preço velho para o
 * buscador, no site inteiro. Preço errado em dado estruturado não é erro de
 * texto — é promessa comercial que a própria página de planos desmente.
 *
 * É o mesmo princípio que o FAQPage logo abaixo já seguia: uma fonte só, sem
 * cópia para dessincronizar.
 *
 * SEM CATÁLOGO, SEM OFERTAS. Se o catálogo e o snapshot falharem, o nó sai sem
 * a chave `offers` em vez de cair num valor de reserva. Dado estruturado
 * ausente é neutro para o buscador; dado estruturado errado é que custa caro.
 * Mesmo tratamento de falha que a /planos já dá.
 */
function ofertasParaBuscador(catalogo: PublicBillingCatalog | null) {
  if (!catalogo) return [];
  const diasDeTeste = catalogo.trial.durationDays;
  return catalogo.offers.flatMap((oferta) => {
    // O teste é dos planos-base; o Chess é adicional de organização.
    const dias = oferta.productCode === "chess" ? null : diasDeTeste;
    const description = descricaoParaBuscador(oferta.productCode, dias);
    if (!description) return [];
    return [
      {
        "@type": "Offer",
        name: oferta.displayName,
        price: (oferta.unitAmountCents / 100).toFixed(2),
        priceCurrency: oferta.currency,
        priceValidUntil: PRECO_VALIDO_ATE,
        url: siteUrl("/planos/"),
        description,
      },
    ];
  });
}

/**
 * Até quando o preço anunciado vale, no formato do schema.org.
 *
 * Continua literal porque o catálogo não expressa validade de preço — a
 * release tem início (`effectiveFrom`) e não tem fim. É data de vitrine, não
 * de cobrança: passar dela não quebra nada, só faz o buscador tratar o preço
 * como desatualizado.
 */
const PRECO_VALIDO_ATE = "2027-12-31";

function construirJsonLd(catalogo: PublicBillingCatalog | null) {
  const ofertas = ofertasParaBuscador(catalogo);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Rook System",
        url: siteUrl(),
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        ...(ofertas.length > 0 ? { offers: ofertas } : {}),
        description:
          "Sistema de inteligência financeira e gestão para restaurantes. Controle CMV, DRE gerencial automático, score de saúde financeira e recomendações com impacto em R$.",
      },
      {
        "@type": "Organization",
        name: "Rook System",
        url: siteUrl(),
        logo: siteUrl("/brand/rook-logo-horizontal-light.png"),
      },
      {
        "@type": "FAQPage",
        // Derivado do FAQ visível da home: uma fonte só, sem cópia para
        // dessincronizar. O texto do buscador é o texto que o visitante lê.
        mainEntity: FAQ_ITEMS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { catalog } = await getLandingBillingCatalog();
  const jsonLd = construirJsonLd(catalog);

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
        <CookieConsent />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
