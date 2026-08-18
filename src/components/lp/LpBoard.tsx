"use client";

import { useState } from "react";
import { BOARD, BOARD_TABS, BOARD_VENDAS, type BoardTab } from "@/lib/lp-content";
import { Sparkline, CmvBar, ExpenseBars, DreLines, pctDe, reais, num } from "./LpDataParts";

/**
 * O tabuleiro: as seis etapas em abas.
 *
 * Os seis painéis são SEMPRE renderizados no HTML servido — os inativos levam
 * `hidden` — para o buscador indexar o conteúdo inteiro, na mesma filosofia do
 * menu mobile do Header. O estado só decide o que fica visível.
 *
 * Impostos e Endividamento não têm gráfico próprio: derivam de EXEMPLO_DRE,
 * via os helpers compartilhados de LpDataParts.
 */

function BigStat({ pct }: { pct: number }) {
  return (
    <div>
      <p className="font-mono text-2xl font-semibold" style={{ color: "var(--lp-ink)" }}>
        R$ {reais(pct)}
      </p>
      <p
        className="mt-1 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        {num(pct)}% da receita no período
      </p>
    </div>
  );
}

function VendasPanel() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Sparkline />
      <div>
        <p
          className="mb-1 font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "var(--lp-muted)" }}
        >
          {BOARD_VENDAS.turnosTitle}
        </p>
        <ul>
          {BOARD_VENDAS.turnos.map((t) => (
            <li
              key={t.label}
              className="flex items-baseline justify-between py-1.5 font-mono text-[12px]"
              style={{ borderTop: "1px solid var(--lp-line)" }}
            >
              <span style={{ color: "var(--lp-ink)" }}>{t.label}</span>
              <span style={{ color: "var(--lp-muted)" }}>{t.valor}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[BOARD_VENDAS.melhorDia, BOARD_VENDAS.piorDia].map((d) => (
            <div key={d.label} className="rounded-lg p-3" style={{ backgroundColor: "var(--lp-bg)" }}>
              <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>
                {d.label}
              </p>
              <p className="font-mono text-sm font-semibold" style={{ color: "var(--lp-ink)" }}>
                {d.valor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel({ id }: { id: BoardTab["id"] }) {
  switch (id) {
    case "vendas":
      return <VendasPanel />;
    case "cmv":
      return <CmvBar />;
    case "impostos":
      return <BigStat pct={pctDe("Impostos")} />;
    case "despesas":
      return <ExpenseBars />;
    case "dividas":
      return <BigStat pct={pctDe("Dívidas")} />;
    case "resultado":
      return <DreLines />;
  }
}

export default function LpBoard() {
  const [active, setActive] = useState<BoardTab["id"]>("vendas");

  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 max-w-3xl">
          <p className="lp-label mb-4">{BOARD.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {BOARD.headlinePlain}
            <span style={{ color: "#e54c00" }}>{BOARD.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-2">
            <strong className="lp-strong">{BOARD.sub}</strong>
          </p>
          <p className="lp-body">{BOARD.intro}</p>
        </div>

        <div role="tablist" aria-label="Etapas do tabuleiro" className="mb-6 flex flex-wrap gap-2">
          {BOARD_TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`board-tab-${t.id}`}
              aria-selected={active === t.id}
              aria-controls={`board-panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={
                active === t.id
                  ? { backgroundColor: "var(--color-cta)", color: "#ffffff" }
                  : { backgroundColor: "var(--lp-elevated)", color: "var(--lp-muted)" }
              }
            >
              {t.tab}
            </button>
          ))}
        </div>

        {BOARD_TABS.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`board-panel-${t.id}`}
            aria-labelledby={`board-tab-${t.id}`}
            hidden={active !== t.id}
            className="lp-card p-6"
          >
            <p className="mb-4 text-sm" style={{ color: "var(--lp-muted)" }}>
              {t.sub}
            </p>
            <Panel id={t.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
