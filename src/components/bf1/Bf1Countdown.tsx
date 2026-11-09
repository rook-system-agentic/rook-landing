"use client";

import { useEffect, useState } from "react";
import { countdownParts, type CountdownParts } from "@/lib/bf1-community.mjs";
import { BF1_CONTENT } from "@/lib/bf1-content";
import styles from "./bf1.module.css";

/*
 * Contagem até a Black Friday (ROO-1825).
 *
 * A DATA é a informação e vai no HTML. Os números são o movimento: a página é
 * estática, então qualquer contagem renderizada no build estaria velha quando
 * o visitante chegasse. Por isso eles só aparecem depois de montar — e o
 * espaço fica reservado, para o hero não pular.
 *
 * Depois de 27/11 a grade some e fica só a data.
 */
const UNIDADES = ["days", "hours", "minutes", "seconds"] as const;

const doisDigitos = (n: number) => String(n).padStart(2, "0");

export default function Bf1Countdown() {
  const [parts, setParts] = useState<CountdownParts | null>(null);
  const { dateLabel, countdownLabels, countdownAria } = BF1_CONTENT.hero;

  useEffect(() => {
    const tick = () => setParts(countdownParts(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const pronto = parts !== null && !parts.done;

  return (
    <div className={styles.countdown}>
      <p className={styles.countdownDate}>
        <span className={styles.liveDot} aria-hidden="true" />
        {dateLabel}
      </p>
      {parts?.done ? null : (
        <div
          role="timer"
          aria-label={countdownAria}
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
