import type { Metadata } from "next";
import Link from "next/link";
import {
  CommercialLeadButton,
  PlansCommercialExperience,
} from "@/components/plans/PlansCommercialExperience";
import { TrialDateEstimate } from "@/components/plans/TrialDateEstimate";
import {
  BILLING_CATALOG_REVALIDATE_SECONDS,
  getLandingBillingCatalog,
} from "@/lib/billing-catalog-server";
import { buildBillingCatalogViewModel } from "@/lib/public-billing-catalog.mjs";

export const revalidate = BILLING_CATALOG_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Planos Knight, Rook e Chess — Rook System",
  description:
    "Planos mensais do Rook System para restaurantes e grupos multiunidade, com 7 dias de utilização mediante cadastro do cartão.",
  alternates: { canonical: "https://www.rook.com.br/planos/" },
  openGraph: {
    title: "Planos Knight, Rook e Chess — Rook System",
    description:
      "Acesso completo com enquadramento por faturamento e Chess para organizações multiunidade.",
    url: "https://www.rook.com.br/planos/",
    type: "website",
  },
};

function CatalogUnavailable() {
  return (
    <section
      className="section-spacing border-t border-border"
      aria-labelledby="catalog-unavailable-title"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="section-label mb-6">— Catálogo em atualização</p>
        <h2 id="catalog-unavailable-title" className="heading-section mb-4">
          Valores temporariamente <em>indisponíveis.</em>
        </h2>
        <p className="text-body mx-auto mb-8 text-center">
          O catálogo oficial e o último snapshot validado não puderam ser
          confirmados. Por segurança, não exibimos preços antigos nem iniciamos
          uma contratação.
        </p>
        <CommercialLeadButton interest="general" className="btn-ghost">
          Falar com a equipe comercial
        </CommercialLeadButton>
      </div>
    </section>
  );
}

