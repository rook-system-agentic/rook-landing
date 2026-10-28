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

export default function CmvGuidePage() {
  return (
    <div className={styles.page} data-cmv-guide>
      <section className={styles.hero} aria-labelledby="cmv-guide-title">
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>{CMV_GUIDE_CONTENT.hero.eyebrow}</p>
            <h1 className={styles.title} id="cmv-guide-title">
              {CMV_GUIDE_CONTENT.hero.title}
            </h1>
          </div>
          <div>
            <p className={styles.lead}>{CMV_GUIDE_CONTENT.hero.lead}</p>
            <a className={styles.submit} href="#cmv-guide-form">
              <span>Quero receber o guia e a planilha</span>
              <span aria-hidden="true">↗</span>
            </a>
            <p className={styles.heroNote}>
              <strong>ROOK</strong>
              <span>Um material direto para transformar estoque, compras e venda em uma leitura que apoia a próxima decisão.</span>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="cmv-guide-intro-title">
        <div className={styles.contentGrid}>
          <div>
            <p className={styles.sectionEyebrow}>{CMV_GUIDE_CONTENT.introduction.eyebrow}</p>
            <h2 className={styles.sectionHeading} id="cmv-guide-intro-title">
              {CMV_GUIDE_CONTENT.introduction.title}
            </h2>
          </div>
          <div className={styles.copy}>
            {CMV_GUIDE_CONTENT.introduction.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <ul className={styles.principles} aria-label="Princípios para começar a ler o CMV">
          {CMV_GUIDE_CONTENT.principles.map((principle) => (
            <li className={styles.principle} key={principle.number}>
              <span className={styles.principleNumber}>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <CmvGuideForm />
    </div>
  );
}
