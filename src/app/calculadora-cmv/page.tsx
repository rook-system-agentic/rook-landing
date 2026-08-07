"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalculadoraCmvPage() {
  const [faturamento, setFaturamento] = useState<number>(100000);
  const [compras, setCompras] = useState<number>(32000);

  const cmvPorcentagem = faturamento > 0 ? (compras / faturamento) * 100 : 0;

  const getStatusCMV = (cmv: number) => {
    if (cmv === 0) return { label: "Informe os valores", color: "text-muted", bg: "bg-card border-border", desc: "Digite o faturamento e compras acima." };
    if (cmv < 28) return { label: "CMV Baixo / Excelente", color: "text-floresta", bg: "bg-floresta/10 border-floresta/30", desc: "Sua margem bruta está protegida. Mantenha a padronização das fichas técnicas." };
    if (cmv <= 35) return { label: "CMV Saudável (Faixa Ideal)", color: "text-floresta", bg: "bg-floresta/10 border-floresta/30", desc: "Seu CMV está dentro da média ideal praticada pelos melhores restaurantes do mercado (28% a 35%)." };
    if (cmv <= 42) return { label: "Atenção — Margem Apertada", color: "text-ocre", bg: "bg-ocre/10 border-ocre/30", desc: "Seu CMV está elevado. É recomendado auditar preços de fornecedores e desperdícios na cozinha." };
    return { label: "Alerta Crítico — CMV Alto", color: "text-terracota", bg: "bg-terracota/10 border-terracota/30", desc: "Mais de 42% da sua receita está indo direto para insumos. Há risco iminente de prejuízo operacional." };
  };

  const status = getStatusCMV(cmvPorcentagem);

  return (
    <div className="section-spacing">
      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb / Category */}
        <div className="text-center mb-8">
          <p className="section-label mb-3">— Ferramenta Gratuita para Donos de Restaurante</p>
          <h1 className="heading-hero text-3xl sm:text-5xl font-bold mb-4">
            Calculadora de CMV Grátis
          </h1>
          <p className="text-body max-w-2xl mx-auto">
            Descubra a porcentagem exata do seu <strong>Custo de Mercadoria Vendida (CMV)</strong> e saiba se o seu restaurante está operando na faixa de lucro ideal.
          </p>
        </div>

        {/* Form & Calculator Card */}
        <div className="card p-6 sm:p-10 mb-12 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label htmlFor="faturamento-input" className="block text-sm font-semibold text-cream mb-2">
                  Faturamento Líquido Mensal (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">R$</span>
                  <input
                    id="faturamento-input"
                    type="number"
                    value={faturamento || ""}
                    onChange={(e) => setFaturamento(Number(e.target.value))}
                    placeholder="100000"
                    className="w-full pl-12 pr-4 py-3 bg-body/40 border border-border rounded-xl text-cream font-mono text-lg focus:outline-none focus:border-ocre transition-colors"
                  />
                </div>
                <p className="text-xs text-muted/70 mt-1">Total de vendas brutas menos descontos e cancelamentos.</p>
              </div>

              <div>
                <label htmlFor="compras-input" className="block text-sm font-semibold text-cream mb-2">
                  Total de Compras de Insumos no Mês (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">R$</span>
                  <input
                    id="compras-input"
                    type="number"
                    value={compras || ""}
                    onChange={(e) => setCompras(Number(e.target.value))}
                    placeholder="32000"
                    className="w-full pl-12 pr-4 py-3 bg-body/40 border border-border rounded-xl text-cream font-mono text-lg focus:outline-none focus:border-ocre transition-colors"
                  />
                </div>
                <p className="text-xs text-muted/70 mt-1">Soma das notas fiscais de alimentos, bebidas e embalagens.</p>
              </div>
            </div>

            {/* Resultado */}
            <div className={`p-6 rounded-2xl border ${status.bg} flex flex-col justify-between min-h-[260px]`}>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted mb-1">— Resultado do CMV</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-extrabold ${status.color}`}>
                    {cmvPorcentagem.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted">do faturamento</span>
                </div>
                <div className={`inline-block px-3 py-1 mt-3 rounded-full text-xs font-bold ${status.color} bg-body/60`}>
                  {status.label}
                </div>
              </div>

              <div className="mt-6 border-t border-border/40 pt-4">
                <p className="text-xs text-cream/90 leading-relaxed">
                  {status.desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guia Explicativo & SEO Text */}
        <div className="space-y-12 text-body">
          <div className="card p-8">
            <h2 className="heading-section text-2xl mb-4">
              O que é CMV e por que ele determina o sucesso do seu restaurante?
            </h2>
            <p className="mb-4">
              O <strong>CMV (Custo de Mercadoria Vendida)</strong> indica a porcentagem da receita bruta do restaurante que é gasta exclusivamente para comprar os alimentos, bebidas e embalagens necessários para a produção.
            </p>
            <p className="mb-4">
              Segundo dados da <strong>Abrasel</strong>, o CMV ideal de um restaurante saudável deve variar entre <strong>28% e 35%</strong>. Quando o CMV ultrapassa 40%, o restaurante perde margem para pagar folha de pagamento, aluguel e impostos, correndo o risco de operar no prejuízo.
            </p>
          </div>

          {/* CTA Banner */}
          <div className="card p-8 bg-gradient-to-br from-card to-body border-ocre/40 text-center">
            <h3 className="heading-section text-2xl mb-3">
              Quer calcular o CMV automaticamente direto das Notas Fiscais?
            </h3>
            <p className="text-muted max-w-xl mx-auto mb-6 text-sm">
              O <strong>Rook System</strong> lê suas notas fiscais de compras via SEFAZ e calcula seu CMV real, ficha técnica e margem de lucro por prato automaticamente sem você precisar preencher planilhas.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/planos/" className="btn-primary">
                Testar o Rook System Grátis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
