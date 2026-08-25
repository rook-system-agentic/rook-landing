import { TELAS } from "@/lib/lp-content";
import {
  MAPA_DE_CALOR,
  TURNOS,
  PRECO_INSUMO,
  FORNECEDORES_INSUMO,
  EXTRATO_TXNS,
  extremosDoMapa,
  resumoDoInsumo,
  resumoDaClassificacao,
} from "@/lib/telas-do-produto.mjs";

/**
 * As três telas do produto, recriadas.
 *
 * NÃO SÃO PRINTS, E ISSO É REGRA — a mesma do mockup do Rook.AI (PR #114):
 * print do produto real carrega dado de operação de cliente, e dado de cliente
 * não vai para a landing page. Aqui é marcação nossa, com os números da casa
 * exemplo do site (`lib/telas-do-produto.mjs`, amarrado por teste).
 *
 * A PALETA É FIXA, e isso também é deliberado. O site tem tema claro e escuro
 * (`Header.tsx` liga e guarda a preferência), mas estes painéis representam a
 * TELA DO PRODUTO — que tem paleta própria. Seguem o precedente do
 * `LpIntelligence`, que fixa as cores do balão de conversa e deixa só a
 * moldura acompanhar o tema. Painel que troca de cor com o site pararia de
 * parecer um software e passaria a parecer decoração.
 *
 * O RECORTE de cada tela é decisão de página, não preguiça: a gaveta de preço
 * tem 1.680 px de altura no produto e ninguém lê isso numa landing. Entra o
 * que faz o argumento — resumo, curva e de quem vem a alta — e ficam de fora a
 * tabela mês a mês e a lista de notas fiscais.
 *
 * Os valores abaixo são os tokens do produto resolvidos em tema claro
 * (rook-system, `app/globals.css`): `--background 35 25% 97%`,
 * `--card 0 0% 100%`, `--foreground 20 35% 15%`, `--muted-foreground` #675647
 * (4,8:1 sobre branco, medido na ROO-1038), `--sidebar-border 35 20% 90%`,
 * `--rook-terracota` #E54C00, `--rook-brown` #754A31, `--radius` .875rem.
 */
const PANEL = {
  bg: "#f9f8f5",
  card: "#ffffff",
  ink: "#342219",
  muted: "#675647",
  border: "#e7e1da",
  line: "#ebe6e0",
  terracota: "#e54c00",
  /*
   * O terracota da marca só serve como FUNDO ou como texto grande: em corpo
   * miúdo ele mede 3,7:1 sobre a superfície do painel, abaixo do piso de
   * 4,5:1. É o mesmo achado que o `globals.css` deste repo já documenta, e a
   * saída é a mesma — uma face escurecida para o papel de texto (5,1:1).
   * Medido na página, não estimado.
   */
  terracotaTexto: "#c24100",
  brown: "#754a31",
} as const;

const brl = (n: number, casas = 2) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}%`;

/**
 * Cor da célula, na fórmula real do produto (`lib/vendas/heatmap-cell.ts` +
 * `getCellStyle`): intensidade proporcional ao desvio, saturando em ±50%.
 * Verde acima de +10%, vermelho abaixo de −10%, laranja dentro da faixa.
 *
 * ⚠️ UMA DIFERENÇA PROPOSITAL: o produto troca o texto para branco quando a
 * opacidade passa de 0,5. Isso nasceu para o tema escuro, onde a célula fica
 * sobre um cartão escuro. No tema CLARO a mesma célula fica verde-claro sobre
 * branco, e texto branco em cima mede ~1,9:1 — ilegível. Aqui o texto é sempre
 * o `ink`, que mede acima de 7:1 em qualquer célula. Está anotado na ROO-1179,
 * junto do mesmo defeito no drawer de preço.
 */
function corDaCelula(desvio: number) {
  if (desvio >= 0.1) {
    const op = 0.25 + Math.min(1, desvio / 0.5) * 0.55;
    return `rgba(22, 163, 74, ${op.toFixed(2)})`;
  }
  if (desvio <= -0.1) {
    const op = 0.25 + Math.min(1, Math.abs(desvio) / 0.5) * 0.55;
    return `rgba(220, 38, 38, ${op.toFixed(2)})`;
  }
  return "rgba(229, 76, 0, 0.35)";
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.border}` }}
    >
      {children}
    </div>
  );
}