export default async function PlanosPage() {
  const catalogResult = await getLandingBillingCatalog();
  if (!catalogResult.catalog) {
    return (
      <>
        <section className="section-spacing">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="section-label mb-6">— Planos</p>
            <h1 className="heading-hero mb-6">
              A oferta certa começa por dados <em>confiáveis.</em>
            </h1>
          </div>
        </section>
        <CatalogUnavailable />
      </>
    );
  }

  const view = buildBillingCatalogViewModel(catalogResult.catalog);
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Planos mensais Rook System",
    url: "https://www.rook.com.br/planos/",
    itemListElement: catalogResult.catalog.offers.map((offer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: offer.displayName,
        description: offer.description,
        brand: { "@type": "Brand", name: "Rook System" },
        offers: {
          "@type": "Offer",
          priceCurrency: offer.currency,
          price: (offer.unitAmountCents / 100).toFixed(2),
          url: "https://www.rook.com.br/planos/",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <section className="section-spacing" data-catalog-release={view.releaseId}>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="section-label mb-6">— Planos mensais recorrentes</p>
          <h1 className="heading-hero mb-6">
            O mesmo acesso. O enquadramento <em>certo.</em>
          </h1>
          <p className="text-body mx-auto mb-12 text-center">
            Knight e Rook entregam acesso completo. A diferença não está nos
            recursos: está no faturamento bruto mensal de cada estabelecimento.
          </p>

          <PlansCommercialExperience
            threshold={view.threshold}
            basePlans={view.basePlans}
            chess={view.chess}
          />
        </div>
      </section>

      <section className="section-spacing border-t border-border" aria-labelledby="trial-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-label mb-6">— Antes da primeira cobrança</p>
            <h2 id="trial-title" className="heading-section mb-5">
              {view.trialDays} dias para usar. <em>Com data clara.</em>
            </h2>
            <p className="text-body">
              <TrialDateEstimate trialDays={view.trialDays} />
            </p>
          </div>
          <div className="card grid gap-5 p-6 sm:grid-cols-3">
            {[
              ["01", "Cartão cadastrado", "Obrigatório para iniciar o período de utilização."],
              ["02", `${view.trialDays} dias de uso`, "Uma utilização por Organização/CNPJ."],
              ["03", "Cobrança mensal", "Começa na data exibida no checkout, salvo cancelamento anterior."],
            ].map(([step, title, description]) => (
              <div key={step}>
                <p className="font-mono text-xs text-terracota">{step}</p>
                <h3 className="mt-2 font-semibold text-cream">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="chess-details"
        className="section-spacing scroll-mt-24 border-t border-border"
        aria-labelledby="chess-title"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="section-label mb-6">— Adicional multiunidade</p>
              <h2 id="chess-title" className="heading-section mb-5">
                Chess organiza o grupo. <em>Unidade por unidade.</em>
              </h2>
              <p className="text-body mb-6">
                {view.chess.description} Cada estabelecimento mantém Knight ou
                Rook, e a organização adiciona uma mensalidade Chess.
              </p>
              <p className="text-3xl font-bold text-cream">
                {view.chess.formattedPrice}
                <span className="ml-2 text-sm font-normal text-muted">
                  /organização/mês
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                A cobrança pode ser centralizada na matriz ou mantida por
                restaurante, conforme a configuração escolhida pelo grupo.
              </p>
              <CommercialLeadButton
                interest="chess"
                interestLabel={view.chess.displayName}
                className="btn-ghost mt-8 inline-flex"
              >
                Falar com especialista
              </CommercialLeadButton>
            </div>

            <div className="card p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-wider text-ocre">
                Atendimento para grupos
              </p>
              <h3 className="mt-3 text-2xl font-bold text-cream">
                Configuração assistida
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A estrutura do grupo e a forma de cobrança são definidas com a
                equipe comercial e registradas no atendimento.
              </p>
              <ul className="mt-7 space-y-4 text-sm text-muted">
                {[
                  "Mapeamento da matriz e das unidades do grupo",
                  "Cobrança centralizada ou separada por restaurante",
                  "Orientação comercial adequada à estrutura informada",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 text-floresta" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-border pt-5">
                <p className="text-xs leading-relaxed text-muted">
                  O contato enviado nesta página fica registrado para
                  acompanhamento da equipe Rook.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing border-t border-border" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="section-label mb-6">— Perguntas</p>
            <h2 id="faq-title" className="heading-section mb-4">
              Regras sem <em>letras miúdas.</em>
            </h2>
            <p className="text-body">
              A contratação final sempre mostra plano, itens e a
              data da primeira cobrança antes da confirmação.
            </p>
          </div>
          <div className="space-y-4">
            {[
              [
                "Posso escolher Knight mesmo acima do limite?",
                `Não. Até ${view.threshold} de faturamento bruto mensal, o enquadramento é Knight; acima desse valor, é Rook. Os dois possuem acesso funcional completo.`,
              ],
              [
                "Como funciona a regra dos três meses?",
                "A regra prevista para reenquadramento usa três meses completos e consecutivos. Enquanto o processo automático não estiver ativado, qualquer mudança é acompanhada pela equipe e comunicada antes de produzir efeito.",
              ],
              [
                "Como é feita a cobrança do Chess?",
                "Chess é uma mensalidade adicional por organização. Cada estabelecimento mantém seu item Knight ou Rook; o grupo pode centralizar o pagamento na matriz ou manter cobranças por restaurante.",
              ],
              [
                "Quando ocorre a primeira cobrança?",
                <TrialDateEstimate
                  key="trial-date-faq"
                  trialDays={view.trialDays}
                  context="faq"
                />,
              ],
              [
                "Posso cancelar antes de pagar?",
                "Sim. O cancelamento anterior ao fim do período de utilização impede a primeira cobrança, conforme os termos apresentados na contratação.",
              ],
              [
                "E os clientes que já usam o Rook?",
                "Qualquer migração será comunicada individualmente. Não haverá troca silenciosa de plano ou cobrança sem aviso e rastreabilidade.",
              ],
            ].map(([question, answer]) => (
              <details key={String(question)} className="card group p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-cream">
                  {question}
                  <span className="text-xl text-ocre transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl justify-end px-6 text-xs text-muted">
          <Link href="/funcionalidades/" className="text-cream underline-offset-4 hover:underline">
            Conhecer as funcionalidades →
          </Link>
        </div>
      </section>
    </>
  );
}
