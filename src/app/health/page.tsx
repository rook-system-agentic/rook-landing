import Link from "next/link";
import type { Metadata } from "next";
import HealthWhatsappCta from "@/components/health/HealthWhatsappCta";
import {
  HEALTH_CONTACT,
  HEALTH_HERO,
  HEALTH_HOW,
  HEALTH_LEAKS,
  HEALTH_META,
  HEALTH_ORIGIN,
  HEALTH_PANEL,
} from "@/lib/health-content";
import { HEALTH_CONTACT_ANCHOR, healthWhatsappHref } from "@/lib/health-whatsapp.mjs";
import { HEALTH_ICONS, HEALTH_OG_IMAGE, TWITTER_CARD } from "@/lib/og-image";
import { siteUrl } from "@/lib/site-origin";

/*
 * LP inicial da Rook Health — `/health/` (25/11/2026).
 *
 * POR QUE ISTO EXISTE
 *
 * A Rook atende bares e restaurantes. Esta página testa se a mesma leitura
 * financeira interessa a clínicas médicas, antes de existir produto: uma tese
 * ("Atender não é receber."), quatro dores na língua de quem vive de convênio e
 * um botão que abre conversa no WhatsApp. O texto mora em `lib/health-content`.
 *
 * `noindex, follow` E FORA DO SITEMAP, de propósito: é página de teste,
 * divulgada por link. Um resultado de busca prometendo um produto que ainda
 * não existe seria o site dizendo mais do que pode. Quando a Health virar
 * oferta, tira-se o `robots` daqui e acrescenta-se a rota em `sitemap.ts`. A
 * trava está em tests/health-lp.test.mjs.
 *
 * A MARCA: o logotipo da Rook Health fica no cabeçalho e no rodapé (Header e
 * Footer trocam de logo, links e texto nesta rota), então a página não repete
 * a assinatura dentro do conteúdo.
 *
 * A PALETA: o atributo `data-health` na raiz ativa, via `body:has(...)` em
 * globals.css, o Floresta no lugar do Terracota — inclusive no botão do
 * cabeçalho, que vive no layout. É o mesmo mecanismo que a home usou com
 * `data-lp-home`.
 *
 * SEM DEMONSTRAÇÃO NEM CHAT DO RODAPÉ: o formulário pergunta segmento culinário
 * e o chat fala de CMV. `RouteScopedAcquisition` tira os dois desta rota.
 *
 * O `openGraph` daqui substitui o do layout inteiro, então a imagem é
 * declarada de novo — e é a arte da Health, em verde, junto com o ícone da
 * aba (ver lib/og-image.ts).
 */
const PAGE_URL = siteUrl("/health/");

