import { EXEMPLO_DRE } from "@/lib/lp-content";
import { PRECO_INSUMO, resumoDoInsumo } from "@/lib/telas-do-produto.mjs";

/**
 * As peças de interface da home: a vitrine "Tabuleiro · Casa exemplo"
 * (LpShowcase) e os painéis do tabuleiro em abas (LpBoard) montam seus cards
 * com estes gráficos.
 *
 * São SVG e divs estáticos de propósito: nenhuma depende de JavaScript para
 * existir na tela, então a página serve renderizada e o buscador vê o mesmo
 * que o visitante.
 *
 * NÚMEROS: os gráficos descrevem o MESMO restaurante no MESMO período, e tudo
 * é derivado de `EXEMPLO_DRE`. Nada aqui é digitado à mão — se um percentual
 * mudar lá, os valores em reais e o texto de apoio acompanham. É o que impede
 * a página de dizer duas coisas sobre o mesmo dinheiro.
 *
 * Validado por Daniel em 13/08/2026 como reconhecível para a operação. Ainda é
 * exemplo, não é cliente.
 */

const TERRACOTA = "#e54c00";

/** União literal dos labels do DRE: renomear em lp-content.ts quebra no tsc, não em runtime. */
type DreLabel = (typeof EXEMPLO_DRE.linhas)[number]["label"];

export const pctDe = (label: DreLabel) =>
  EXEMPLO_DRE.linhas.find((l) => l.label === label)!.pct;

export const reais = (pct: number) =>
  Math.round((EXEMPLO_DRE.receita * pct) / 100).toLocaleString("pt-BR");

export const num = (n: number, casas = 1) =>
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
  const coords = DAILY_REVENUE.map((v, i) => ({
    x: (i / (DAILY_REVENUE.length - 1)) * w,
    y: h - ((v - min) / (max - min)) * (h - 8) - 4,
  }));
  const pts = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`);

  /*
   * O desenho progressivo é feito com uma cortina (`clip-path`) sobre o SVG
   * inteiro, e não com `stroke-dasharray`.
   *
   * Tracejado não funciona aqui, e o motivo é sutil: com
   * `vectorEffect="non-scaling-stroke"` o navegador mede o tracejado em pixels
   * de tela, enquanto o comprimento da polilinha existe em unidades do
   * viewBox. Como `preserveAspectRatio="none"` estica o eixo X, os dois nunca
   * batem — e o traço aparece com buracos. Com `pathLength` normalizado o
   * sintoma é o mesmo.
   *
   * A cortina é imune a isso: revela linha e área juntas, da esquerda para a
   * direita, independente de escala.
   */

  /*
   * O contêiner cresce (`h-full` + coluna flex) e o SVG ocupa a sobra
   * (`flex-1`). Antes o gráfico tinha altura fixa de 64px dentro de um card que
   * a grade estica até a altura da coluna vizinha — sobravam dois terços de
   * espaço vazio embaixo da linha.
   *
   * Esticar não custa qualidade: é vetor, e `vectorEffect="non-scaling-stroke"`
   * mantém a espessura do traço em pixels de tela, independente da escala do
   * viewBox. O `min-h-16` preserva o tamanho antigo como piso, para o gráfico
   * não achatar onde o card é baixo (a aba Vendas do tabuleiro).
   */
  return (
    <div className="flex h-full flex-col">
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
        className="lp-spark min-h-16 w-full flex-1"
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
        {/* `--color-terracota-text`, e não a constante TERRACOTA: este é o
            único lugar do arquivo em que o terracota vira TEXTO. Com #e54c00 o
            número media 3,68:1 no claro e 4,43:1 no escuro, abaixo do piso de
            4,5:1 para 18px. As barras e o traço do gráfico seguem no terracota
            da marca — são forma, não texto, e têm rótulo próprio no aria-label. */}
        <span className="font-mono text-lg font-semibold" style={{ color: "var(--color-terracota-text)" }}>
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
          className="lp-grow-bar absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${(real / scaleMax) * 100}%`, backgroundColor: TERRACOTA }}
        />
        {/* A meta entra depois da barra: o cruzamento precisa ser lido como
            evento, não como estado que já estava lá. */}
        <div
          className="lp-meta-line absolute inset-y-[-4px] w-[2px]"
          style={{ left: `${(meta / scaleMax) * 100}%`, backgroundColor: "var(--lp-ink)" }}
        />
      </div>
      {/* v6: era "2,0 p.p. acima da meta no período". "p.p." é a sigla que o
          público desta página não usa, e um desvio percentual sozinho não diz
          se dói. O mesmo desvio, em reais, diz — e é o número que o Rook.AI
          explica mais abaixo. Os R$ saem de EXEMPLO_DRE como todo o resto: se
          o percentual mudar lá, este valor acompanha. */}
      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        {num(real - meta, 0)} pontos acima da meta — R$ {reais(real - meta)} a mais no mês
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
      {EXPENSE_ROWS.map((r, i) => (
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
              className="lp-grow-bar h-full rounded-full"
              style={{
                width: `${(r.pct / scaleMax) * 100}%`,
                backgroundColor: "var(--lp-accent)",
                animationDelay: `${i * 110}ms`,
              }}
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

      {EXEMPLO_DRE.linhas.map((l, i) => (
        <div
          key={l.label}
          className="lp-dre-row flex items-baseline justify-between py-1"
          style={{ color: "var(--lp-muted)", animationDelay: `${(i + 1) * 90}ms` }}
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

/**
 * Evolução do preço do insumo em doze meses — a linha que a lista não conta.
 *
 * POR QUE ESTE GRÁFICO EXISTE AO LADO DA LISTA
 *
 * A aba Compras/CMV já mostrava "Inflação de insumo · 30 dias", com o filé
 * mignon em +8,4%. O número tem uma fraqueza: 8% num item lê como pouco, e o
 * leitor segue em frente. É o degrau, não a escada.
 *
 * Este gráfico é a escada. Mesmo insumo, doze meses: passos de 2%, 3%, 4%, um
 * por mês, nenhum grande o bastante para virar decisão — e +37,8% no fim. O
 * "+8,4%" da lista é o ÚLTIMO PONTO desta linha, não outro número; a trava em
 * `tests/telas-do-produto-coerentes.test.mjs` garante isso.
 *
 * Sem eixos de propósito: aqui o que convence é a forma da curva, e o valor
 * exato de cada mês fica na versão cheia, em /restaurantes.
 */
export function PrecoInsumoChart() {
  const w = 260;
  const h = 64;
  const precos = PRECO_INSUMO.map((p) => p.preco);
  const { variacaoPct, minimo, maximo } = resumoDoInsumo();
  const pts = precos.map((v, i) => {
    const x = (i / (precos.length - 1)) * w;
    const y = h - ((v - minimo) / (maximo - minimo)) * (h - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-lg font-semibold" style={{ color: "var(--lp-ink)" }}>
          R$ {num(maximo, 2)}/kg
        </span>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--color-terracota-text)" }}
        >
          ▲ {num(variacaoPct)}% em 12 meses
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="lp-spark min-h-16 w-full flex-1"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Preço médio do filé mignon subindo ${num(variacaoPct)} por cento em doze meses`}
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
        Filé mignon · preço médio por mês
      </p>
    </div>
  );
}
