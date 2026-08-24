"use client";

import { useState } from "react";
import Link from "next/link";
import { segmentsData, type SegmentoCmv } from "@/lib/cmv-benchmarks.mjs";
import Image from "next/image";
import { track, TRACKING_EVENTS } from "@/lib/track";

/* ─── Benchmark Data ─── */
/*
 * A tabela de benchmark vem de `@/lib/cmv-benchmarks.mjs` desde 24/08/2026.
 *
 * Havia uma cópia local aqui, com os mesmos onze segmentos e os mesmos
 * percentuais da compartilhada — mas com duas diferenças que ninguém tinha
 * reparado: o nome do primeiro segmento ("Restaurante à la carte" contra
 * "Restaurante à la carte - Tradicional") e o slug do delivery ("delivery"
 * contra "delivery_especializado"). Duas listas do mesmo dado divergem no
 * primeiro reajuste; estas já tinham começado a divergir sozinhas.
 *
 * Trocar o slug foi verificado antes, não presumido: o valor só viajava para a
 * coluna `segment` de `onboarding_diagnostics`, e não há nenhuma linha gravada
 * com os slugs desta tabela (a gravação estava quebrada — ver a rota
 * /api/diagnostics). O tracking manda apenas `ab_variant`, nunca o segmento.
 * Ou seja: não há histórico para preservar.
 */


const taxRegimes = [
  { name: "Simples Nacional", slug: "simples", rate: 8 },
  { name: "Lucro Presumido", slug: "presumido", rate: 15 },
  { name: "Lucro Real", slug: "real", rate: 18 },
  { name: "Não sei / Informar manualmente", slug: "manual", rate: 0 },
];

const CARD_RATE = 2; // 2% taxas de cartão

/* ─── Types ─── */
interface GateData {
  restaurantName: string;
  responsibleName: string;
  email: string;
  phone: string;
  segment: string;
  city: string;
  state: string;
}

interface DiagnosticData {
  taxRegime: string;
  taxRate: number;
  cmoMode: "valor" | "funcionarios";
  cmoValue: number;
  employeesCount: number;
  monthlyRevenue: number;
  salesExpenses: number;
  generalExpenses: number;
  partnerWithdrawal: number;
  cmvPercent: number;
}

interface ResultData {
  totalFixedCosts: number;
  contributionMargin: number;
  breakevenPoint: number;
  revenueGap: number;
  cmvBenchmark: number;
  cmvDiff: number;
  isHealthy: boolean;
}

/* ─── Helpers ─── */
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Main Component ─── */

/*
 * O fluxo é a antiga variante B do teste A/B, fixada por decisão do brief de
 * conversão (docs/brief-gabriel-conversao-20260818.md, §6): números da casa
 * primeiro, gate de contato antes do resultado. O `ab_variant: "B"` continua
 * indo no rastreamento para a série do GA4 não quebrar.
 */
