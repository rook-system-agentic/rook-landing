/**
 * As peças de interface que aparecem dentro dos módulos do hero.
 *
 * São SVG e divs estáticos de propósito: nenhuma depende de JavaScript para
 * existir na tela, então a página serve renderizada e o buscador vê o mesmo
 * que o visitante.
 *
 * ⚠️ NÚMEROS: são plausíveis para um restaurante de porte médio e internamente
 * consistentes (o DRE fecha: 412.800 − 141.178 − 207.226 = 64.396), mas NÃO são
 * dados de cliente. Precisam do aval de quem conhece a operação antes de a
 * página ir ao ar — um mini-dashboard com números que um dono de restaurante
 * não reconhece derruba credibilidade em vez de construir.
 */

const TERRACOTA = "#e54c00";

/** Faturamento diário das últimas duas semanas, em milhares de reais. */
const DAILY_REVENUE = [8.2, 9.6, 11.4, 10.1, 13.8, 16.2, 14.9, 8.9, 10.4, 12.1, 11.6, 15.3, 17.1, 15.8];

export function Sparkline() {
  const w = 260;
  const h = 64;
  const max = Math.max(...DAILY_REVENUE);
  const min = Math.min(...DAILY_REVENUE);
  const pts = DAILY_REVENUE.map((v, i) => {
    const x = (i / (DAILY_REVENUE.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-lg font-semibold" style={{ color: "var(--lp-ink)" }}>
          R$ 15,8 mil
        </span>
        <span className="font-mono text-[11px]" style={{ color: "var(--lp-accent)" }}>
          ▲ 6,1% vs. semana anterior
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-16 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Faturamento diário das últimas duas semanas, em tendência de alta"
      >
        <polyline
          points={`0,${h} ${pts.join(" ")} ${w},${h}`}
          fill={TERRACOTA}
          opacity="0.08"
          stroke="none"
        />
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={TERRACOTA}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p
        className="mt-1 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        Faturamento diário · 14 dias
      </p>
    </div>
  );
}

/** CMV real cruzando a linha de meta — o gráfico que define o produto. */
export function CmvBar() {
  const real = 34.2;
  const meta = 32.0;
  const scaleMax = 45;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-lg font-semibold" style={{ color: TERRACOTA }}>
          34,2%
        </span>
        <span className="font-mono text-[11px]" style={{ color: "var(--lp-muted)" }}>
          meta 32,0%
        </span>
      </div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--lp-elevated)" }}
        role="img"
        aria-label="CMV real de 34,2% contra meta de 32%"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${(real / scaleMax) * 100}%`, backgroundColor: TERRACOTA }}
        />
        <div
          className="absolute inset-y-[-4px] w-[2px]"
          style={{ left: `${(meta / scaleMax) * 100}%`, backgroundColor: "var(--lp-ink)" }}
        />
      </div>
      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        2,2 p.p. acima da meta no período
      </p>
    </div>
  );
}

const EXPENSE_ROWS = [
  { label: "Vendas", pct: 12.4 },
  { label: "Pessoal", pct: 28.1 },
  { label: "Administrativas", pct: 9.7 },
];

export function ExpenseBars() {
  const scaleMax = 35;
  return (
    <div
      className="space-y-2.5"
      role="img"
      aria-label="Despesas por grupo, como percentual da receita"
    >
      {EXPENSE_ROWS.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[11px]" style={{ color: "var(--lp-muted)" }}>
              {r.label}
            </span>
            <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--lp-ink)" }}>
              {r.pct.toString().replace(".", ",")}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "var(--lp-elevated)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.pct / scaleMax) * 100}%`, backgroundColor: "var(--lp-accent)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const DRE_ROWS = [
  { label: "Receita", value: "412.800", sign: "" },
  { label: "CMV", value: "141.178", sign: "−" },
  { label: "Despesas", value: "207.226", sign: "−" },
];

export function DreLines() {
  return (
    <div className="font-mono text-[12px]" role="img" aria-label="DRE gerencial do período">
      {DRE_ROWS.map((r) => (
        <div
          key={r.label}
          className="flex items-baseline justify-between py-1"
          style={{ color: "var(--lp-muted)" }}
        >
          <span>
            {r.sign && <span className="mr-1">{r.sign}</span>}
            {r.label}
          </span>
          <span>{r.value}</span>
        </div>
      ))}
      <div
        className="mt-1 flex items-baseline justify-between pt-2"
        style={{ borderTop: "1px solid var(--lp-line)" }}
      >
        <span className="font-semibold" style={{ color: "var(--lp-ink)" }}>
          = Resultado
        </span>
        <span className="font-semibold" style={{ color: "var(--lp-accent)" }}>
          64.396
        </span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--lp-muted)" }}>
        margem 15,6% no mês
      </p>
    </div>
  );
}

export const MODULE_VISUALS = [Sparkline, CmvBar, ExpenseBars, DreLines];
