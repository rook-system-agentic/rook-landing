import Link from "next/link";
import type { Metadata } from "next";
import { HealthLeakArt, HealthMessageBubble, HealthStepIcon } from "@/components/health/HealthArt";
import HealthMoney from "@/components/health/HealthMoney";
import HealthMoneyPath from "@/components/health/HealthMoneyPath";
import HealthWhatsappCta from "@/components/health/HealthWhatsappCta";
import Reveal from "@/components/lp/LpReveal";
import {
  HEALTH_CONTACT,
  HEALTH_FILM,
  HEALTH_HERO,
  HEALTH_HOW,
  HEALTH_LEAKS,
  HEALTH_META,
  HEALTH_ORIGIN,
  HEALTH_PANEL,
  HEALTH_PATH,
} from "@/lib/health-content";
import { HEALTH_CONTACT_ANCHOR, HEALTH_WHATSAPP_MESSAGE, healthWhatsappHref } from "@/lib/health-whatsapp.mjs";
import { HEALTH_ICONS, HEALTH_OG_IMAGE, TWITTER_CARD } from "@/lib/og-image";
import { siteUrl } from "@/lib/site-origin";

/*
 * LP inicial da Rook Health — `/health/` (25/11/2026).
 *
 * POR QUE ISTO EXISTE
 *
 * A Rook atende bares e restaurantes. Esta página testa se a mesma leitura
 * financeira interessa a clínicas médicas. Para o
 * visitante, a credencial é a consultoria de controladoria (seção "De onde
 * vem"), não o produto de restaurantes. A página traz uma tese
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
 * IMAGEM E MOVIMENTO (25/11/2026): a primeira versão era só texto. Agora o
 * painel do hero conta os valores, o "caminho do dinheiro" mostra o faturado
 * encolhendo até a sobra, e cada cartão de dor tem a cena desenhada
 * (components/health/HealthArt). Tudo segue docs/design-v4.md: o repouso é o
 * estado final, e o `<Reveal>` só acrescenta a entrada.
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
      <section className="section-spacing overflow-x-clip">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-label mb-6">{HEALTH_HERO.label}</p>
            <h1 className="heading-hero mb-5">
              {HEALTH_HERO.titleBefore}
              <em>{HEALTH_HERO.titleEmphasis}</em>
            </h1>
            {/* A tese, como subtítulo: menor que o título, maior que o corpo. */}
            <p className="font-display mb-8 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--color-cream)" }}>
              {HEALTH_HERO.thesis}
            </p>
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
          <Reveal className="relative">
          {/* Halo decorativo atrás do painel. Opacidade só aqui, onde não há
              informação a esconder (design-v4, regra 1). */}
          <div aria-hidden="true" className="health-halo" />
          {/*
            * A foto do hero: a dona da clínica depois do expediente, ainda
            * fechando a conta. É a tese da página numa imagem, para quem não
            * vai ler os parágrafos.
            *
            * É AMBIENTAÇÃO, gerada por IA (Higgsfield, 25/11/2026): não é
            * cliente nem depoimento, por isso não leva nome, cargo nem legenda.
            * Trocar por foto de clínica real quando houver uma.
            *
            * `<img>` com `srcSet` escrito à mão porque o projeto roda com
            * `images.unoptimized` (next.config): o Next não gera tamanhos, então
            * os dois arquivos em public/health/ SÃO os tamanhos. `width` e
            * `height` reservam o espaço e a página não pula quando a foto chega.
            *
            * No computador a foto é recortada em 3:2 e o painel sobe mais sobre
            * ela: com a foto inteira a coluna ficava muito mais alta que o texto
            * ao lado, e sobrava um vazio grande acima do título.
            */}
          <div className="health-photo relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HEALTH_HERO.photo.src}
              srcSet={HEALTH_HERO.photo.srcSet}
              sizes="(min-width: 1024px) 560px, 100vw"
              width={1400}
              height={1045}
              alt={HEALTH_HERO.photo.alt}
              decoding="async"
              className="block h-auto w-full lg:aspect-[3/2] lg:object-cover lg:object-[50%_38%]"
            />
          </div>
          <aside
            aria-label={`${HEALTH_PANEL.label} — ${HEALTH_PANEL.disclaimer.toLowerCase()}`}
            className="health-panel relative z-10 mx-4 -mt-10 rounded-2xl p-7 sm:mx-8 sm:-mt-14 sm:p-8 lg:-mt-28"
            style={{ backgroundColor: "#141b23", color: "#eef3f8" }}
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "#4caf50" }}>
                <span aria-hidden="true" className="health-pulse inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#4caf50" }} />
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
              {HEALTH_PANEL.rows.map((row, i) => (
                <li
                  key={row.label}
                  className="lp-dre-row flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                  style={{ backgroundColor: "#1d2631", animationDelay: `${200 + i * 140}ms` }}
                >
                  <span className="text-[15px]">{row.label}</span>
                  <HealthMoney valor={row.value} className="font-mono text-[15px] whitespace-nowrap" />
                </li>
              ))}
              <li
                className="lp-dre-row flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                style={{ backgroundColor: "#e79f4a", color: "#10151c", animationDelay: "480ms" }}
              >
                <span className="text-[15px] font-semibold">{HEALTH_PANEL.alert.label}</span>
                <span className="font-mono text-[15px] whitespace-nowrap">{HEALTH_PANEL.alert.value}</span>
              </li>
            </ul>
          </aside>
          </Reveal>
        </div>
      </section>

      <section className="section-spacing" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="health-head">
            <div>
              <p className="section-label mb-6">{HEALTH_FILM.label}</p>
              <h2 className="heading-section">
                {HEALTH_FILM.title}
                <em>{HEALTH_FILM.titleEmphasis}</em>
              </h2>
            </div>
            <p className="text-body">{HEALTH_FILM.body}</p>
          </div>
          {/*
            * O filme. `preload="none"` + capa: nada do vídeo é baixado até o
            * play, então a seção custa uma imagem. Sem `autoPlay`: quem decide
            * ver (e ouvir) é a pessoa. `playsInline` evita a tela cheia forçada
            * no iPhone. O fundo fixo é o do próprio filme, para a moldura não
            * piscar clara antes de a capa chegar.
            */}
          <Reveal>
            <figure className="m-0 mx-auto max-w-5xl">
              <video
                className="health-panel block aspect-video w-full rounded-2xl"
                style={{ backgroundColor: "#10151c" }}
                controls
                playsInline
                preload="none"
                poster={HEALTH_FILM.poster}
                aria-label={HEALTH_FILM.descricao}
              >
                <source src={HEALTH_FILM.src} type="video/mp4" />
              </video>
              <figcaption className="section-label mt-4">{HEALTH_PATH.disclaimer}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="section-spacing" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="health-head">
            <div>
              <p className="section-label mb-6">{HEALTH_PATH.label}</p>
              <h2 className="heading-section">
                {HEALTH_PATH.title}
                <em>{HEALTH_PATH.titleEmphasis}</em>
              </h2>
            </div>
            <p className="text-body">{HEALTH_PATH.body}</p>
          </div>
          <HealthMoneyPath />
        </div>
      </section>

      <section className="section-spacing" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="health-head">
            <div>
              <p className="section-label mb-6">{HEALTH_LEAKS.label}</p>
              <h2 className="heading-section">
                {HEALTH_LEAKS.title}
                <em>{HEALTH_LEAKS.titleEmphasis}</em>
              </h2>
            </div>
            <p className="text-body">{HEALTH_LEAKS.body}</p>
          </div>
          <ul className="grid gap-5 md:grid-cols-2">
            {HEALTH_LEAKS.items.map((item, i) => (
              <Reveal as="li" key={item.title} delay={(i % 2) * 120} className="card h-full p-6">
                <HealthLeakArt art={item.art} />
                <h3 className="heading-section text-xl mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item.text}
                </p>
              </Reveal>
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
              <Reveal as="li" key={item.title} delay={index * 140} className="card h-full p-6">
                <div className="mb-5 flex items-center justify-between">
                  <HealthStepIcon icon={item.icon} />
                  <p className="font-mono text-xs" style={{ color: "var(--health-accent-text)" }}>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
                <h3 className="heading-section text-xl mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item.text}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-spacing" style={divider}>
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-label mb-6">{HEALTH_ORIGIN.label}</p>
            <h2 className="heading-section mb-6">
              {HEALTH_ORIGIN.title}
              <em>{HEALTH_ORIGIN.titleEmphasis}</em>
            </h2>
            <p className="text-body mb-8">{HEALTH_ORIGIN.body}</p>
            <Link
              href={HEALTH_ORIGIN.linkHref}
              className="font-mono text-xs uppercase tracking-wider underline underline-offset-4"
              style={{ color: "var(--health-accent-text)" }}
            >
              {HEALTH_ORIGIN.linkLabel} →
            </Link>
          </div>
          {/*
            * As três provas ao lado do texto: de onde vem a autoridade para
            * falar do financeiro de uma clínica. São as três frentes da
            * consultoria, não resultado de cliente. Cada linha entra com um pequeno
            * atraso (o `<Reveal>` de sempre); em repouso estão todas.
            */}
          <Reveal className="card p-6 sm:p-8">
            <ul className="flex flex-col gap-3">
              {HEALTH_ORIGIN.provas.map((prova, i) => (
                <Reveal
                  as="li"
                  key={prova.titulo}
                  delay={150 + i * 140}
                  className="flex flex-col gap-1 rounded-xl bg-[var(--color-bg-elevated)] px-5 py-5"
                >
                  <span
                    className="font-display text-xl font-extrabold tracking-tight"
                    style={{ color: "var(--health-accent-text)" }}
                  >
                    {prova.titulo}
                  </span>
                  <span className="text-[15px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {prova.texto}
                  </span>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="contato" className="section-spacing scroll-mt-[72px]" style={divider}>
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="card grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
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
            {whatsappHref ? (
              <HealthMessageBubble legenda={HEALTH_CONTACT.preview} mensagem={HEALTH_WHATSAPP_MESSAGE} />
            ) : null}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