export const metadata: Metadata = {
  title: HEALTH_META.title,
  description: HEALTH_META.description,
  alternates: { canonical: PAGE_URL },
  robots: { index: false, follow: true },
  icons: HEALTH_ICONS,
  openGraph: {
    title: HEALTH_META.title,
    description: HEALTH_META.description,
    url: PAGE_URL,
    siteName: "Rook System",
    type: "website",
    locale: "pt_BR",
    images: [HEALTH_OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: HEALTH_META.title,
    description: HEALTH_META.description,
    images: [HEALTH_OG_IMAGE.url],
  },
};

const divider = { borderTop: "1px solid var(--color-border)" } as const;

export default function HealthPage() {
  // Lido no servidor: sem número válido a página mostra o aviso de "em breve"
  // em vez de um botão que abre conversa com ninguém (ver health-whatsapp.mjs).
  const whatsappHref = healthWhatsappHref(process.env.HEALTH_WHATSAPP_NUMBER);

  return (
    <div data-health>
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-label mb-6">{HEALTH_HERO.label}</p>
            <h1 className="heading-hero mb-8">
              {HEALTH_HERO.titleBefore}
              <em>{HEALTH_HERO.titleEmphasis}</em>
            </h1>
            <p className="text-body mb-5">{HEALTH_HERO.body}</p>
            <p className="text-body mb-10">{HEALTH_HERO.body2}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={HEALTH_CONTACT_ANCHOR} className="btn-primary">
                {HEALTH_HERO.primaryCta} →
              </Link>
              <Link href={HEALTH_HERO.secondaryHref} className="btn-ghost">
                {HEALTH_HERO.secondaryCta}
              </Link>
            </div>
          </div>

          {/*
            * Painel de exemplo. Sempre escuro, nos dois temas: é a "tela do
            * produto" da página, e as cores são fixas para o contraste não
            * depender do tema (branco sobre #141b23 e #1d2631; tinta sobre o
            * Ocre, que mede 8,2:1).
            */}
          <aside
            aria-label={`${HEALTH_PANEL.label} — ${HEALTH_PANEL.disclaimer.toLowerCase()}`}
            className="rounded-2xl p-7 sm:p-8"
            style={{ backgroundColor: "#141b23", color: "#eef3f8" }}
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "#4caf50" }}>
                {HEALTH_PANEL.label}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: "#8fa0b2" }}>
                {HEALTH_PANEL.disclaimer}
              </p>
            </div>
            <p className="font-display font-extrabold text-2xl leading-tight tracking-tight mb-6">
              {HEALTH_PANEL.headline}
            </p>
            <ul className="flex flex-col gap-3">
              {HEALTH_PANEL.rows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                  style={{ backgroundColor: "#1d2631" }}
                >
                  <span className="text-[15px]">{row.label}</span>
                  <span className="font-mono text-[15px] whitespace-nowrap">{row.value}</span>
                </li>
              ))}
              <li
                className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                style={{ backgroundColor: "#e79f4a", color: "#10151c" }}
              >
                <span className="text-[15px] font-semibold">{HEALTH_PANEL.alert.label}</span>
                <span className="font-mono text-[15px] whitespace-nowrap">{HEALTH_PANEL.alert.value}</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-spacing" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">{HEALTH_LEAKS.label}</p>
          <h2 className="heading-section mb-4">
            {HEALTH_LEAKS.title}
            <em>{HEALTH_LEAKS.titleEmphasis}</em>
          </h2>
          <p className="text-body max-w-2xl mb-10">{HEALTH_LEAKS.body}</p>
          <ul className="grid gap-5 md:grid-cols-2">
            {HEALTH_LEAKS.items.map((item) => (
              <li key={item.title} className="card h-full p-6">
                <h3 className="heading-section text-xl mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="como" className="section-spacing scroll-mt-[72px]" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">{HEALTH_HOW.label}</p>
          <h2 className="heading-section mb-10">
            {HEALTH_HOW.title}
            <em>{HEALTH_HOW.titleEmphasis}</em>
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {HEALTH_HOW.items.map((item, index) => (
              <li key={item.title} className="card h-full p-6">
                <p className="font-mono text-xs mb-4" style={{ color: "var(--health-accent-text)" }}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="heading-section text-xl mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-spacing" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">{HEALTH_ORIGIN.label}</p>
          <h2 className="heading-section mb-6">
            {HEALTH_ORIGIN.title}
            <em>{HEALTH_ORIGIN.titleEmphasis}</em>
          </h2>
          <p className="text-body max-w-2xl mb-8">{HEALTH_ORIGIN.body}</p>
          <Link
            href={HEALTH_ORIGIN.linkHref}
            className="font-mono text-xs uppercase tracking-wider underline underline-offset-4"
            style={{ color: "var(--health-accent-text)" }}
          >
            {HEALTH_ORIGIN.linkLabel} →
          </Link>
        </div>
      </section>

      <section id="contato" className="section-spacing scroll-mt-[72px]" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="card p-8 sm:p-12">
            <p className="section-label mb-6">{HEALTH_CONTACT.label}</p>
            <h2 className="heading-section mb-6">
              {HEALTH_CONTACT.title}
              <em>{HEALTH_CONTACT.titleEmphasis}</em>
            </h2>
            <p className="text-body max-w-2xl mb-8">{HEALTH_CONTACT.body}</p>
            {whatsappHref ? (
              <HealthWhatsappCta href={whatsappHref}>{HEALTH_CONTACT.cta} →</HealthWhatsappCta>
            ) : (
              <p role="status" className="text-body max-w-2xl" style={{ color: "var(--color-cream)" }}>
                {HEALTH_CONTACT.unavailable}
              </p>
            )}
            <p className="section-label mt-10">{HEALTH_CONTACT.footnote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
