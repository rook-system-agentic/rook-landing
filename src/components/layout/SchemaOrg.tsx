'use client'

export function SchemaOrg() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rook System',
    legalName: 'CCGN LTDA',
    url: 'https://rooksystem.com.br',
    logo: 'https://rooksystem.com.br/images/logo-rook.svg',
    description:
      'SaaS de gestao financeira para restaurantes. Controle CMV, otimize compras e proteja a margem do seu negocio com dados fiscais reais e 100% auditaveis.',
    foundingDate: '2024',
    founders: [
      { '@type': 'Person', name: 'Gabriel Abdala' },
      { '@type': 'Person', name: 'Eraldo Paixao' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
    },
    sameAs: [
      'https://www.linkedin.com/company/rooksystem',
      'https://www.instagram.com/rooksystem',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: 'https://rooksystem.com.br/planos',
    },
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Rook System',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://app.rooksystem.com.br',
    description:
      'Plataforma de gestao financeira para restaurantes com controle de CMV, analise de compras e protecao de margem baseada em dados fiscais reais.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Pawn (Gratuito)',
        price: '0',
        priceCurrency: 'BRL',
        description: 'Calculadora basica de CMV com limite de calculos',
      },
      {
        '@type': 'Offer',
        name: 'Knight',
        price: '197',
        priceCurrency: 'BRL',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          billingDuration: 'P1M',
        },
        description: 'Calculos ilimitados, historico 12 meses, projecoes, dashboard',
      },
      {
        '@type': 'Offer',
        name: 'Rook',
        price: '497',
        priceCurrency: 'BRL',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          billingDuration: 'P1M',
        },
        description: 'Integracao ERP/PDV, analise preditiva, curva ABC, projecoes 24 meses',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '12',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  )
}
