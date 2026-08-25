import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
import { COMPANY_INFO } from "@/lib/company";
import { BENCHMARK_FONTE } from "@/lib/cmv-benchmarks.mjs";
import {
  SOBRE_HERO,
  SOBRE_METODO,
  SOBRE_PROVA,
  SOBRE_COMPOSICAO,
  SOBRE_PRODUTO,
  SOBRE_EMPRESA,
  SOBRE_CTA,
} from "@/lib/lp-content";

export const metadata: Metadata = {
  title: "Sobre o Rook | Rook System",
  description:
    "Vinte anos de controladoria, uma contabilidade de quarenta anos e o trabalho de virar os dois em software. Quem está por trás do Rook, e o que cada origem entrega dentro do produto.",
  alternates: { canonical: siteUrl("/sobre/") },
};

/**
 * As trajetórias que compõem a sociedade, em anos de prática.
 *
 * POR QUE ISTO É UMA BARRA E NÃO UMA LINHA DO TEMPO
 *
 * Linha do tempo sugere sequência — como se uma coisa tivesse virado a outra.
 * Não é o caso: são trajetórias PARALELAS, de pessoas diferentes, que se
 * encontraram. A barra compara duração sem inventar cronologia, e a nota
 * abaixo diz isso em uma linha para ninguém somar o que não soma.
 *
 * Os números vêm do PO (25/08/2026) e são deliberadamente redondos: "mais de
 * quarenta", "vinte", "oito". Precisão falsa em biografia é pior que
 * arredondamento honesto.
 */
const TRAJETORIAS = [
  { label: "Contabilidade e auditoria", anos: 40, exibicao: "40+ anos", origem: "Polla Contadores e Auditores" },
  { label: "Controladoria e reestruturação", anos: 20, exibicao: "20 anos", origem: "consultoria em finanças corporativas" },
  { label: "Controladoria, gestão e tecnologia", anos: 8, exibicao: "8 anos", origem: "o trabalho de virar método em produto" },
] as const;

const MAIOR_TRAJETORIA = Math.max(...TRAJETORIAS.map((t) => t.anos));

