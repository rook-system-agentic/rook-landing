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
      <defs>
        <filter id="lp-sombra-nucleo" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000000" floodOpacity="0.16" />
        </filter>
      </defs>

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

      {/*
        Núcleo: a marca de verdade, não mais um losango desenhado.

        Duas artes, uma por tema — a colorida some no escuro e a branca some no
        claro, então não há versão única que sirva. A troca é por CSS
        (`lp-marca-clara` / `lp-marca-escura`), e não por JavaScript, para não
        haver instante em que a marca errada apareça.

        A placa circular por baixo é o que garante contraste: o ícone fica
        sempre sobre a superfície do tema, com sombra suave separando-o do
        fundo da seção.
      */}
      <g className="lp-diagram-core">
        <circle
          cx={NUCLEO_X}
          cy={EIXO_Y}
          r="40"
          fill="var(--lp-surface)"
          stroke="var(--lp-line)"
          strokeWidth="1.5"
          filter="url(#lp-sombra-nucleo)"
        />
        {/*
          ROO-1124: as duas artes são .webp de 192px. `<image>` dentro de SVG
          baixa as DUAS sempre — o `display:none` do tema esconde uma, não
          impede o download. Em PNG isso custava 58 KB por visita para desenhar
          um ícone de ~33px na tela do celular; em WebP custa 6,7 KB.
        */}
        <image
          className="lp-marca-clara"
          href="/brand/rook-icon.webp"
          x={NUCLEO_X - 29}
          y={EIXO_Y - 30}
          width="58"
          height="60"
        />
        <image
          className="lp-marca-escura"
          href="/brand/rook-icon-branco.webp"
          x={NUCLEO_X - 29}
          y={EIXO_Y - 30}
          width="58"
          height="60"
        />
      </g>

      {/* "Rook" acima, e não no meio: o centro do ícone é escuro e engoliria o
          texto no tema claro. */}
      <text
        x={NUCLEO_X}
        y={EIXO_Y - 52}
        textAnchor="middle"
        fill="var(--lp-ink)"
        style={{ font: "700 17px var(--font-display, system-ui)", letterSpacing: "-0.02em" }}
      >
        Rook
      </text>
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
