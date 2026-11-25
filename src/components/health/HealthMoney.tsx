"use client";

import { useEffect, useRef, useState } from "react";
import { healthReais } from "@/lib/health-content";

/**
 * Valor em reais que conta de zero até o total quando entra na tela.
 *
 * POR QUE NÃO O `LpCountUp` DA HOME: ele separa "prefixo, número, sufixo" e foi
 * feito para "R$ 495 bi" e "62,7%". Em "R$ 84.300" ele contaria até 84 e
 * deixaria ".300" parado ao lado. Aqui a entrada é o número inteiro e a
 * formatação é uma só (`healthReais`), no servidor e na animação.
 *
 * A regra é a mesma (docs/design-v4.md, regra 2): o HTML servido já traz o
 * valor FINAL. Sem JavaScript, com `prefers-reduced-motion` ou sem
 * `IntersectionObserver`, o número certo está lá; a contagem é só enfeite.
 */
export default function HealthMoney({ valor, className }: { valor: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [atual, setAtual] = useState(valor);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const semMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento || typeof IntersectionObserver === "undefined") return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const duracao = 1200;
        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / duracao);
          const e = 1 - Math.pow(1 - t, 3);
          // Arredonda na centena para o número não tremer nos últimos dígitos.
          setAtual(t < 1 ? Math.round((valor * e) / 100) * 100 : valor);
          if (t < 1) raf = requestAnimationFrame(passo);
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
  }, [valor]);

  return (
    // `tabular-nums`: os dígitos têm a mesma largura, então a linha não dança
    // enquanto o valor sobe.
    <span ref={ref} className={`tabular-nums ${className ?? ""}`.trim()}>
      {healthReais(atual)}
    </span>
  );
}
