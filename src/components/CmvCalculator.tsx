"use client";

import { useState } from "react";
import Link from "next/link";
import { segmentsData } from "@/lib/cmv-benchmarks.mjs";

/*
 * A tabela de benchmark mora em `@/lib/cmv-benchmarks` desde 24/08/2026: a
 * página de segmentos passou a citar os mesmos números e duas listas do mesmo
 * dado divergem no primeiro reajuste. Continua reexportada aqui porque havia
 * import a partir deste arquivo — remover quebraria quem já importava.
 */
export { segmentsData };

export function CmvCalculator() {
  const [faturamento, setFaturamento] = useState(100000);
  const [cmv, setCmv] = useState(38);
  const [selectedSegment, setSelectedSegment] = useState("a_la_carte");
  const [result, setResult] = useState<{ economia: number; ideal: number; diferenca: number } | null>(null);

  const segment = segmentsData.find(s => s.slug === selectedSegment) || segmentsData[0];

  const calcular = () => {
    const ideal = segment.defaultCmvTarget;
    const diferenca = cmv - ideal;
    const economiaAnual = (diferenca / 100) * faturamento * 12;
    setResult({ economia: economiaAnual, ideal, diferenca });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
      {/* Form */}
      <div className="card p-8">
        <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-2">
          Qual o segmento do seu restaurante?
        </label>
        <div className="flex items-center gap-2 bg-bg rounded-lg border border-border px-4 py-3 mb-6">
          <select
            value={selectedSegment}
            onChange={(e) => {
              setSelectedSegment(e.target.value);
              setResult(null);
            }}
            className="bg-transparent text-cream text-base font-semibold w-full outline-none cursor-pointer"
            style={{ colorScheme: "dark" }}
          >
            {segmentsData.map((s) => (
              <option key={s.slug} value={s.slug} className="bg-bg text-cream">
                {s.name}
              </option>
            ))}
          </select>
        </div>

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
        <p className="text-2xl font-bold text-center text-terracota mb-2">{cmv}%</p>
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
        <div className="text-xs text-muted mt-4 leading-relaxed">
          CMV de referência para <strong className="text-cream">{segment.name}</strong>:{" "}
          <span className="text-ocre font-semibold">{segment.defaultCmvTarget}%</span>.
          A faixa saudável recomendada fica entre{" "}
          <span className="text-ocre font-semibold">{segment.cmvMin}% e {segment.cmvMax}%</span> da receita líquida.
          <span className="block mt-2 text-[10px] text-muted/60">
            * Fonte: Rook - Benchmark 2026
          </span>
        </div>

        <button onClick={calcular} className="btn-primary w-full mt-6">
          Calcular potencial de economia
        </button>
      </div>

      {/* Result */}
      <div className="card p-8 flex flex-col justify-center min-h-[380px]">
        {result ? (
          <>
            <p className="font-mono text-xs text-ocre uppercase tracking-wider mb-3">Resultado da simulação</p>
            {result.diferenca > 0 ? (
              <>
                <p className="text-sm text-muted mb-4">
                  Seu CMV de <span className="text-cream font-semibold">{cmv}%</span> está{" "}
                  <span className="text-terracota font-semibold">{result.diferenca.toFixed(1)}% acima</span> da meta ideal para{" "}
                  <strong className="text-cream">{segment.name}</strong> ({result.ideal}%). A economia anual projetada é de:
                </p>
                <p className="text-4xl font-bold text-floresta mb-2">
                  R$ {result.economia.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-muted mb-6">em lucro líquido recuperado</p>
                
                <div className="bg-bg rounded-lg border border-border p-4 mb-6">
                  <p className="text-xs text-muted leading-relaxed">
                    <strong className="text-cream">O que isso significa?</strong> Ao otimizar as compras e fichas técnicas para atingir o benchmark, essa economia é revertida diretamente como margem líquida (lucro líquido que vai para o seu bolso), sem precisar vender uma única mesa a mais.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-lg font-bold text-cream">
                      R$ {(result.economia / 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted font-light">por mês recuperados</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-cream">
                      +{result.diferenca.toFixed(1)}pp
                    </p>
                    <p className="text-xs text-muted font-light">de margem de lucro a mais</p>
                  </div>
                </div>

                <Link href="/planos/" className="btn-primary w-full text-center">
                  Ativar controle automático grátis
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted mb-4">
                  Parabéns! Seu CMV de <span className="text-floresta font-semibold">{cmv}%</span> está dentro ou abaixo da meta ideal para{" "}
                  <strong className="text-cream">{segment.name}</strong> ({result.ideal}%).
                </p>
                <p className="text-base text-cream font-medium mb-6">
                  Sua operação está saudável! O Rook System pode te ajudar a manter essa disciplina e automatizar a conciliação das notas fiscais sem planilhas manuais.
                </p>
                <Link href="/planos/" className="btn-primary w-full text-center">
                  Conhecer o Rook System
                </Link>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-border/50 text-ocre flex items-center justify-center mx-auto mb-4 font-mono text-lg font-bold">
              %
            </div>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Selecione seu segmento, preencha os dados e clique em <strong className="text-cream">&ldquo;Calcular&rdquo;</strong> para projetar seu resultado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