function AnosDePratica() {
  return (
    <div className="card p-6 sm:p-8">
      <p className="section-label mb-6">— Anos de prática entre os sócios</p>
      <ul className="flex flex-col gap-5">
        {TRAJETORIAS.map((t) => (
          <li key={t.label}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm font-semibold" style={{ color: "var(--color-cream)" }}>
                {t.label}
              </span>
              <span
                className="font-mono text-sm font-semibold"
                style={{ color: "var(--color-terracota-text)" }}
              >
                {t.exibicao}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--color-bg-elevated)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(t.anos / MAIOR_TRAJETORIA) * 100}%`,
                  backgroundColor: "var(--color-cta)",
                }}
              />
            </div>
            <p className="mt-1.5 text-xs" style={{ color: "var(--color-muted)" }}>
              {t.origem}
            </p>
          </li>
        ))}
      </ul>
      <p
        className="mt-6 pt-4 text-xs leading-relaxed"
        style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)" }}
      >
        São trajetórias paralelas, de pessoas diferentes, que se encontraram no Rook — não uma
        soma, nem uma sequência.
      </p>
    </div>
  );
}

export default function SobrePage() {
  return (
    <>
      <section className="section-spacing">
        <div className="mx-auto max-w-7xl px-6">
          <p className="section-label mb-6">{SOBRE_HERO.label}</p>
          <h1 className="heading-hero mb-8">
            {SOBRE_HERO.headlinePlain}
            <em>{SOBRE_HERO.headlineEmphasis}</em>
          </h1>
          <p className="text-body max-w-2xl">{SOBRE_HERO.lead}</p>
        </div>
      </section>

      {/* De onde vem o método — a home dá o resumo; aqui vai o que não cabe lá. */}
      <section className="section-spacing border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <p className="section-label mb-6">{SOBRE_METODO.label}</p>
          <h2 className="heading-section mb-10 max-w-4xl">
            {SOBRE_METODO.headlinePlain}
            <em>{SOBRE_METODO.headlineEmphasis}</em>
          </h2>
          <div className="max-w-2xl space-y-6 text-[17px] leading-relaxed text-muted">
            {SOBRE_METODO.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          {/*
            * A prova. É o único argumento da página que o visitante confere
            * sozinho, e por isso ganha destaque e saída própria: o benchmark
            * que a calculadora mostra é a pesquisa que nasceu daquelas
            * consultorias. Ver SOBRE_PROVA em lp-content.
            */}
          <div className="card mt-12 max-w-3xl p-6 sm:p-8">
            <p className="section-label mb-4">{SOBRE_METODO.provaLabel}</p>
            <p className="text-[17px] leading-relaxed" style={{ color: "var(--color-cream)" }}>
              {SOBRE_PROVA.texto}{" "}
              <strong style={{ color: "var(--color-terracota-text)" }}>{BENCHMARK_FONTE}</strong>,{" "}
              {SOBRE_PROVA.textoFim}
            </p>
            <Link
              href={SOBRE_PROVA.ctaHref}
              className="mt-5 inline-block font-mono text-xs uppercase tracking-wider underline underline-offset-4"
              style={{ color: "var(--color-terracota-text)" }}
            >
              {SOBRE_PROVA.ctaLabel} →
            </Link>
          </div>
        </div>
      </section>

      {/* Quem está por trás */}
      <section className="section-spacing border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <p className="section-label mb-6">{SOBRE_COMPOSICAO.label}</p>
          <h2 className="heading-section mb-4 max-w-4xl">
            {SOBRE_COMPOSICAO.headlinePlain}
            <em>{SOBRE_COMPOSICAO.headlineEmphasis}</em>
          </h2>
          <p className="text-body mb-12">{SOBRE_COMPOSICAO.intro}</p>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <ul className="grid gap-5 sm:grid-cols-2">
              {SOBRE_COMPOSICAO.blocos.map((b) => (
                <li key={b.n} className="card flex h-full flex-col p-6">
                  <span className="font-mono text-2xl font-bold text-ocre">{b.n}</span>
                  <h3 className="heading-sub mb-3 mt-3">{b.titulo}</h3>
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {b.texto}
                  </p>
                  {b.assinatura && (
                    <p
                      className="mt-5 pt-4 font-mono text-xs uppercase tracking-wider"
                      style={{
                        borderTop: "1px solid var(--color-border)",
                        color: "var(--color-terracota-text)",
                      }}
                    >
                      — {b.assinatura}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <AnosDePratica />
          </div>
        </div>
      </section>

      {/* Como isso aparece na tela */}
      <section className="section-spacing border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <p className="section-label mb-6">{SOBRE_PRODUTO.label}</p>
          <h2 className="heading-section mb-4 max-w-4xl">
            {SOBRE_PRODUTO.headlinePlain}
            <em>{SOBRE_PRODUTO.headlineEmphasis}</em>
          </h2>
          <p className="text-body mb-12">{SOBRE_PRODUTO.intro}</p>

          <ul className="grid gap-6 md:grid-cols-3">
            {SOBRE_PRODUTO.principios.map((p) => (
              <li key={p.n} className="card p-8">
                <span className="font-mono text-3xl font-bold text-ocre">{p.n}</span>
                <h3 className="heading-sub mb-3 mt-4">{p.titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {p.texto}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/*
        * A empresa. Os dados vêm de `lib/company.ts` — a mesma fonte do rodapé
        * e das páginas jurídicas, nada digitado aqui. Existe porque é o que
        * separa empresa de landing page para quem vai ligar o Rook ao banco.
        */}
      <section className="section-spacing border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <p className="section-label mb-6">{SOBRE_EMPRESA.label}</p>
          <h2 className="heading-section mb-4 max-w-4xl">
            {SOBRE_EMPRESA.headlinePlain}
            <em>{SOBRE_EMPRESA.headlineEmphasis}</em>
          </h2>
          <p className="text-body mb-10">{SOBRE_EMPRESA.intro}</p>

          <dl className="card grid gap-x-10 gap-y-6 p-6 sm:grid-cols-2 sm:p-8">
            {[
              { termo: "Razão social", valor: COMPANY_INFO.razaoSocial },
              { termo: "CNPJ", valor: COMPANY_INFO.cnpj },
              { termo: "Natureza jurídica", valor: COMPANY_INFO.naturezaJuridica },
              { termo: "Sede", valor: COMPANY_INFO.endereco },
            ].map((linha) => (
              <div key={linha.termo}>
                <dt className="section-label mb-2">{linha.termo}</dt>
                <dd className="text-sm leading-relaxed" style={{ color: "var(--color-cream)" }}>
                  {linha.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-spacing border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
          <div>
            <p className="section-label mb-4">{SOBRE_CTA.label}</p>
            <h2 className="heading-section mb-3">
              {SOBRE_CTA.headlinePlain}
              <em>{SOBRE_CTA.headlineEmphasis}</em>
            </h2>
            <p className="text-body">{SOBRE_CTA.texto}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href={SOBRE_CTA.primaryHref} className="btn-primary whitespace-nowrap">
              {SOBRE_CTA.primaryLabel}
            </Link>
            <Link href={SOBRE_CTA.secondaryHref} className="btn-ghost whitespace-nowrap">
              {SOBRE_CTA.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
