/**
 * Diagrama de convergência: muitas fontes entram, um lugar sai.
 *
 * É a tese da página desenhada. O dono do restaurante tem dado espalhado em
 * PDV, ERP, delivery, maquininha, SEFAZ, banco e planilha — o problema nunca
 * foi falta de dado, foi o dado não se juntar em lugar nenhum. À direita, o
 * gestor acessa tudo por uma porta só.
 *
 * As sete origens não são ilustrativas: cada uma existe no produto. Open
 * Finance entra pela Pluggy (`lib/pluggy/`, sete rotas e um cron de sync) e
 * planilhas pela importação de extrato, folha e central de dados.
 *
 * Técnica: `stroke-dasharray` + `stroke-dashoffset` animados por CSS. Sem
 * SMIL, sem biblioteca, sem JavaScript por frame.
 *
 * Estado de repouso: as linhas estão inteiras e visíveis. A animação faz um
 * pulso percorrer o caminho — nunca esconde o traço. Parado, o diagrama
 * continua comunicando.
 */

const ORIGENS = ["PDV", "ERP", "Delivery", "Maquininha", "SEFAZ", "Open Finance", "Planilhas"];

/*
 * Geometria. O núcleo alinha com a origem do meio (índice 3 de 7).
 *
 * A composição é apertada na horizontal de propósito: o SVG escala pela
 * largura da coluna, então cada unidade a menos no viewBox é tipo maior na
 * tela. Com sete origens espremidas numa meia coluna, os rótulos de 11px
 * caíam para menos de 10px efetivos e paravam de ser legíveis.
 */
const ORIGEM_X = 108;
const PRIMEIRO_Y = 25;
const ESPACO_Y = 48;
const NUCLEO_X = 330;
// 516, e não 500: com o conector mais curto o rótulo "ACESSO ÚNICO" encostava
// na borda da caixa do gestor.
const CLIENTE_X = 516;
const EIXO_Y = PRIMEIRO_Y + 3 * ESPACO_Y; // 169

export default function LpPartnersDiagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 590 350"
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label="Diagrama: dados de PDV, ERP, delivery, maquininha, SEFAZ, Open Finance e planilhas convergindo para o Rook, e o gestor acessando tudo por um lugar só"
    >
      {ORIGENS.map((label, i) => {
        const y = PRIMEIRO_Y + i * ESPACO_Y;
        // Curva em S: sai reto da origem, curva no meio, chega reto no núcleo.
        const d = `M ${ORIGEM_X} ${y} C ${ORIGEM_X + 110} ${y}, ${NUCLEO_X - 110} ${EIXO_Y}, ${NUCLEO_X - 34} ${EIXO_Y}`;
        return (
          <g key={label}>
            <path d={d} fill="none" stroke="var(--lp-line)" strokeWidth="1.5" strokeLinecap="round" />
            <path
              className="lp-diagram-pulse"
              style={{ animationDelay: `${i * 420}ms` }}
              d={d}
              fill="none"
              stroke="#e54c00"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx={ORIGEM_X}
              cy={y}
              r="4.5"
              fill="var(--lp-surface)"
              stroke="var(--lp-line)"
              strokeWidth="1.5"
            />
            <text
              x={ORIGEM_X - 12}
              y={y + 4}
              textAnchor="end"
              fill="var(--lp-muted)"
              style={{ font: "500 11px var(--font-mono, monospace)", letterSpacing: "0.08em" }}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Núcleo → cliente: a porta única. */}
      <path
        d={`M ${NUCLEO_X + 34} ${EIXO_Y} L ${CLIENTE_X - 50} ${EIXO_Y}`}
        fill="none"
        stroke="var(--lp-line)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="lp-diagram-pulse"
        style={{ animationDelay: "2100ms" }}
        d={`M ${NUCLEO_X + 34} ${EIXO_Y} L ${CLIENTE_X - 50} ${EIXO_Y}`}
        fill="none"
        stroke="#e54c00"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x={(NUCLEO_X + 34 + CLIENTE_X - 50) / 2}
        y={EIXO_Y - 12}
        textAnchor="middle"
        fill="var(--lp-muted)"
        style={{ font: "500 9px var(--font-mono, monospace)", letterSpacing: "0.14em" }}
      >
        ACESSO ÚNICO
      </text>

      {/* Núcleo: o Rook. Losango, que é a forma da marca. */}
      <g className="lp-diagram-core">
        <rect
          x={NUCLEO_X - 26}
          y={EIXO_Y - 26}
          width="52"
          height="52"
          rx="12"
          transform={`rotate(45 ${NUCLEO_X} ${EIXO_Y})`}
          fill="#e54c00"
        />
        <text
          x={NUCLEO_X}
          y={EIXO_Y + 5}
          textAnchor="middle"
          fill="#ffffff"
          style={{ font: "700 15px var(--font-display, system-ui)", letterSpacing: "-0.02em" }}
        >
          Rook
        </text>
      </g>
      <text
        x={NUCLEO_X}
        y={EIXO_Y + 58}
        textAnchor="middle"
        fill="var(--lp-muted)"
        style={{ font: "500 10px var(--font-mono, monospace)", letterSpacing: "0.14em" }}
      >
        UM RESULTADO
      </text>

      {/* Cliente: o gestor, acessando por uma porta só. */}
      <g>
        <rect
          x={CLIENTE_X - 50}
          y={EIXO_Y - 36}
          width="100"
          height="72"
          rx="16"
          fill="var(--lp-surface)"
          stroke="var(--lp-line)"
          strokeWidth="1.5"
        />
        <g fill="none" stroke="var(--lp-ink)" strokeWidth="2" strokeLinecap="round">
          <circle cx={CLIENTE_X} cy={EIXO_Y - 12} r="8" />
          <path d={`M ${CLIENTE_X - 15} ${EIXO_Y + 12} a 15 13 0 0 1 30 0`} />
        </g>
        <text
          x={CLIENTE_X}
          y={EIXO_Y + 58}
          textAnchor="middle"
          fill="var(--lp-muted)"
          style={{ font: "500 10px var(--font-mono, monospace)", letterSpacing: "0.14em" }}
        >
          O GESTOR
        </text>
      </g>
    </svg>
  );
}
