"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

interface RevealProps {
  children: ReactNode;
  /** Atraso da entrada, em ms. Use para escalonar irmãos. */
  delay?: number;
  className?: string;
  /**
   * Elemento a renderizar. `div` na maioria dos casos, `li` quando o Reveal é
   * filho direto de `<ol>`/`<ul>`.
   *
   * Existe porque o wrapper não é neutro onde a lista é: um `<div>` entre o
   * `<ol>` e o `<li>` quebra a lista para leitor de tela — os itens deixam de
   * ser anunciados como "item 1 de 6" e o `<ol>` fica sem filhos válidos.
   */
  as?: "div" | "li";
}

/**
 * Revela o conteúdo quando ele entra na tela.
 *
 * O elemento nasce VISÍVEL e no lugar; a classe `lp-in` só é adicionada no
 * momento da interseção, e é ela que dispara a animação. Sem JavaScript, com
 * o observador indisponível, ou com `prefers-reduced-motion`, a página aparece
 * inteira e normal.
 *
 * Isso é deliberado: numa página de conversão, conteúdo que depende de um
 * gatilho para existir é conteúdo que às vezes não existe.
 */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement & HTMLLIElement>}
      className={`${seen ? "lp-in" : ""} ${className}`.trim()}
      style={seen && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
