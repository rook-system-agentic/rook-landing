"use client";

import { useState, type ReactNode } from "react";
import {
  ADQUIRENTES_MOCK,
  DATA_SOURCES,
  ESOCIAL_MOCK,
  PDV_MOCK,
  SEFAZ_MOCK,
  SOURCE_TABS,
  type SourceTab,
} from "@/lib/lp-content";
import Reveal from "./LpReveal";

/*
 * Paleta fixa do painel escuro: os mocks são escuros NOS DOIS temas, como no
 * preview aprovado — são documentos dentro da página, não superfícies do
 * tema. Contrastes sobre #10151c: #eef3f8 ≈ 15:1, #9fb0bf ≈ 7:1, #ff8345 ≈ 5:1,
 * #6fcf97 ≈ 8:1.
 */
const PANEL = {
  bg: "#10151c",
  line: "rgba(255, 255, 255, 0.1)",
  inset: "rgba(255, 255, 255, 0.05)",
  ink: "#eef3f8",
  muted: "#9fb0bf",
  accent: "#ff8345",
  ok: "#6fcf97",
};

/**
 * A captura viva: cada fonte abre um mock da Central de Dados (brief §5.2).
 *
 * Os cinco painéis são SEMPRE renderizados no HTML servido — os inativos levam
 * `hidden`, na mesma filosofia do LpBoard: o buscador indexa tudo e o estado só
 * decide o que fica visível. As abas ativam por clique, foco e hover (hover no
 * desktop, toque no mobile, como o preview).
 *
 * Os "botões" DENTRO dos mocks ("Confirmar operação") são texto estilizado de
 * propósito, como no LpBriefing: um <button> real num mock seria um elemento
 * focável que não faz nada.
 */

function MockShell({ title, doc, badge, children }: {
  title: string;
  doc: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <article
      className="rounded-2xl p-5 lg:p-6"
      style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: PANEL.muted }}>
          {title}
        </p>
        {badge && (
          <p
            className="whitespace-nowrap rounded-full px-3 py-1 font-mono text-[11px]"
            style={{ backgroundColor: PANEL.inset, color: PANEL.accent }}
          >
            {badge}
          </p>
        )}
      </div>
      <p className="mb-5 font-mono text-xs" style={{ color: PANEL.muted }}>
        {doc}
      </p>
      {children}
    </article>
  );
}

function MiniStat({ label, value, meta, tone }: {
  label: string;
  value: string;
  meta?: string;
  tone?: "in" | "out";
}) {
  const valueColor = tone === "in" ? PANEL.ok : tone === "out" ? PANEL.accent : PANEL.ink;
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: PANEL.inset }}>
      <p className="text-[11px]" style={{ color: PANEL.muted }}>
        {label}
      </p>
      <p className="font-mono text-sm font-semibold" style={{ color: valueColor }}>
        {value}
      </p>
      {meta && (
        <p className="font-mono text-[10px]" style={{ color: PANEL.muted }}>
          {meta}
        </p>
      )}
    </div>
  );
}

