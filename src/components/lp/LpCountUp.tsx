"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Separa "R$ 495 bi" em prefixo, número e sufixo, preservando a vírgula
 * decimal do português. Se não houver número reconhecível, devolve `null` e o
 * componente simplesmente não anima.
 */
function parse(value: string) {
  const m = value.match(/^(\D*?)(\d+(?:,\d+)?)([\s\S]*)$/);
  if (!m) return null;
  const [, prefixo, numero, sufixo] = m;
  const casas = numero.includes(",") ? numero.split(",")[1].length : 0;
  return { prefixo, alvo: Number(numero.replace(",", ".")), sufixo, casas };
}

interface CountUpProps {
  /** O valor final, já formatado — ex.: "R$ 495 bi", "62,7%". */
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Conta de zero até o valor quando o número entra na tela.
 *
 * O ponto crítico é o estado inicial: o HTML servido já contém o valor FINAL,
 * correto e por extenso. O JavaScript só assume depois de montar. Portanto:
 *
 * - sem JavaScript → o número certo está lá
 * - com `prefers-reduced-motion` → o número certo está lá, sem contagem
 * - se o IntersectionObserver não existir → o número certo está lá
 * - se o componente quebrar → o HTML servido continua correto
 *
 * Nenhum desses caminhos exibe número errado ou espaço vazio. Numa página que
 * argumenta com estatística de mercado, um número pela metade é pior que
 * nenhuma animação.
 */
export default function LpCountUp({ value, className, style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const semMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento || typeof IntersectionObserver === "undefined") return;

    const partes = parse(value);
    if (!partes) return;

    const { prefixo, alvo, sufixo, casas } = partes;
    let raf = 0;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        const duracao = 1100;
        const inicio = performance.now();

        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / duracao);
          // easeOutCubic: rápido no começo, assentando no fim.
          const e = 1 - Math.pow(1 - t, 3);
          const atual = (alvo * e).toLocaleString("pt-BR", {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas,
          });
          setDisplay(`${prefixo}${atual}${sufixo}`);
          if (t < 1) raf = requestAnimationFrame(passo);
          // No fim, volta à string original — evita qualquer divergência de
          // formatação entre o que a animação produz e o valor autoral.
          else setDisplay(value);
        };

        raf = requestAnimationFrame(passo);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
