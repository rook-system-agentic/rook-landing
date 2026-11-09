import type { Metadata } from "next";
import Bf1CommunityCta from "@/components/bf1/Bf1CommunityCta";
import Bf1Countdown from "@/components/bf1/Bf1Countdown";
import styles from "@/components/bf1/bf1.module.css";
import LpCountUp from "@/components/lp/LpCountUp";
import Reveal from "@/components/lp/LpReveal";
import { BF1_CONTENT, type Bf1IconName } from "@/lib/bf1-content";
import { TWITTER_CARD } from "@/lib/og-image";
import { siteUrl } from "@/lib/site-origin";

/*
 * LP de Black Friday `/bl1/` (ROO-1825).
 *
 * Uma página, um clique: entrar na comunidade do Rook no WhatsApp. Por isso a
 * seção de demonstração do rodapé não aparece aqui (RouteScopedAcquisition) e
 * o CTA do cabeçalho aponta para o fim da página.
 *
 * `noindex, follow`: é página de campanha com prazo, divulgada por link. Fora
 * do sitemap pelo mesmo motivo — depois de 27/11 ela não deve virar resultado
 * de busca velho. A trava está em tests/bf1-community.test.mjs.
 *
 * O `openGraph` daqui substitui o do layout inteiro (ver lib/og-image.ts), então
 * a imagem é declarada de novo — a prévia no WhatsApp é a primeira impressão
 * desta página. A arte vive em public/og/, em PNG.
 */
const PAGE_URL = siteUrl("/bl1/");

const BF1_OG_IMAGE = {
  url: "/og/bf1-og.png",
  width: 1200,
  height: 630,
  alt: BF1_CONTENT.meta.ogAlt,
  type: "image/png",
} as const;

export const metadata: Metadata = {
  title: BF1_CONTENT.meta.title,
  description: BF1_CONTENT.meta.description,
  alternates: { canonical: PAGE_URL },
  robots: { index: false, follow: true },
  openGraph: {
    title: BF1_CONTENT.meta.ogTitle,
    description: BF1_CONTENT.meta.ogDescription,
    url: PAGE_URL,
    siteName: "Rook System",
    type: "website",
    locale: "pt_BR",
    images: [BF1_OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: BF1_CONTENT.meta.ogTitle,
    description: BF1_CONTENT.meta.ogDescription,
    images: [BF1_OG_IMAGE.url],
  },
};

// Ícones de traço simples, no mesmo peso dos marcadores do site.
function BenefitIcon({ name }: { name: Bf1IconName }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg {...common}>
        <path d="M3.5 12.3V4.8a1.3 1.3 0 0 1 1.3-1.3h7.5l8.2 8.2a1.3 1.3 0 0 1 0 1.8l-7.1 7.1a1.3 1.3 0 0 1-1.8 0z" />
        <circle cx="8.3" cy="8.3" r="1.4" />
        <path d="M10.5 15.5l5-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3" />
    </svg>
  );
}

function Headline({ plain, emphasis }: { plain: string; emphasis: string }) {
  return (
    <>
      {plain}
      <em>{emphasis}</em>
    </>
  );
}

