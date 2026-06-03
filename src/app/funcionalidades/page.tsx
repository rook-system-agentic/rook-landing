"use client";
import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

/* ─── Calculator Section ─── */
function Calculator() {
  const [faturamento, setFaturamento] = useState(100000);
  const [cmv, setCmv] = useState(38);
  const [result, setResult] = useState<{ economia: number; ideal: number } | null>(null);

  const calcular = () => {
    const ideal = 30;
    const economiaAnual = ((cmv - ideal) / 100) * faturamento * 12;
    setResult({ economia: economiaAnual, ideal });
  };

  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="section-label mb-4">— Calculadora interativa</p>
        <h2 className="text-3xl lg:text-4xl font-bold mb-3">
          Qual o impacto do CMV no seu <em className="not-italic text-terracota">lucro?</em>
        </h2>
        <p className="text-muted max-w-xl mb-10">
          Simule o potencial de economia ao otimizar seu Custo de Mercadoria Vendida para a faixa ideal do seu segmento.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="card p-8">
            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-2">
              Qual seu faturamento mensal?
            </label>
            <div className="flex items-center gap-2 bg-bg rounded-lg border border-border px-4 py-3 mb-6">
              <span className="text-muted text-sm">R$</span>
              <input
                type="text"
                value={faturamento.toLocaleString("pt-BR")}
                onChange={(e) => setFaturamento(Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="bg-transparent text-cream text-lg font-semibold w-full outline-none"
              />
            </div>

            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-2">
              Qual seu CMV atual (estimado)?
            </label>
            <p className="text-2xl font-bold text-center text-cream mb-2">{cmv}%</p>
            <input
              type="range"
              min={20}
              max={60}
              value={cmv}
              onChange={(e) => setCmv(Number(e.target.value))}
              className="w-full accent-terracota mb-2"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>20%</span>
              <span>60%</span>
            </div>
            <p className="text-xs text-muted mt-2">
              Referência ideal: <span className="text-ocre font-semibold">30%</span> sobre a receita líquida.
            </p>

            <button onClick={calcular} className="btn-primary w-full mt-6">
              Calcular potencial de economia
            </button>
          </div>

          {/* Result */}
          <div className="card p-8 flex flex-col justify-center min-h-[320px]">
            {result ? (
              <>
                <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">Resultado da simulação</p>
                <p className="text-sm text-muted mb-4">
                  Se você reduzir seu CMV de <span className="text-cream font-semibold">{cmv}%</span> para{" "}
                  <span className="text-floresta font-semibold">{result.ideal}%</span>, a economia projetada é:
                </p>
                <p className="text-4xl font-bold text-floresta mb-2">
                  R$ {result.economia.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-muted">por ano em economia potencial</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted mb-3">Isso equivale a:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg font-bold text-cream">
                        R$ {(result.economia / 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted">por mês</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-cream">
                        {((cmv - result.ideal) * faturamento / 100 / faturamento * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted">de margem recuperada</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-terracota/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" fill="none" stroke="#E54C00" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 7h6m-6 4h6m-3 4v3m-5 2h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-muted text-sm">Preencha os dados ao lado e clique em <strong className="text-cream">&ldquo;Calcular&rdquo;</strong> para ver o resultado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PDF Demo ─── */
function PdfDemo() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Mock PDF pages */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-muted">ROOK</span>
              <span className="font-mono text-xs text-muted">Anual · 2025</span>
            </div>
            <p className="section-label mb-1">— Análise financeira</p>
            <p className="text-sm font-semibold text-cream">Diagnóstico Anual</p>
            <p className="text-xs text-muted mt-1">Restaurante Exemplo</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold text-floresta">83</span>
              <span className="text-xs text-muted">Score geral · Bom</span>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-muted">ROOK</span>
              <span className="font-mono text-xs text-muted">Painel · 03/11</span>
            </div>
            <p className="section-label mb-1">— Painel de saúde</p>
            <p className="text-xs text-muted mb-3">6 áreas avaliadas de 0 a 100</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { area: "Vendas", score: 72, color: "text-floresta" },
                { area: "Custos", score: 88, color: "text-floresta" },
                { area: "Impostos", score: 52, color: "text-ocre" },
                { area: "Despesas", score: 68, color: "text-floresta" },
                { area: "Endivid.", score: 85, color: "text-floresta" },
                { area: "Resultado", score: 48, color: "text-red-400" },
              ].map((p) => (
                <div key={p.area}>
                  <p className={`text-sm font-bold ${p.color}`}>{p.score}</p>
                  <p className="text-[10px] text-muted">{p.area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="section-label mb-4">— Relatório anual</p>
          <h2 className="text-3xl font-bold mb-6">
            O relatório que <em className="not-italic text-terracota">seu contador respeita.</em>
          </h2>
          <ul className="space-y-4">
            {[
              { title: "Diagnóstico de cada área", desc: "Como um especialista contando a história: o que está acontecendo, por que importa e o que fazer." },
              { title: "Resultado em gráfico e tabela", desc: "Da receita ao lucro, com gráfico ao lado dos números. Você vê onde o dinheiro está indo." },
              { title: "Uma nota de 0 a 100 por área", desc: "Crítico, Atenção, Bom ou Excelente — em cada uma das 6 áreas do seu negócio." },
              { title: "Cada sugestão com impacto em R$", desc: "\"Trocar regime tributário → R$ 124k de economia/ano\". Você sabe quanto cada ação vale." },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="text-terracota mt-1">•</span>
                <div>
                  <p className="font-semibold text-cream text-sm">{item.title}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─── Chess Multi-CNPJ ─── */
function Chess() {
  const units = [
    { name: "Centro", score: 92 },
    { name: "Asa Sul", score: 87 },
    { name: "Águas Claras", score: 81 },
    { name: "Gama", score: 76 },
    { name: "Taguatinga", score: 72 },
    { name: "Sobradinho", score: 68 },
  ];

  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="section-label mb-4">— Plano Chess · Multi-CNPJ</p>
        <h2 className="text-3xl lg:text-4xl font-bold mb-3">
          Para quem comanda mais de <em className="not-italic text-terracota">uma unidade.</em>
        </h2>
        <p className="text-muted max-w-2xl mb-12">
          Quando o negócio passa de uma loja para uma rede, o jogo muda — e a comparação entre unidades vira a ferramenta-chave.
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Features */}
          <div className="space-y-8">
            {[
              { n: "01", title: "Painel do grupo", desc: "Score consolidado, DRE somada, 6 pilares por filial. Visão de holding sem planilha." },
              { n: "02", title: "Ranking automático", desc: "Qual unidade tem o melhor CMV. Onde a margem está apertando. Sem cruzamento manual." },
              { n: "03", title: "Benchmark interno", desc: "A média do grupo vira o benchmark — cada filial sabe quanto está acima ou abaixo." },
            ].map((f) => (
              <div key={f.n} className="flex gap-4">
                <span className="text-terracota font-mono font-bold text-lg">{f.n}</span>
                <div>
                  <p className="font-semibold text-cream">{f.title}</p>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ranking grid */}
          <div className="grid grid-cols-3 gap-3">
            {units.map((u) => (
              <div key={u.name} className="card p-4 text-center">
                <p className="text-xl font-bold text-floresta">{u.score}</p>
                <p className="text-xs text-muted mt-1">{u.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function FuncCTA() {
  return (
    <section className="py-24 border-t border-border text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="section-label mb-4">— Pronto para ver os seus números?</p>
        <h2 className="text-3xl font-bold mb-4">Comece <em className="not-italic text-terracota">grátis.</em></h2>
        <p className="text-muted mb-8">Plano Pawn sem cartão de crédito. Quando quiser mais, evolua para Knight, Rook ou Chess.</p>
        <Link href="/planos/" className="btn-primary">Ver planos →</Link>
      </div>
    </section>
  );
}

export default function FuncionalidadesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-4">— Funcionalidades</p>
          <h1 className="text-3xl lg:text-[2.8rem] font-bold leading-tight mb-6 max-w-3xl">
            Três ferramentas, um <em className="not-italic text-terracota">único objetivo:</em> mostrar onde está seu dinheiro.
          </h1>
          <p className="text-muted max-w-2xl">
            Comece pela <strong className="text-cream">Calculadora</strong> para ver, em segundos, quanto seu CMV pode estar custando.
            Depois explore o <strong className="text-cream">Relatório Anual</strong> — o documento que seu contador respeita.
            E quando crescer, o <strong className="text-cream">Chess</strong> coloca todas as suas unidades no mesmo tabuleiro.
          </p>
        </div>
      </section>
      <Calculator />
      <PdfDemo />
      <Chess />
      <FuncCTA />
    </>
  );
}
