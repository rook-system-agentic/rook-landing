import Link from "next/link";
import { HERO, HERO_PARAGRAPH, HERO_MESSAGE, BRIEFING } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";
import { WhatsMessage, WhatsPanel } from "./LpWhatsMessage";

/**
 * Hero da home (v6): a pergunta que o dono se faz à esquerda, o informe das 7h
 * no WhatsApp à direita.
 *
 * Duas trocas em relação à v5, ambas explicadas no cabeçalho de `lp-content`:
 *
 *   A MANCHETE deixou de ser "Faturar não é lucrar." — que continua na página,
 *   como assinatura acima do título — e passou a ser a pergunta do visitante.
 *   A frase de marca é excelente e não pedia nada; a pergunta pede.
 *
 *   O ARTEFATO deixou de ser o "Tabuleiro · Casa exemplo". Aquele card é uma
 *   DRE, e a DRE é justamente a planilha de que este público foge — ele desceu
 *   para o método (LpMethod), onde o passo "Enxerga" dá contexto para lê-la.
 *   No lugar entrou a mensagem de WhatsApp: o mesmo produto, no artefato que o
 *   dono já sabe ler.
 *
 * A microcopy sob os botões (2 minutos · sem cartão · na hora) fica na mesma
 * linha de visão do clique: é ali que o risco é avaliado, não no rodapé.
 */
export default function LpHero() {
  return (
    <section className="lp-band pt-14 pb-16 lg:pt-20 lg:pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="lp-label mb-4">{HERO.label}</p>
          <h1
            className="mb-5 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2.6rem, 5.6vw, 4.8rem)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            {HERO.headlinePlain}
            <span style={{ color: "#e54c00" }}>{HERO.headlineEmphasis}</span>
            {HERO.headlineTail}
          </h1>
          <p className="lp-body mb-8">
            <Rich paragraph={HERO_PARAGRAPH} />
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={HERO.primaryHref} className="btn-primary">
              {HERO.primaryLabel}
            </Link>
            <Link href={HERO.secondaryHref} className="btn-ghost">
              {HERO.secondaryLabel}
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider" style={{ color: "var(--lp-muted)" }}>
            {HERO.micro}
          </p>
        </div>

        <Reveal className="lg:col-span-6">
          <WhatsPanel contactName={BRIEFING.contactName} contactTag={BRIEFING.contactTag}>
            <WhatsMessage message={HERO_MESSAGE} remetente={BRIEFING.contactName} />
          </WhatsPanel>
        </Reveal>
      </div>
    </section>
  );
}