function TrustLine() {
  return (
    <ul className={styles.trust}>
      {BF1_CONTENT.cta.trust.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function BlackFridayCommunityPage() {
  const { hero, preview, benefits, history, steps, final } = BF1_CONTENT;

  return (
    <div className={styles.page} data-bf1>
      <section className={styles.hero} aria-labelledby="bf1-title">
        <div className={styles.heroBackdrop} aria-hidden="true">
          <span className={`${styles.glow} ${styles.glowA}`} />
          <span className={`${styles.glow} ${styles.glowB}`} />
          <span className={styles.gridLines} />
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span>{hero.eyebrow}</span>
              <span className={styles.liveTag}>
                <span className={styles.liveDot} aria-hidden="true" />
                {hero.liveTag}
              </span>
            </p>
            <h1 id="bf1-title" className={styles.title}>
              {hero.headlinePlain} <em>{hero.headlineEmphasis}</em>
            </h1>
            <p className={styles.lead}>{hero.lead}</p>
            <div className={styles.ctaRow}>
              <Bf1CommunityCta />
              <a href={`#${history.id}`} className={styles.secondary}>
                {hero.secondaryLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            </div>
            <TrustLine />
            <Bf1Countdown />
          </div>

          <div className={styles.preview}>
            <div className={styles.statChip}>
              <span className={styles.statChipValue}>{hero.stat.value}</span>
              <span className={styles.statChipCaption}>{hero.stat.caption}</span>
            </div>
            <div className={styles.phone}>
              <div className={styles.phoneHeader}>
                <span className={styles.avatar} aria-hidden="true">
                  R
                </span>
                <div>
                  <p className={styles.phoneTitle}>{preview.title}</p>
                  <p className={styles.phoneSubtitle}>{preview.subtitle}</p>
                </div>
              </div>
              <ul className={styles.bubbles}>
                {preview.messages.map((message) => (
                  <li key={message.tag} className={styles.bubble}>
                    <span className={styles.bubbleTag}>{message.tag}</span>
                    <span className={styles.bubbleText}>{message.text}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.typing}>
                <span className={styles.typingDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                {preview.typing}
              </p>
            </div>
            <p className={styles.previewNote}>{preview.note}</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="bf1-benefits-title">
        <div className={styles.container}>
          <p className={styles.sectionLabel}>{benefits.label}</p>
          <h2 id="bf1-benefits-title" className={styles.sectionTitle}>
            <Headline plain={benefits.headlinePlain} emphasis={benefits.headlineEmphasis} />
          </h2>
          <ul className={styles.cards}>
            {benefits.items.map((item, index) => (
              <Reveal as="li" key={item.n} delay={index * 110} className={styles.card}>
                <span className={styles.cardAccent} aria-hidden="true" />
                <div className={styles.cardTop}>
                  <span className={styles.cardIcon}>
                    <BenefitIcon name={item.icon} />
                  </span>
                  <span className={styles.cardNumber}>{item.n}</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id={history.id} className={`${styles.section} ${styles.historySection}`} aria-labelledby="bf1-history-title">
        <div className={styles.container}>
          <div className={styles.historyGrid}>
            <div>
              <p className={styles.sectionLabel}>{history.label}</p>
              <h2 id="bf1-history-title" className={styles.sectionTitle}>
                <Headline plain={history.headlinePlain} emphasis={history.headlineEmphasis} />
              </h2>
              {history.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className={styles.historyText}>
                  {paragraph}
                </p>
              ))}
            </div>
            <Reveal className={styles.statCard}>
              <span className={styles.statCardGlow} aria-hidden="true" />
              <p className={styles.statCardValue}>
                <LpCountUp value={history.stat.value} />
              </p>
              <p className={styles.statCardCaption}>{history.stat.caption}</p>
            </Reveal>
          </div>

          <Reveal className={styles.timeline}>
            <span className={styles.timelineTrack} aria-hidden="true">
              <span className={styles.timelineLine} />
            </span>
            <ol className={styles.timelineList}>
              {history.timeline.map((item) => (
                <li key={item.kicker} className={styles.timelineItem}>
                  <span className={styles.timelineNode} aria-hidden="true" />
                  <p className={styles.timelineKicker}>{item.kicker}</p>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineText}>{item.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="bf1-steps-title">
        <div className={styles.container}>
          <p className={styles.sectionLabel}>{steps.label}</p>
          <h2 id="bf1-steps-title" className={styles.sectionTitle}>
            <Headline plain={steps.headlinePlain} emphasis={steps.headlineEmphasis} />
          </h2>
          <ol className={styles.steps}>
            {steps.items.map((item, index) => (
              <Reveal as="li" key={item.n} delay={index * 110} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {item.n}
                </span>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepText}>{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id={final.id} className={styles.final} aria-labelledby="bf1-final-title">
        <span className={styles.finalGlow} aria-hidden="true" />
        <div className={styles.finalInner}>
          <p className={styles.finalLabel}>{final.label}</p>
          <h2 id="bf1-final-title" className={styles.finalTitle}>
            <Headline plain={final.headlinePlain} emphasis={final.headlineEmphasis} />
          </h2>
          <p className={styles.finalText}>{final.text}</p>
          <div className={styles.finalCta}>
            <Bf1CommunityCta />
          </div>
          <TrustLine />
        </div>
      </section>
    </div>
  );
}
