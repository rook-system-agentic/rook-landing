/**
 * Diagrama de convergência: os sistemas de fora alimentam um lugar só.
 *
 * É a tese da página desenhada. A página argumenta que o dono do restaurante
 * tem dado espalhado em PDV, ERP, delivery e maquininha, e que o problema não
 * é falta de dado — é o dado não se juntar em lugar nenhum. O diagrama mostra
 * exatamente isso antes de o texto explicar.
 *
 * Técnica: `stroke-dasharray` + `stroke-dashoffset` animados por CSS. Sem SMIL
 * (descontinuado no Chrome por anos e ainda irregular), sem biblioteca, sem
 * JavaScript por frame.
 *
 * Estado de repouso: as linhas estão inteiras e visíveis. A animação faz um
 * pulso percorrer o caminho — ela nunca esconde o traço. Sem movimento, o
 * diagrama continua legível e continua comunicando.
 */
export default function LpPartnersDiagram({ className = "" }: { className?: string }) {
  // Quatro origens à esquerda, convergindo no núcleo à direita.
  const origens = [
    { y: 26, label: "PDV" },
    { y: 78, label: "ERP" },
    { y: 130, label: "Delivery" },
    { y: 182, label: "Maquininha" },
  ];
  // O viewBox reserva 114px à esquerda porque o rótulo é ancorado pela direita:
  // com menos que isso, "Maquininha" sai do quadro e o navegador corta sem avisar.
  const origemX = 114;
  const alvoX = 380;
  const alvoY = 104;

  return (
    <svg
      viewBox="0 0 462 208"
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label="Diagrama: dados de PDV, ERP, delivery e maquininha convergindo para o Rook"
    >
      {origens.map((o, i) => {
        // Curva em S: sai reto da origem, curva no meio, chega reto no núcleo.
        const d = `M ${origemX} ${o.y} C ${origemX + 110} ${o.y}, ${alvoX - 110} ${alvoY}, ${alvoX - 34} ${alvoY}`;
        return (
          <g key={o.label}>
            <path
              d={d}
              fill="none"
              stroke="var(--lp-line)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* O pulso que percorre. Só existe quando há movimento permitido. */}
            <path
              className="lp-diagram-pulse"
              style={{ animationDelay: `${i * 700}ms` }}
              d={d}
              fill="none"
              stroke="#e54c00"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={origemX} cy={o.y} r="4.5" fill="var(--lp-surface)" stroke="var(--lp-line)" strokeWidth="1.5" />
            <text
              x={origemX - 12}
              y={o.y + 4}
              textAnchor="end"
              fill="var(--lp-muted)"
              style={{ font: "500 11px var(--font-mono, monospace)", letterSpacing: "0.08em" }}
            >
              {o.label}
            </text>
          </g>
        );
      })}

      {/* Núcleo: o Rook. Losango, que é a forma da marca. */}
      <g className="lp-diagram-core">
        <rect
          x={alvoX - 26}
          y={alvoY - 26}
          width="52"
          height="52"
          rx="12"
          transform={`rotate(45 ${alvoX} ${alvoY})`}
          fill="#e54c00"
        />
        <text
          x={alvoX}
          y={alvoY + 5}
          textAnchor="middle"
          fill="#ffffff"
          style={{ font: "700 15px var(--font-display, system-ui)", letterSpacing: "-0.02em" }}
        >
          Rook
        </text>
      </g>

      <text
        x={alvoX}
        y={alvoY + 56}
        textAnchor="middle"
        fill="var(--lp-muted)"
        style={{ font: "500 10px var(--font-mono, monospace)", letterSpacing: "0.14em" }}
      >
        UM RESULTADO
      </text>
    </svg>
  );
}
