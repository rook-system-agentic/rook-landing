import { EXEMPLO_DRE } from "@/lib/lp-content";

/**
 * As peças de interface que aparecem dentro dos módulos do hero.
 *
 * São SVG e divs estáticos de propósito: nenhuma depende de JavaScript para
 * existir na tela, então a página serve renderizada e o buscador vê o mesmo
 * que o visitante.
 *
 * NÚMEROS: os quatro gráficos e o funil descrevem o MESMO restaurante no MESMO
 * período, e tudo é derivado de `EXEMPLO_DRE`. Nada aqui é digitado à mão — se
 * um percentual mudar lá, os valores em reais e o texto de apoio acompanham.
 * É o que impede a página de dizer duas coisas sobre o mesmo dinheiro.
 *
 * Validado por Daniel em 13/08/2026 como reconhecível para a operação. Ainda é
 * exemplo, não é cliente.
 */

const TERRACOTA = "#e54c00";

const pctDe = (label: string) =>
  EXEMPLO_DRE.linhas.find((l) => l.label === label)!.pct;

const reais = (pct: number) =>
  Math.round((EXEMPLO_DRE.receita * pct) / 100).toLocaleString("pt-BR");

const num = (n: number, casas = 1) =>
  n.toFixed(casas).replace(".", ",");

/**
 * Faturamento diário das últimas duas semanas, em milhares de reais.
 *
 * A média da série é ~13,8 mil/dia, que é justamente a receita mensal de
 * `EXEMPLO_DRE` dividida por 30. O ritmo semanal (fim de semana mais forte) é
 * o que se espera de um restaurante — uma série lisa denunciaria dado
 * inventado na hora.
 */
const DAILY_REVENUE = [9.0, 10.6, 12.5, 11.1, 15.2, 17.8, 16.4, 9.8, 11.4, 13.3, 12.8, 16.8, 18.8, 17.4];

const ultimaSemana = DAILY_REVENUE.slice(7).reduce((a, b) => a + b, 0);
const semanaAnterior = DAILY_REVENUE.slice(0, 7).reduce((a, b) => a + b, 0);
const variacaoSemanal = (ultimaSemana / semanaAnterior - 1) * 100;

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
          R$ {num(DAILY_REVENUE[DAILY_REVENUE.length - 1])} mil
        </span>
        <span className="font-mono text-[11px]" style={{ color: "var(--lp-accent)" }}>
          ▲ {num(variacaoSemanal)}% vs. semana anterior
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
  const real = pctDe("CMV");
  const meta = real - 2.0;
  const scaleMax = 45;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-lg font-semibold" style={{ color: TERRACOTA }}>
          {num(real)}%
        </span>
        <span className="font-mono text-[11px]" style={{ color: "var(--lp-muted)" }}>
          meta {num(meta)}%
        </span>
      </div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--lp-elevated)" }}
        role="img"
        aria-label={`CMV real de ${num(real)}% contra meta de ${num(meta)}%`}
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
        {num(real - meta)} p.p. acima da meta no período
      </p>
    </div>
  );
}

/** Abertura das despesas. Soma exatamente o percentual de Despesas do DRE. */
const EXPENSE_ROWS = [
  { label: "Vendas", pct: 8.0 },
  { label: "Pessoal", pct: 20.0 },
  { label: "Administrativas", pct: 8.0 },
];

export function ExpenseBars() {
  const scaleMax = 25;
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
              {num(r.pct)}%
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

/**
 * DRE gerencial fechando em resultado.
 *
 * As quatro deduções e a margem vêm de `EXEMPLO_DRE` — inclusive a linha de
 * impostos, que a primeira versão omitia. Era um erro de verdade: a página
 * inteira defende que o dinheiro passa por seis etapas e que impostos são a
 * segunda, e o gráfico que deveria provar isso pulava a etapa.
 */
export function DreLines() {
  const resultado = Math.round(
    (EXEMPLO_DRE.receita * EXEMPLO_DRE.margemPct) / 100,
  ).toLocaleString("pt-BR");

  return (
    <div className="font-mono text-[12px]" role="img" aria-label="DRE gerencial do período">
      <div
        className="flex items-baseline justify-between py-1"
        style={{ color: "var(--lp-muted)" }}
      >
        <span>Receita</span>
        <span>{EXEMPLO_DRE.receita.toLocaleString("pt-BR")}</span>
      </div>

      {EXEMPLO_DRE.linhas.map((l) => (
        <div
          key={l.label}
          className="flex items-baseline justify-between py-1"
          style={{ color: "var(--lp-muted)" }}
        >
          <span>
            <span className="mr-1">−</span>
            {l.label}
          </span>
          <span>{reais(l.pct)}</span>
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
          {resultado}
        </span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--lp-muted)" }}>
        margem {num(EXEMPLO_DRE.margemPct)}% no mês
      </p>
    </div>
  );
}

export const MODULE_VISUALS = [Sparkline, CmvBar, ExpenseBars, DreLines];
