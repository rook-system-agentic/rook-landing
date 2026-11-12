"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { campaignCountdown, type CampaignPhase, type CountdownParts } from "@/lib/bf1-community.mjs";
import { BF1_CONTENT } from "@/lib/bf1-content";
import styles from "./bf1.module.css";

/*
 * Contagem até o acesso antecipado e, durante a campanha, até o encerramento.
 *
 * A DATA é a informação e vai no HTML. Os números são o movimento: a página é
 * pode ficar aberta por dias. Por isso eles só aparecem depois de montar — e o
 * espaço fica reservado, para o hero não pular.
 *
 * Ao mudar de fase, uma atualização do servidor troca a oferta e os CTAs sem
 * carregar preço futuro no bundle nem deixar uma promoção expirada na tela.
 */
const UNIDADES = ["days", "hours", "minutes", "seconds"] as const;

const doisDigitos = (n: number) => String(n).padStart(2, "0");

export default function Bf1Countdown({ initialPhase }: { initialPhase: CampaignPhase }) {
  const [parts, setParts] = useState<(CountdownParts & { phase: CampaignPhase }) | null>(null);
  const router = useRouter();
  const lastPhase = useRef(initialPhase);
  const { dateLabel, dateSecondary, doneLabel, countdownLabels, countdownAria, endLabel, endedLabel } = BF1_CONTENT.hero;

  useEffect(() => {
    const tick = () => {
      const current = campaignCountdown(Date.now());
      setParts(current);
      if (lastPhase.current !== current.phase) {
        lastPhase.current = current.phase;
        router.refresh();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [router]);

  const pronto = parts !== null && !parts.done;
  const phase = parts?.phase ?? initialPhase;
  const ended = phase === "ended";
  const label = phase === "upcoming" ? dateLabel : phase === "early" ? doneLabel : ended ? endedLabel : endLabel;

  return (
    <div className={styles.countdown}>
      <p className={styles.countdownDate}>
        <span className={styles.liveDot} aria-hidden="true" />
        {label}
      </p>
      <p className={styles.countdownSecondary}>{phase === "upcoming" || phase === "early" ? dateSecondary : "Horário de Brasília · A comunidade continua depois da Black Friday"}</p>
      {ended ? null : (
        <div
          role="timer"
          aria-label={phase === "upcoming" ? countdownAria : "Tempo até o encerramento da Black Rook"}
          aria-hidden={pronto ? undefined : true}
          className={`${styles.countdownGrid} ${pronto ? "" : styles.countdownIdle}`.trim()}
        >
          {UNIDADES.map((unidade) => {
            const valor = parts && !parts.done ? doisDigitos(parts[unidade]) : "00";
            return (
              <div key={unidade} className={styles.countUnit}>
                <span className={styles.countWindow}>
                  <span key={valor} className={styles.countValue}>
                    {valor}
                  </span>
                </span>
                <span className={styles.countLabel}>{countdownLabels[unidade]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
