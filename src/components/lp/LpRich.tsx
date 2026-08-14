import type { Paragraph } from "@/lib/lp-content";

/**
 * Renderiza um parágrafo segmentado, aplicando a ênfase aos trechos marcados.
 * Existe para que nenhuma seção precise reparsear texto para decidir onde vai
 * o destaque.
 */
export default function Rich({ paragraph }: { paragraph: Paragraph }) {
  return (
    <>
      {paragraph.map((seg, i) =>
        seg.strong ? (
          <strong key={i} className="lp-strong">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