function PairList({ rows }: { rows: readonly { label: string; value: string }[] }) {
  return (
    <ul>
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex items-baseline justify-between gap-3 py-1.5 font-mono text-[12px]"
          style={{ borderTop: `1px solid ${PANEL.line}` }}
        >
          <span style={{ color: PANEL.ink }}>{r.label}</span>
          <span style={{ color: PANEL.muted }}>{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

function OpenFinancePanel() {
  const s = DATA_SOURCES.statement;
  return (
    <MockShell title={s.title} doc={s.doc} badge={s.badge}>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {s.summary.map((item) => (
          <MiniStat
            key={item.label}
            label={item.label}
            value={item.value}
            meta={"meta" in item ? item.meta : undefined}
          />
        ))}
      </div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider" style={{ color: PANEL.muted }}>
        {s.classifiedTitle}
      </p>
      <PairList rows={s.classified.map((c) => ({ label: c.label, value: `${c.txns} txns — ${c.value}` }))} />
    </MockShell>
  );
}

function SefazPanel() {
  const s = SEFAZ_MOCK;
  return (
    <MockShell title={s.title} doc={s.doc}>
      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2"
        style={{ border: `1px solid ${PANEL.accent}`, backgroundColor: PANEL.inset }}
      >
        <p className="text-xs" style={{ color: PANEL.ink }}>
          {s.aceite.warning}
        </p>
        <p
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: "var(--color-cta)", color: "#ffffff" }}
        >
          {s.aceite.action}
        </p>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        {s.partes.map((p) => (
          <MiniStat key={p.label} label={p.label} value={p.value} />
        ))}
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {s.tributos.map((t) => (
          <MiniStat key={t.label} label={t.label} value={t.value} />
        ))}
      </div>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider" style={{ color: PANEL.muted }}>
        {s.categoriasTitle}
      </p>
      <ul className="mb-4 space-y-2">
        {s.categorias.map((c) => (
          <li key={c.label}>
            <div className="mb-1 flex justify-between font-mono text-[12px]">
              <span style={{ color: PANEL.ink }}>
                {c.label} · {c.itens}
              </span>
              <span style={{ color: PANEL.muted }}>
                {c.value} ({c.pct}%)
              </span>
            </div>
            <div className="h-1 rounded-full" style={{ backgroundColor: PANEL.inset }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${c.pct}%`, backgroundColor: PANEL.accent }}
              />
            </div>
          </li>
        ))}
      </ul>
      <PairList rows={s.itens.map((i) => ({ label: `${i.label} · ${i.categoria}`, value: i.value }))} />
    </MockShell>
  );
}

function EsocialPanel() {
  const s = ESOCIAL_MOCK;
  return (
    <MockShell title={s.title} doc={s.doc} badge={s.badge}>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {s.summary.map((item) => (
          <MiniStat key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
      <PairList rows={s.setores} />
    </MockShell>
  );
}

function AdquirentesPanel() {
  const s = ADQUIRENTES_MOCK;
  return (
    <MockShell title={s.title} doc={s.doc} badge={s.badge}>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {s.summary.map((item) => (
          <MiniStat
            key={item.label}
            label={item.label}
            value={item.value}
            tone={"tone" in item ? item.tone : undefined}
          />
        ))}
      </div>
      <PairList rows={s.adquirentes} />
    </MockShell>
  );
}

function PdvPanel() {
  const s = PDV_MOCK;
  return (
    <MockShell title={s.title} doc={s.doc} badge={s.badge}>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {s.tiles.map((t) => (
          <div key={t.label} className="rounded-lg p-3 text-center" style={{ backgroundColor: PANEL.inset }}>
            <p className="font-mono text-2xl font-semibold" style={{ color: PANEL.ink }}>
              {t.value}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: PANEL.muted }}>
              {t.label}
            </p>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs" style={{ color: PANEL.muted }}>
        {s.note}
      </p>
    </MockShell>
  );
}

function Panel({ id }: { id: SourceTab["id"] }) {
  switch (id) {
    case "openfinance":
      return <OpenFinancePanel />;
    case "sefaz":
      return <SefazPanel />;
    case "esocial":
      return <EsocialPanel />;
    case "adquirentes":
      return <AdquirentesPanel />;
    case "pdv":
      return <PdvPanel />;
  }
}

export default function LpSources() {
  const [active, setActive] = useState<SourceTab["id"]>("openfinance");

  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="lp-label mb-4">{DATA_SOURCES.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {DATA_SOURCES.headlinePlain}
            <span style={{ color: "#e54c00" }}>{DATA_SOURCES.headlineEmphasis}</span>
          </h2>
          <p className="lp-body">{DATA_SOURCES.intro}</p>
        </div>

        <div
          role="tablist"
          aria-label="Fontes de dados da operação"
          className="mt-8 flex flex-wrap gap-2"
        >
          {SOURCE_TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`source-tab-${t.id}`}
              aria-selected={active === t.id}
              aria-controls={`source-panel-${t.id}`}
              onClick={() => setActive(t.id)}
              onMouseEnter={() => setActive(t.id)}
              onFocus={() => setActive(t.id)}
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

        <Reveal className="mt-6">
          {SOURCE_TABS.map((t) => (
            <div
              key={t.id}
              role="tabpanel"
              id={`source-panel-${t.id}`}
              aria-labelledby={`source-tab-${t.id}`}
              hidden={active !== t.id}
            >
              <Panel id={t.id} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
