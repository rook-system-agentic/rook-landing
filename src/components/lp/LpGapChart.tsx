/**
 * "Receita ≠ Lucro", desenhado.
 *
 * A seção afirma que faturar não é lucrar. Este gráfico mostra: a receita
 * sobe, o lucro anda de lado, e a área entre as duas é a margem que escapou
 * pelas seis etapas. O argumento se lê antes do texto explicar.
 *
 * As duas séries são ilustrativas — descrevem o formato do problema, não a
 * DRE de um cliente. Por isso não carregam eixo de valores: números aqui
 * dariam a entender que são medição.
 *
 * A entrada é uma cortina (`clip-path`), e não `stroke-dasharray`: com o eixo
 * X esticado, o tracejado é medido em pixels de tela e o traço sai com
 * buracos. Lição aprendida no gráfico de faturamento do hero.
 */

const W = 440;
const H = 210;

// Receita subindo; lucro quase parado. Mesma escala, mesmos meses.
const RECEITA = [22, 30, 27, 41, 48, 44, 58, 66, 72, 80];
const LUCRO = [16, 18, 15, 20, 19, 17, 21, 20, 18, 22];

const MAX = 92;
const pad = 14;

function pontos(serie: number[]) {
  return serie.map((v, i) => {
    const x = pad + (i / (serie.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / MAX) * (H - pad * 2);
    return { x, y };
  });
}

const pReceita = pontos(RECEITA);
const pLucro = pontos(LUCRO);
const path = (p: { x: number; y: number }[]) =>
  p.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

// A área entre as duas curvas: a margem que escapou.
const areaEntre = `${path(pReceita)} L ${pLucro[pLucro.length - 1].x.toFixed(1)} ${pLucro[
  pLucro.length - 1
].y.toFixed(1)} ${[...pLucro]
  .reverse()
  .slice(1)
  .map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
  .join(" ")} Z`;

export default function LpGapChart({ className = "" }: { className?: string }) {
  return (
    <figure className={`m-0 ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="lp-gap h-auto w-full"
        role="img"
        aria-label="Gráfico ilustrativo: a receita sobe ao longo do tempo enquanto o lucro permanece quase parado; a área entre as duas curvas é a margem que se perde nas etapas"
      >
        <path d={areaEntre} fill="#e54c00" opacity="0.10" />

        <path
          d={path(pReceita)}
          fill="none"
          stroke="#e54c00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path(pLucro)}
          fill="none"
          stroke="var(--lp-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 5"
        />

        <circle cx={pReceita[pReceita.length - 1].x} cy={pReceita[pReceita.length - 1].y} r="4" fill="#e54c00" />
        <circle
          cx={pLucro[pLucro.length - 1].x}
          cy={pLucro[pLucro.length - 1].y}
          r="4"
          fill="var(--lp-surface)"
          stroke="var(--lp-muted)"
          strokeWidth="2"
        />

        <text
          x={pReceita[pReceita.length - 1].x - 8}
          y={pReceita[pReceita.length - 1].y - 12}
          textAnchor="end"
          fill="#e54c00"
          style={{ font: "600 12px var(--font-mono, monospace)", letterSpacing: "0.1em" }}
        >
          RECEITA
        </text>
        <text
          x={pLucro[pLucro.length - 1].x - 8}
          y={pLucro[pLucro.length - 1].y + 20}
          textAnchor="end"
          fill="var(--lp-muted)"
          style={{ font: "600 12px var(--font-mono, monospace)", letterSpacing: "0.1em" }}
        >
          LUCRO
        </text>
      </svg>

      <figcaption className="lp-label mt-3">
        — A distância entre as duas é onde o Rook trabalha
      </figcaption>
    </figure>
  );
}