function TituloDaTela({ children, icone }: { children: React.ReactNode; icone: React.ReactNode }) {
  return (
    <h3
      className="flex items-center gap-2 text-sm font-semibold"
      style={{ color: PANEL.brown }}
    >
      {icone}
      {children}
    </h3>
  );
}

/* ─── Tela 1 ─── */

function MapaDeCalor() {
  const { melhor, menor } = extremosDoMapa();
  return (
    <Moldura>
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { rotulo: "Melhor Combinação", extremo: melhor, cor: PANEL.terracota },
            { rotulo: "Menor Movimento", extremo: menor, cor: PANEL.muted },
          ].map(({ rotulo, extremo, cor }) => (
            <div
              key={rotulo}
              className="rounded-xl p-4"
              style={{ backgroundColor: PANEL.card, border: `1px solid ${PANEL.line}` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {rotulo === "Melhor Combinação" ? (
                    <>
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </>
                  )}
                </svg>
                <span className="text-xs font-medium" style={{ color: PANEL.muted }}>
                  {rotulo}
                </span>
              </div>
              <p className="text-base font-bold" style={{ color: PANEL.ink }}>
                {extremo.dia} &bull; {extremo.turno}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: PANEL.muted }}>
                R$ {brl(extremo.valor)} em média por dia
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl p-4 sm:p-5"
          style={{ backgroundColor: PANEL.card, border: `1px solid ${PANEL.border}` }}
        >
          <TituloDaTela
            icone={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PANEL.terracota} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />
              </svg>
            }
          >
            Mapa de Calor: Dia da Semana &times; Turno
          </TituloDaTela>
          <p className="mt-1 text-[11px]" style={{ color: PANEL.muted }}>
            Cada célula é comparada com a média das últimas 8 semanas do mesmo dia da semana e
            turno (não com a média geral)
          </p>

          <div className="mt-3 min-w-0 overflow-x-auto">
            <table className="w-full min-w-[340px] border-collapse">
              <thead>
                <tr>
                  <th className="w-12 p-2 text-left text-[11px] font-medium" style={{ color: PANEL.muted }}>
                    Dia
                  </th>
                  {TURNOS.map((t) => (
                    <th key={t} className="p-2 text-center text-[11px] font-medium" style={{ color: PANEL.muted }}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MAPA_DE_CALOR.map((linha) => (
                  <tr key={linha.dia}>
                    <td className="p-2 text-[12px] font-medium" style={{ color: PANEL.ink }}>
                      {linha.dia}
                    </td>
                    {linha.celulas.map((celula, i) => {
                      const ehMelhor = linha.dia === melhor.dia && TURNOS[i] === melhor.turno;
                      return (
                        <td key={TURNOS[i]} className="p-1.5">
                          <div
                            className="rounded-lg p-2.5 text-center text-[12px] font-bold sm:p-3"
                            style={{
                              backgroundColor: corDaCelula(celula.desvio),
                              color: PANEL.ink,
                              boxShadow: ehMelhor
                                ? `0 0 0 1px ${PANEL.card}, 0 0 0 3px ${PANEL.terracota}`
                                : undefined,
                            }}
                          >
                            R$ {brl(celula.valor)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3"
            style={{ borderTop: `1px solid ${PANEL.line}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: PANEL.muted }}>
                Abaixo da média
              </span>
              <div className="flex gap-0.5" aria-hidden="true">
                {["rgba(220, 38, 38, 0.8)", "rgba(220, 38, 38, 0.4)", "rgba(229, 76, 0, 0.35)", "rgba(22, 163, 74, 0.4)", "rgba(22, 163, 74, 0.8)"].map((c) => (
                  <div key={c} className="h-3 w-5 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-[10px]" style={{ color: PANEL.muted }}>
                Acima da média
              </span>
            </div>
            <span className="text-[10px]" style={{ color: PANEL.muted }}>
              Ref.: média 8 semanas anteriores
            </span>
          </div>
        </div>
      </div>
    </Moldura>
  );
}

/* ─── Tela 2 ─── */

function PrecoDoInsumo() {
  const { medio, minimo, maximo, variacaoPct } = resumoDoInsumo();
  const w = 640;
  const h = 200;
  const padX = 8;
  const topo = 10;
  const base = h - 26;
  const pontos = PRECO_INSUMO.map((p, i) => {
    const x = padX + (i / (PRECO_INSUMO.length - 1)) * (w - padX * 2);
    const y = base - ((p.preco - minimo) / (maximo - minimo)) * (base - topo);
    return { x, y, ...p };
  });
  const linha = pontos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const yMedia = base - ((medio - minimo) / (maximo - minimo)) * (base - topo);

  return (
    <Moldura>
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PANEL.terracota} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
          </svg>
          <div>
            <p className="text-base font-semibold" style={{ color: PANEL.ink }}>
              FILÉ MIGNON RESFRIADO KG
            </p>
            <p className="text-xs" style={{ color: PANEL.muted }}>
              Histórico de Preços &bull; Proteínas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { rotulo: "Preço Médio", valor: `R$ ${brl(medio)}`, cor: PANEL.ink, forte: true },
            { rotulo: "Variação · 12 meses", valor: pct(variacaoPct), cor: "#b91c1c", forte: true },
            { rotulo: "Menor Preço", valor: `R$ ${brl(minimo)}`, cor: "#15803d", forte: false },
            { rotulo: "Maior Preço", valor: `R$ ${brl(maximo)}`, cor: "#b91c1c", forte: false },
          ].map((c) => (
            <div
              key={c.rotulo}
              className="rounded-lg p-3"
              style={{ backgroundColor: PANEL.card, border: `1px solid ${PANEL.line}` }}
            >
              <p className="mb-1 text-xs" style={{ color: PANEL.muted }}>
                {c.rotulo}
              </p>
              <p
                className={c.forte ? "text-lg font-semibold" : "text-sm font-medium"}
                style={{ color: c.cor }}
              >
                {c.valor}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: PANEL.card, border: `1px solid ${PANEL.line}` }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: PANEL.ink }}>
            Evolução do Preço Médio
          </p>
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="w-full"
            role="img"
            aria-label={`Preço médio do filé mignon subindo de R$ ${brl(minimo)} para R$ ${brl(maximo)} por quilo em doze meses`}
          >
            <defs>
              <linearGradient id="gradPrecoInsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c2956a" stopOpacity="0.3" />
                <stop offset="95%" stopColor="#c2956a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={`${padX},${base} ${linha} ${w - padX},${base}`}
              fill="url(#gradPrecoInsumo)"
              stroke="none"
            />
            <line
              x1={padX} y1={yMedia} x2={w - padX} y2={yMedia}
              stroke={PANEL.muted} strokeDasharray="4 4" vectorEffect="non-scaling-stroke"
            />
            <text x={w - padX - 2} y={yMedia - 5} fill={PANEL.muted} fontSize="11" textAnchor="end">
              Média R$ {brl(medio)}
            </text>
            <polyline
              points={linha}
              fill="none"
              stroke="#c2956a"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {pontos.map((p) => (
              <circle key={p.mes} cx={p.x} cy={p.y} r="3.5" fill="#c2956a" />
            ))}
            {pontos.map((p, i) =>
              i % 2 === 0 ? (
                <text key={p.mes} x={p.x} y={h - 6} fill={PANEL.muted} fontSize="11" textAnchor="middle">
                  {p.mes}
                </text>
              ) : null,
            )}
          </svg>
        </div>


        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: PANEL.card, border: `1px solid ${PANEL.line}` }}
        >
          <p className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: PANEL.ink }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PANEL.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
              <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
            </svg>
            Fornecedores
          </p>
          <ul>
            {FORNECEDORES_INSUMO.map((f, i) => (
              <li
                key={f.nome}
                className="flex items-center justify-between gap-3 py-2"
                style={{ borderTop: i === 0 ? undefined : `1px solid ${PANEL.line}` }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm" style={{ color: PANEL.ink }}>
                    {f.nome}
                  </span>
                  <span className="text-xs" style={{ color: PANEL.muted }}>
                    {f.notas} NFs &bull; última em {f.ultima}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: PANEL.ink }}>
                    R$ {brl(f.preco)}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.tendencia === "up" ? "#b91c1c" : PANEL.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {f.tendencia === "up" ? (
                      <>
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </>
                    ) : (
                      <path d="M5 12h14" />
                    )}
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Moldura>
  );
}

/* ─── Tela 3 ─── */

const SELOS = {
  auto: { texto: "Auto", fundo: "#dcfce7", cor: "#15803d" },
  manual: { texto: "Manual", fundo: "#dbeafe", cor: "#1d4ed8" },
  pendente: { texto: "Pendente", fundo: "#fef9c3", cor: "#a16207" },
} as const;

function ExtratoClassificado() {
  const { classificadas, pendentes, total, pct: cobertura } = resumoDaClassificacao();
  return (
    <Moldura>
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PANEL.terracota} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" />
            <line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" />
            <line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" />
          </svg>
          <div>
            <p className="text-base font-semibold" style={{ color: PANEL.ink }}>
              Detalhe do Documento
            </p>
            <p className="text-xs" style={{ color: PANEL.muted }}>
              Extrato Stone &bull; 01/07 a 31/07/2026 &bull; Open Finance
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: PANEL.card, border: `1px solid ${PANEL.line}` }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: PANEL.ink }}>
              Classificação
            </p>
            <span className="text-sm font-bold" style={{ color: "#15803d" }}>
              {cobertura}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: PANEL.line }}>
            <div className="h-full rounded-full" style={{ width: `${cobertura}%`, backgroundColor: "#22c55e" }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px]" style={{ color: PANEL.muted }}>
            <span>{classificadas} classificadas</span>
            <span>{pendentes} pendentes</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${PANEL.line}` }}>
          <table className="w-full text-xs">
            <caption className="sr-only">
              Amostra de {total} transações do extrato, com a conta atribuída pelo Rook
            </caption>
            <thead>
              <tr style={{ backgroundColor: PANEL.bg, borderBottom: `1px solid ${PANEL.line}` }}>
                <th className="p-2 text-left font-medium" style={{ color: PANEL.muted }}>Data</th>
                <th className="p-2 text-left font-medium" style={{ color: PANEL.muted }}>Descrição</th>
                <th className="p-2 text-right font-medium" style={{ color: PANEL.muted }}>Valor</th>
                <th className="p-2 text-center font-medium" style={{ color: PANEL.muted }}>Conta</th>
              </tr>
            </thead>
            <tbody>
              {EXTRATO_TXNS.map((t, i) => {
                const selo = SELOS[t.metodo];
                return (
                  <tr
                    key={t.descricao}
                    style={{ borderTop: i === 0 ? undefined : `1px solid ${PANEL.line}` }}
                  >
                    <td className="whitespace-nowrap p-2" style={{ color: PANEL.muted }}>{t.data}</td>
                    <td className="p-2" style={{ color: PANEL.ink }}>{t.descricao}</td>
                    <td
                      className="whitespace-nowrap p-2 text-right font-medium"
                      style={{ color: t.tipo === "credito" ? "#15803d" : "#b91c1c" }}
                    >
                      {t.tipo === "credito" ? "+" : "-"}R$ {brl(Math.abs(t.valor))}
                    </td>
                    <td className="p-2 text-center">
                      <span className="inline-flex flex-col items-center gap-0.5">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: selo.fundo, color: selo.cor }}
                        >
                          {selo.texto}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: t.conta ? PANEL.muted : PANEL.terracotaTexto }}
                        >
                          {t.conta ?? "Classificar"}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Moldura>
  );
}

const TELA_POR_ID: Record<string, () => React.JSX.Element> = {
  "mapa-de-calor": MapaDeCalor,
  "preco-do-insumo": PrecoDoInsumo,
  "extrato-classificado": ExtratoClassificado,
};

export default function TelasDoProduto() {
  return (
    <section className="section-spacing" style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <p className="section-label mb-6">{TELAS.label}</p>
        <h2 className="heading-section mb-4">
          {TELAS.headlinePlain}
          <em>{TELAS.headlineEmphasis}</em>
        </h2>
        <p className="text-body mb-12 max-w-2xl">{TELAS.intro}</p>

        <div className="flex flex-col gap-16">
          {TELAS.telas.map((tela, i) => {
            const Tela = TELA_POR_ID[tela.id];
            return (
              <article
                key={tela.id}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--color-terracota-text)" }}
                  >
                    {tela.modulo}
                  </p>
                  <h3 className="heading-sub mt-3 mb-4">{tela.titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {tela.texto}
                  </p>
                  <p
                    className="mt-5 pt-4 font-mono text-[11px] uppercase tracking-wider"
                    style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)" }}
                  >
                    {tela.paraQuem}
                  </p>
                </div>
                {/*
                  * `min-w-0` não é enfeite: item de grid nasce com
                  * `min-width: auto`, então a largura mínima do conteúdo sobe
                  * pela árvore. A tabela do mapa tem `min-w-[340px]`, e sem
                  * isto ela empurrava o DOCUMENTO INTEIRO para 432 px num
                  * celular de 375 — a página passava a rolar de lado, header
                  * incluído. Medido em 375 px antes e depois.
                  */}
                <div className={`min-w-0 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Tela />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