export function DiagnosticoFlow() {
  const [step, setStep] = useState<"hero" | "gate" | "diagnostic" | "result">("hero");
  const [gateData, setGateData] = useState<GateData>({
    restaurantName: "", responsibleName: "", email: "", phone: "", segment: "a_la_carte", city: "", state: "",
  });
  const [diagData, setDiagData] = useState<DiagnosticData>({
    taxRegime: "simples", taxRate: 8, cmoMode: "valor", cmoValue: 0, employeesCount: 0,
    monthlyRevenue: 0, salesExpenses: 0, generalExpenses: 0, partnerWithdrawal: 0, cmvPercent: 35,
  });
  const [result, setResult] = useState<ResultData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const segment = segmentsData.find(s => s.slug === gateData.segment) || segmentsData[0];

  /* ─── Navigation Logic ─── */
  function handleHeroCta() {
    setStep("diagnostic");
  }

  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    calculateAndShow();
  }

  function handleDiagnosticSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("gate");
  }

  function calculateAndShow() {
    const cmo = diagData.cmoMode === "valor" ? diagData.cmoValue : diagData.employeesCount * 2800;
    const totalFixedCosts = cmo + diagData.salesExpenses + diagData.generalExpenses + diagData.partnerWithdrawal;
    const taxRate = diagData.taxRate + CARD_RATE;
    const contributionMargin = 1 - ((diagData.cmvPercent / 100) + (taxRate / 100));
    const breakevenPoint = contributionMargin > 0 ? totalFixedCosts / contributionMargin : 0;
    const revenueGap = diagData.monthlyRevenue - breakevenPoint;
    const cmvBenchmark = segment.defaultCmvTarget;
    const cmvDiff = diagData.cmvPercent - cmvBenchmark;

    const resultData: ResultData = {
      totalFixedCosts,
      contributionMargin: contributionMargin * 100,
      breakevenPoint,
      revenueGap,
      cmvBenchmark,
      cmvDiff,
      isHealthy: revenueGap >= 0,
    };

    setResult(resultData);
    setStep("result");
    // sendToSupabase primeiro: a gravação do lead não pode depender do
    // rastreamento. sendToSupabase é async e não é aguardado aqui, mas o
    // fetch() já é disparado de forma síncrona antes do primeiro `await`
    // dentro dela — o pedido de rede começa antes de track() rodar.
    sendToSupabase(resultData, cmo);
    track(TRACKING_EVENTS.diagnostic, { ab_variant: "B" });
  }

  async function sendToSupabase(resultData: ResultData, cmo: number) {
    setSubmitting(true);
    try {
      const payload = {
        restaurant_name: gateData.restaurantName,
        responsible_name: gateData.responsibleName,
        email: gateData.email,
        phone: gateData.phone,
        segment: gateData.segment,
        city: gateData.city,
        state: gateData.state,
        tax_regime: diagData.taxRegime,
        tax_rate: diagData.taxRate,
        monthly_revenue: diagData.monthlyRevenue,
        cmo_mode: diagData.cmoMode,
        cmo_value: cmo,
        employees_count: diagData.cmoMode === "funcionarios" ? diagData.employeesCount : null,
        sales_expenses: diagData.salesExpenses,
        general_expenses: diagData.generalExpenses,
        partner_withdrawal: diagData.partnerWithdrawal,
        cmv_percent: diagData.cmvPercent,
        total_fixed_costs: resultData.totalFixedCosts,
        contribution_margin: resultData.contributionMargin,
        breakeven_point: resultData.breakevenPoint,
        revenue_gap: resultData.revenueGap,
        source: "lp_diagnostico",
        ab_variant: "B",
        status: "apresentado",
      };

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ezisuahknuspwchwflqq.supabase.co";
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6aXN1YWhrbmVzcHdjaHdmbHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMjI2NzIsImV4cCI6MjA0ODg5ODY3Mn0.GG7iFBuMPOxGPMq3GhJvnKOFBylSFbVfBHNLHTnMBVk";

      await fetch(`${supabaseUrl}/rest/v1/onboarding_diagnostics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to save diagnostic:", err);
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Render ─── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ backgroundColor: "var(--color-header-bg)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/brand/rook-logo-horizontal.webp" alt="Rook System" width={98} height={32} className="hidden dark:block" />
            <Image src="/brand/rook-logo-horizontal-light.webp" alt="Rook System" width={94} height={32} className="dark:hidden" />
          </Link>
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Diagnóstico Gratuito</span>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {step === "hero" && <HeroSection onStart={handleHeroCta} />}
        {step === "gate" && (
          <GateSection data={gateData} onChange={setGateData} onSubmit={handleGateSubmit} />
        )}
        {step === "diagnostic" && (
          <DiagnosticSection
            data={diagData}
            onChange={setDiagData}
            segment={segment}
            onSubmit={handleDiagnosticSubmit}
          />
        )}
        {step === "result" && result && (
          <ResultSection result={result} segment={segment} gateData={gateData} diagData={diagData} />
        )}
      </main>
    </div>
  );
}

/* ─── Hero Section ─── */
function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="section-spacing flex items-center justify-center min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="section-label mb-4">— Diagnóstico Financeiro Gratuito</p>
        <h1 className="heading-hero text-3xl sm:text-5xl lg:text-6xl font-bold mb-6">
          Seu restaurante está no <em>lucro</em> ou no <em>prejuízo</em>?
        </h1>
        <p className="text-body text-lg text-muted max-w-xl mx-auto mb-8">
          Em dois minutos o Rook calcula o ponto de equilíbrio da casa: quanto você precisa faturar para cobrir custos e começar a lucrar de verdade. Sem planilha. Sem cartão.
        </p>
        <ul className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto mb-10 text-left">
          {[
            { n: "01", t: "Números da casa", d: "Faturamento, CMV, folha, despesas." },
            { n: "02", t: "Seus dados", d: "Nome e contato para liberar o resultado." },
            { n: "03", t: "Ponto de equilíbrio", d: "Gap em reais e CMV versus o segmento." },
          ].map((s) => (
            <li key={s.n} className="card p-4">
              <p className="font-mono text-xs" style={{ color: "var(--color-terracota-text)" }}>{s.n}</p>
              <p className="mt-1 text-sm font-bold">{s.t}</p>
              <p className="mt-1 text-xs text-muted">{s.d}</p>
            </li>
          ))}
        </ul>
        <button onClick={onStart} className="btn-primary text-lg px-8 py-4">
          Começar pelos números da casa
        </button>
        <p className="text-xs text-muted mt-4">100% gratuito. Resultado imediato. Sem cartão de crédito.</p>
      </div>
    </section>
  );
}

/* ─── Gate Section ─── */
function GateSection({
  data, onChange, onSubmit,
}: {
  data: GateData;
  onChange: (d: GateData) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const update = (field: keyof GateData, value: string) => onChange({ ...data, [field]: value });

  return (
    <section className="section-spacing flex items-center justify-center min-h-[80vh]">
      <div className="max-w-lg mx-auto px-6 w-full">
        <div className="card p-8 sm:p-10">
          <p className="section-label mb-3">— Último passo</p>
          <h2 className="heading-section text-2xl sm:text-3xl mb-2">Quase lá!</h2>
          <p className="text-muted text-sm mb-6">
            Preencha seus dados para ver o resultado completo do diagnóstico.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField label="Nome do restaurante" value={data.restaurantName} onChange={v => update("restaurantName", v)} required placeholder="Ex: Restaurante Sabor & Arte" />
            <InputField label="Seu nome" value={data.responsibleName} onChange={v => update("responsibleName", v)} required placeholder="Nome do responsável" />
            <InputField label="Email" type="email" value={data.email} onChange={v => update("email", v)} required placeholder="seu@email.com" />
            <PhoneInput label="WhatsApp" value={data.phone} onChange={v => update("phone", v)} required placeholder="(61) 99999-9999" />
            <div>
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Segmento</label>
              <select
                value={data.segment}
                onChange={e => update("segment", e.target.value)}
                className="w-full bg-bg rounded-lg border border-border px-4 py-3 text-sm outline-none cursor-pointer"
                style={{ color: "var(--color-text-primary)" }}
              >
                {segmentsData.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Cidade" value={data.city} onChange={v => update("city", v)} placeholder="Brasília" />
              <InputField label="Estado" value={data.state} onChange={v => update("state", v)} placeholder="DF" />
            </div>
            <button type="submit" className="btn-primary w-full mt-4 py-3">
              Ver meu resultado
            </button>
            {/*
              * A microcopy de confiança fica ABAIXO do botão e não no topo do
              * formulário: é aqui que o visitante decide entregar o contato, e
              * é aqui que ele precisa saber o que acontece com ele. Sem isso, o
              * passo 02 lê como captura de lista fria — e quem chegou até aqui
              * já respondeu faturamento, CMV e folha da casa.
              */}
            <p className="text-muted text-xs leading-relaxed text-center">
              Seus números ficam com você. Usamos o contato só para enviar o resultado — nada de
              spam, nada de lista fria.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── Diagnostic Section ─── */
function DiagnosticSection({
  data, onChange, segment, onSubmit,
}: {
  data: DiagnosticData;
  onChange: (d: DiagnosticData) => void;
  segment: SegmentoCmv;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const update = <K extends keyof DiagnosticData>(field: K, value: DiagnosticData[K]) =>
    onChange({ ...data, [field]: value });

  function handleRegimeChange(slug: string) {
    const regime = taxRegimes.find(r => r.slug === slug);
    update("taxRegime", slug);
    if (regime && slug !== "manual") {
      update("taxRate", regime.rate);
    }
  }

  return (
    <section className="section-spacing flex items-center justify-center min-h-[80vh]">
      <div className="max-w-lg mx-auto px-6 w-full">
        <div className="card p-8 sm:p-10">
          <p className="section-label mb-3">— Passo 1 de 2</p>
          <h2 className="heading-section text-2xl sm:text-3xl mb-2">Dados financeiros</h2>
          <p className="text-muted text-sm mb-6">
            Preencha com os dados aproximados do seu restaurante. Quanto mais preciso, melhor o diagnóstico.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Tax Regime */}
            <div>
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Regime tributário</label>
              <select
                value={data.taxRegime}
                onChange={e => handleRegimeChange(e.target.value)}
                className="w-full bg-bg rounded-lg border border-border px-4 py-3 text-sm outline-none cursor-pointer"
                style={{ color: "var(--color-text-primary)" }}
              >
                {taxRegimes.map(r => (
                  <option key={r.slug} value={r.slug}>{r.name} {r.slug !== "manual" ? `(~${r.rate}%)` : ""}</option>
                ))}
              </select>
            </div>
            {data.taxRegime === "manual" && (
              <CurrencyInput label="Alíquota de impostos (%)" value={data.taxRate} onChange={v => update("taxRate", v)} suffix="%" />
            )}

            {/* CMO */}
            <div>
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Custo com mão de obra (CMO)</label>
              <select
                value={data.cmoMode}
                onChange={e => update("cmoMode", e.target.value as "valor" | "funcionarios")}
                className="w-full bg-bg rounded-lg border border-border px-4 py-3 text-sm outline-none cursor-pointer mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                <option value="valor">Informar valor em R$</option>
                <option value="funcionarios">Informar nº de funcionários</option>
              </select>
              {data.cmoMode === "valor" ? (
                <CurrencyInput label="" value={data.cmoValue} onChange={v => update("cmoValue", v)} placeholder="Ex: 25.000" />
              ) : (
                <div>
                  <CurrencyInput label="" value={data.employeesCount} onChange={v => update("employeesCount", v)} placeholder="Ex: 12" suffix=" func." isInteger />
                  <p className="text-[10px] text-muted mt-1">Estimativa: {data.employeesCount} x R$ 2.800 = {formatCurrency(data.employeesCount * 2800)}</p>
                </div>
              )}
            </div>

            {/* Revenue */}
            <CurrencyInput label="Faturamento mensal" value={data.monthlyRevenue} onChange={v => update("monthlyRevenue", v)} placeholder="Ex: 150.000" />

            {/* Expenses */}
            <CurrencyInput label="Despesas com vendas (embalagens, delivery, comissões)" value={data.salesExpenses} onChange={v => update("salesExpenses", v)} placeholder="Ex: 8.000" />
            <CurrencyInput label="Despesas gerais (aluguel, energia, água, manutenção)" value={data.generalExpenses} onChange={v => update("generalExpenses", v)} placeholder="Ex: 20.000" />
            <CurrencyInput label="Retirada dos sócios (pró-labore)" value={data.partnerWithdrawal} onChange={v => update("partnerWithdrawal", v)} placeholder="Ex: 10.000" />

            {/* CMV */}
            <div>
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">CMV médio estimado</label>
              <p className="text-2xl font-bold text-center text-terracota mb-1">{data.cmvPercent}%</p>
              <input
                type="range"
                min={15}
                max={60}
                value={data.cmvPercent}
                onChange={e => update("cmvPercent", Number(e.target.value))}
                className="w-full accent-terracota"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>15%</span>
                <span>60%</span>
              </div>
              <p className="text-[10px] text-muted mt-2">
                Benchmark para <strong className="text-cream">{segment.name}</strong>:{" "}
                <span className="text-ocre font-semibold">{segment.defaultCmvTarget}%</span>{" "}
                (faixa: {segment.cmvMin}% a {segment.cmvMax}%)
              </p>
            </div>

            <button type="submit" className="btn-primary w-full mt-4 py-3">
              Continuar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── Result Section ─── */
function ResultSection({
  result, segment, gateData, diagData,
}: {
  result: ResultData;
  segment: SegmentoCmv;
  gateData: GateData;
  diagData: DiagnosticData;
}) {
  const insightText = result.isHealthy
    ? `${gateData.restaurantName || "Seu restaurante"} fatura acima do Ponto de Equilíbrio. Sua margem de segurança é de ${formatCurrency(result.revenueGap)}. Mas atenção: se o CMV subir ${result.cmvDiff > 0 ? "mais" : ""}, essa margem desaparece rapidamente.`
    : `${gateData.restaurantName || "Seu restaurante"} precisa faturar pelo menos ${formatCurrency(result.breakevenPoint)} para cobrir todos os custos. Hoje fatura ${formatCurrency(diagData.monthlyRevenue)}, ou seja, está ${formatCurrency(Math.abs(result.revenueGap))} abaixo do mínimo necessário.`;

  return (
    <section className="section-spacing flex items-center justify-center min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-6 w-full">
        <div className="card p-8 sm:p-10">
          <p className="section-label mb-3">— Resultado do Diagnóstico</p>
          <h2 className="heading-section text-2xl sm:text-3xl mb-6">
            {gateData.restaurantName || "Seu Restaurante"}
          </h2>

          {/* Main KPI */}
          <div className="bg-bg rounded-xl border border-border p-6 mb-6 text-center">
            <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">Ponto de Equilíbrio Mensal</p>
            <p className="text-4xl sm:text-5xl font-bold text-cream mb-2">{formatCurrency(result.breakevenPoint)}</p>
            <p className="text-sm text-muted">Faturamento mínimo para não ter prejuízo</p>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`rounded-xl border p-4 text-center ${result.isHealthy ? "border-floresta/30 bg-floresta/5" : "border-terracota/30 bg-terracota/5"}`}>
              <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">Faturamento Atual</p>
              <p className={`text-xl font-bold ${result.isHealthy ? "text-floresta" : "text-terracota"}`}>
                {formatCurrency(diagData.monthlyRevenue)}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 text-center">
              <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">Ponto de Equilíbrio</p>
              <p className="text-xl font-bold text-cream">{formatCurrency(result.breakevenPoint)}</p>
            </div>
          </div>

          {/* Gap indicator */}
          <div className={`rounded-lg p-4 mb-6 ${result.isHealthy ? "bg-floresta/10 border border-floresta/20" : "bg-terracota/10 border border-terracota/20"}`}>
            <p className={`text-sm font-semibold ${result.isHealthy ? "text-floresta" : "text-terracota"}`}>
              {result.isHealthy ? "Acima do Ponto de Equilíbrio" : "Abaixo do Ponto de Equilíbrio"}
            </p>
            <p className={`text-xs mt-1 ${result.isHealthy ? "text-floresta/80" : "text-terracota/80"}`}>
              Gap: {formatCurrency(Math.abs(result.revenueGap))} {result.isHealthy ? "de margem de segurança" : "de déficit mensal"}
            </p>
          </div>

          {/* CMV Benchmark */}
          <div className="bg-bg rounded-xl border border-border p-4 mb-6">
            <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">CMV vs. Benchmark do Segmento</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Seu CMV</p>
                <p className={`text-lg font-bold ${result.cmvDiff > 0 ? "text-terracota" : "text-floresta"}`}>{diagData.cmvPercent}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted">vs.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Ideal ({segment.name})</p>
                <p className="text-lg font-bold text-ocre">{segment.defaultCmvTarget}%</p>
              </div>
            </div>
            {result.cmvDiff > 0 && (
              <p className="text-xs text-terracota mt-2">
                Seu CMV está {result.cmvDiff.toFixed(1).replace(".", ",")} pontos acima da referência do segmento — cerca de {formatCurrency((result.cmvDiff / 100) * diagData.monthlyRevenue)} a mais em custos por mês.
              </p>
            )}
          </div>

          {/* Insight */}
          <div className="bg-bg-elevated rounded-xl p-5 mb-8 border-l-4 border-ocre">
            <p className="font-mono text-[10px] text-ocre uppercase tracking-wider mb-2">Insight Rook</p>
            <p className="text-sm text-cream leading-relaxed">{insightText}</p>
          </div>

          {/* Composition */}
          <div className="bg-bg rounded-xl border border-border p-4 mb-8">
            <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">Composição dos Custos Fixos</p>
            <div className="space-y-2 text-sm">
              <CompositionRow label="Mão de obra (CMO)" value={diagData.cmoMode === "valor" ? diagData.cmoValue : diagData.employeesCount * 2800} total={result.totalFixedCosts} />
              <CompositionRow label="Despesas com vendas" value={diagData.salesExpenses} total={result.totalFixedCosts} />
              <CompositionRow label="Despesas gerais" value={diagData.generalExpenses} total={result.totalFixedCosts} />
              <CompositionRow label="Retirada dos sócios" value={diagData.partnerWithdrawal} total={result.totalFixedCosts} />
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between text-sm font-semibold">
              <span className="text-cream">Total custos fixos</span>
              <span className="text-cream">{formatCurrency(result.totalFixedCosts)}</span>
            </div>
          </div>

          {/*
            * O FECHO (24/08/2026). Duas correções.
            *
            * A ÂNCORA: o resultado entregava o número e passava direto ao
            * botão. Aqui o próprio número da casa vira a razão do próximo
            * passo — é o dado mais persuasivo da página inteira, e ele é dele,
            * não de um exemplo. O texto muda conforme a casa esteja acima ou
            * abaixo do ponto de equilíbrio: chamar margem de segurança de
            * "déficit" seria mentir para quem está bem.
            *
            * O CARTÃO: dizia "7 dias grátis. Cancele quando quiser." O teste
            * pede cartão no início, e a /planos explica isso com data. Prometer
            * "grátis" aqui e mostrar o campo de cartão no clique seguinte é o
            * jeito mais caro de perder quem já entregou os números da casa.
            */}
          <div className="text-center">
            <p className="text-cream text-base leading-relaxed mb-2">
              {result.isHealthy
                ? `Esse é o tamanho da sua folga: ${formatCurrency(Math.abs(result.revenueGap))} por mês acima do ponto de equilíbrio.`
                : `Esse é o tamanho do jogo: ${formatCurrency(Math.abs(result.revenueGap))} por mês entre onde a casa está e onde ela empata.`}
            </p>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              {result.isHealthy
                ? "O Rook existe para essa folga não sumir sem aviso: acompanha as seis paradas do dinheiro todo dia e avisa quando uma delas começa a comer a margem — em reais."
                : "O Rook existe para achar onde esse dinheiro está escapando — parada por parada, em reais, todo dia."}
            </p>
            <Link href="/planos/" className="btn-primary text-lg px-8 py-4 inline-block">
              Testar o Rook por 7 dias
            </Link>
            <p className="text-[10px] text-muted mt-3">
              7 dias de uso. O cartão entra no início e a data da primeira cobrança aparece antes de
              você confirmar — cancelando antes dela, nada é cobrado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Utility Components ─── */
function InputField({
  label, value, onChange, type = "text", required = false, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      {label && <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-bg rounded-lg border border-border px-4 py-3 text-sm outline-none placeholder:text-muted/50"
        style={{ color: "var(--color-text-primary)" }}
      />
    </div>
  );
}

function PhoneInput({
  label, value, onChange, required = false, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string;
}) {
  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  }

  return (
    <div>
      {label && <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">{label}</label>}
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        maxLength={15}
        className="w-full bg-bg rounded-lg border border-border px-4 py-3 text-sm outline-none placeholder:text-muted/50"
        style={{ color: "var(--color-text-primary)" }}
      />
    </div>
  );
}

function CurrencyInput({
  label, value, onChange, placeholder = "", suffix = "", isInteger = false,
}: {
  label: string; value: number; onChange: (v: number) => void;
  placeholder?: string; suffix?: string; isInteger?: boolean;
}) {
  return (
    <div>
      {label && <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">{label}</label>}
      <div className="flex items-center bg-bg rounded-lg border border-border px-4 py-3">
        {!suffix && <span className="text-muted text-sm mr-2">R$</span>}
        <input
          type="text"
          value={value === 0 ? "" : (isInteger ? value.toString() : value.toLocaleString("pt-BR"))}
          onChange={e => {
            const raw = e.target.value.replace(/\D/g, "");
            onChange(Number(raw) || 0);
          }}
          placeholder={placeholder}
          className="bg-transparent text-sm font-semibold w-full outline-none"
          style={{ color: "var(--color-text-primary)" }}
        />
        {suffix && <span className="text-muted text-sm ml-2">{suffix}</span>}
      </div>
    </div>
  );
}

function CompositionRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-ocre rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-cream font-medium w-24 text-right">{formatCurrency(value)}</span>
      </div>
    </div>
  );
}
