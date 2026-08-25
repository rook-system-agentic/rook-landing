"use client";

import { useState } from "react";
import {
  BOARD,
  BOARD_CMV,
  BOARD_DIVIDAS,
  BOARD_IMPOSTOS,
  BOARD_TABS,
  BOARD_VENDAS,
  EXEMPLO_DRE,
  type BoardTab,
} from "@/lib/lp-content";
import {
  Sparkline,
  CmvBar,
  ExpenseBars,
  DreLines,
  PrecoInsumoChart,
  pctDe,
  reais,
  num,
} from "./LpDataParts";

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

/** Limite semanal de compras: o CMV do DRE, proporcional a 7 dos 31 dias. */
const limiteSemanal = Math.round(
  (EXEMPLO_DRE.receita * pctDe("CMV")) / 100 / 31 * 7,
).toLocaleString("pt-BR");

function CmvPanel() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <CmvBar />
        <div className="mt-6 rounded-lg p-3" style={{ backgroundColor: "var(--lp-bg)" }}>
          <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>
            {BOARD_CMV.limiteTitle} · R$ {limiteSemanal}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold" style={{ color: "var(--lp-ink)" }}>
            {BOARD_CMV.limiteUsado} · {BOARD_CMV.limiteDisponivel}
          </p>
        </div>
      </div>
      <div>
        {/*
          * O gráfico vem ANTES da lista, e a ordem é o argumento.
          *
          * A lista sozinha diz "+8,4%" e o leitor lê "pouco". O gráfico mostra
          * doze meses de passos pequenos virando +37,8%, e aí o "+8,4%" abaixo
          * dele deixa de ser um item e passa a ser o último degrau de uma
          * escada. Invertido, o leitor já descartou o assunto antes de chegar
          * na curva. Ver `PrecoInsumoChart` em LpDataParts.
          */}
        <div className="mb-6">
          <PrecoInsumoChart />
        </div>
        <p
          className="mb-1 font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "var(--lp-muted)" }}
        >
          {BOARD_CMV.insumosTitle}
        </p>
        <ul>
          {BOARD_CMV.insumos.map((i) => (
            <li
              key={i.label}
              className="flex items-baseline justify-between gap-3 py-2"
              style={{ borderTop: "1px solid var(--lp-line)" }}
            >
              <span>
                <span className="block text-sm font-semibold" style={{ color: "var(--lp-ink)" }}>
                  {i.label}
                </span>
                <span className="text-[11px]" style={{ color: "var(--lp-muted)" }}>
                  {i.note}
                </span>
              </span>
              <span
                className="font-mono text-sm font-semibold"
                style={{ color: "var(--color-terracota-text)" }}
              >
                {i.delta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ImpostosPanel() {
  const pct = pctDe("Impostos");
  return (
    <div>
      <p
        className="mb-1 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        {BOARD_IMPOSTOS.bigLabel}
      </p>
      <p className="font-mono text-2xl font-semibold" style={{ color: "var(--lp-ink)" }}>
        {num(pct)}%
      </p>
      <p
        className="mt-1 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        R$ {reais(pct)} apurados no período
      </p>
      <p className="mt-4 max-w-md text-sm" style={{ color: "var(--lp-muted)" }}>
        {BOARD_IMPOSTOS.note}
      </p>
    </div>
  );
}

function DividasPanel() {
  const pct = pctDe("Dívidas");
  return (
    <div>
      <p
        className="mb-1 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        {BOARD_DIVIDAS.bigLabel}
      </p>
      <p className="font-mono text-2xl font-semibold" style={{ color: "var(--lp-ink)" }}>
        R$ {reais(pct)}
      </p>
      <p
        className="mt-1 font-mono text-[10px] uppercase tracking-wider"
        style={{ color: "var(--lp-muted)" }}
      >
        {num(pct)}% da receita no período
      </p>
      <ul className="mt-4 max-w-md">
        {BOARD_DIVIDAS.rows.map((r) => (
          <li
            key={r.label}
            className="flex items-baseline justify-between gap-3 py-1.5 font-mono text-[12px]"
            style={{ borderTop: "1px solid var(--lp-line)" }}
          >
            <span style={{ color: "var(--lp-ink)" }}>{r.label}</span>
            <span style={{ color: "var(--lp-muted)" }}>{r.value}</span>
          </li>
        ))}
      </ul>
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
      return <CmvPanel />;
    case "impostos":
      return <ImpostosPanel />;
    case "despesas":
      return <ExpenseBars />;
    case "dividas":
      return <DividasPanel />;
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
          <p className="lp-body">{BOARD.intro}</p>
        </div>

        {/* Abas verticais no desktop, como no preview; no celular viram pills
            que quebram linha. */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div
            role="tablist"
            aria-label="Etapas do tabuleiro"
            className="flex flex-wrap gap-2 lg:col-span-3 lg:flex-col"
          >
            {BOARD_TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`board-tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls={`board-panel-${t.id}`}
                onClick={() => setActive(t.id)}
                onMouseEnter={() => setActive(t.id)}
                onFocus={() => setActive(t.id)}
                className="rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors lg:w-full"
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

          <div className="lg:col-span-9">
            {BOARD_TABS.map((t) => (
              <div
                key={t.id}
                role="tabpanel"
                id={`board-panel-${t.id}`}
                aria-labelledby={`board-tab-${t.id}`}
                hidden={active !== t.id}
                className="lp-card h-full p-6"
              >
                <p className="mb-4 text-sm" style={{ color: "var(--lp-muted)" }}>
                  {t.sub}
                </p>
                <Panel id={t.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
