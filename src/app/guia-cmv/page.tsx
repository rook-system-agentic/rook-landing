import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
import { CMV_GUIDE_CONTENT } from "@/lib/cmv-guide-content";
import CmvGuideForm from "@/components/cmv-guide/CmvGuideForm";
import styles from "@/components/cmv-guide/cmv-guide.module.css";

export const metadata: Metadata = {
  title: "Guia prático de CMV para restaurantes | Rook System",
  description:
    "Entenda a fórmula do CMV e receba por e-mail o guia prático e a planilha de apoio da Rook.",
  alternates: { canonical: siteUrl("/guia-cmv/") },
};

type IconName = (typeof CMV_GUIDE_CONTENT.principles.items)[number]["icon"];

// Ícones de traço simples, no mesmo peso visual dos marcadores da página.
function PrincipleIcon({ name }: { name: IconName }) {
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
  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4M8.5 14.5l2 2 4-4" />
      </svg>
    );
  }
  if (name === "formula") {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 7.5h8M8 12h2M14 12h2M8 16.5h2M14 16.5h2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 19.5h16M6.5 16V11M11 16V7M15.5 16v-4M19 5l-4 4-3-2-5 4" />
    </svg>
  );
}

const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

export default function CmvGuidePage() {
  const { hero, introduction, principles } = CMV_GUIDE_CONTENT;
  const { visual } = hero;
  const { formula, impact } = introduction;
  const { gauge } = formula;
  const maxBar = Math.max(...visual.bars.map((bar) => bar.amount));
  const onScale = (value: number) => `${(value / gauge.scaleMax) * 100}%`;

  return (
    <div className={styles.page} data-cmv-guide>
      <section className={styles.hero} aria-labelledby="cmv-guide-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{hero.eyebrow}</p>
            <h1 className={styles.title} id="cmv-guide-title">
              {hero.title.before}
              <em>{hero.title.highlight}</em>
            </h1>
            <p className={styles.lead}>{hero.lead}</p>
            <div className={styles.heroActions}>
              <a className={`${styles.submit} ${styles.heroCta}`} href="#cmv-guide-form">
                <span>{hero.cta}</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a className={styles.heroSecondary} href="#cmv-guide-intro-title">
                {hero.secondary} <span aria-hidden="true">↓</span>
              </a>
            </div>
            <ul className={styles.heroChips} aria-label="O que você recebe">
              {hero.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>

          <figure className={styles.heroVisual} aria-labelledby="cmv-guide-visual-label">
            <div className={styles.calc}>
              <div className={styles.calcHead}>
                <span id="cmv-guide-visual-label">{visual.label}</span>
                <span className={styles.calcTag}>{visual.tag}</span>
              </div>

              <div className={styles.calcBars}>
                {visual.bars.map((bar, index) => (
                  <div className={styles.calcBar} key={bar.label}>
                    <div className={styles.calcBarTrack}>
                      <span
                        className={styles.calcBarFill}
                        data-current={index === visual.bars.length - 1 ? "" : undefined}
                        style={cssVar("--bar", `${(bar.amount / maxBar) * 100}%`)}
                      />
                    </div>
                    <strong>{bar.value}</strong>
                    <span>{bar.label}</span>
                  </div>
                ))}
                <span className={styles.calcDelta}>{visual.delta}</span>
              </div>

              <dl className={styles.calcRows}>
                {visual.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className={styles.calcTotal}>
                <span>{visual.total.label}</span>
                <strong>{visual.total.value}</strong>
              </div>
              <p className={styles.calcNote}>{visual.note}</p>
            </div>

            <div className={`${styles.floatChip} ${styles.floatCmv}`}>
              <span>{visual.cmvChip.label}</span>
              <strong>{visual.cmvChip.value}</strong>
              <em>{visual.cmvChip.detail}</em>
            </div>
            <div className={`${styles.floatChip} ${styles.floatBudget}`}>
              <span>{visual.budgetChip.label}</span>
              <strong>{visual.budgetChip.value}</strong>
            </div>

            <figcaption className={styles.heroCaption}>{visual.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="cmv-guide-intro-title">
        <div className={styles.contentGrid}>
          <div>
            <p className={styles.sectionEyebrow}>{introduction.eyebrow}</p>
            <h2 className={styles.sectionHeading} id="cmv-guide-intro-title">
              {introduction.title.before}
              <em>{introduction.title.highlight}</em>
            </h2>
          </div>
          <p className={styles.introLead}>{introduction.lead}</p>
        </div>

        <div className={styles.board}>
          <div className={styles.formulaBoard}>
            <p className={styles.boardLabel}>{formula.label}</p>
            <ol className={styles.formula}>
              {formula.terms.map((term, index) => (
                <li
                  className={index === formula.terms.length - 1 ? styles.formulaResult : undefined}
                  key={term.label}
                >
                  {term.op ? (
                    <span className={styles.formulaOp} aria-hidden="true">
                      {term.op}
                    </span>
                  ) : null}
                  <span className={styles.formulaLabel}>{term.label}</span>
                  <strong className={styles.formulaValue}>{term.value}</strong>
                </li>
              ))}
            </ol>

            <div className={styles.gauge}>
              <div
                className={styles.gaugeTrack}
                role="img"
                aria-label={`${gauge.realLabel}. ${gauge.metaLabel}.`}
              >
                <span className={styles.gaugeFill} style={cssVar("--fill", onScale(gauge.real))} />
                <span className={styles.gaugeMeta} style={cssVar("--meta", onScale(gauge.meta))}>
                  <span>{gauge.metaLabel}</span>
                </span>
              </div>
              <div className={styles.gaugeLegend}>
                <strong>{gauge.realLabel}</strong>
                <span>{gauge.base}</span>
              </div>
            </div>
          </div>

          <div className={styles.impact}>
            <p className={styles.boardLabel}>{impact.label}</p>
            <ul className={styles.impactList}>
              {impact.items.map((item) => (
                <li key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <p className={styles.impactNote}>{impact.note}</p>
          </div>
        </div>

        <div className={styles.mistakes}>
          <p className={styles.mistakesTitle} id="cmv-guide-mistakes-title">
            {principles.title}
          </p>
          <ul className={styles.principles} aria-labelledby="cmv-guide-mistakes-title">
            {principles.items.map((item) => (
              <li className={styles.principle} key={item.number}>
                <div className={styles.principleTop}>
                  <span className={styles.principleIcon}>
                    <PrincipleIcon name={item.icon} />
                  </span>
                  <span className={styles.principleNumber}>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p className={styles.mistake}>
                  <span className={styles.tag}>Erro comum</span>
                  {item.mistake}
                </p>
                <p className={styles.fix}>
                  <span className={styles.tag}>No guia</span>
                  {item.fix}
                </p>
              </li>
            ))}
          </ul>
          <a className={styles.sectionCta} href="#cmv-guide-form">
            {principles.cta} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <CmvGuideForm />
    </div>
  );
}
