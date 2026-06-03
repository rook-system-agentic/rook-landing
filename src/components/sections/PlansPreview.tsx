"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Pawn",
    subtitle: "Gratuito",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Para quem quer começar a entender seu CMV.",
    features: [
      "Calculadora básica de CMV",
      "Limite de 3 cálculos/mês",
      "1 usuário",
      "Dados não persistidos",
    ],
    cta: "Começar Grátis",
    href: "https://app.rooksystem.com.br/registro?plan=pawn",
    highlighted: false,
  },
  {
    name: "Knight",
    subtitle: "Essencial",
    monthlyPrice: 197,
    annualPrice: 148,
    description: "Para restaurantes que querem controle real.",
    features: [
      "Cálculos ilimitados",
      "Histórico 12 meses",
      "Dashboard completo",
      "Projeções e tendências",
      "Até 3 usuários",
      "Suporte por email",
    ],
    cta: "Assinar Knight",
    href: "https://app.rooksystem.com.br/registro?plan=knight",
    highlighted: false,
  },
  {
    name: "Rook",
    subtitle: "Profissional",
    monthlyPrice: 497,
    annualPrice: 373,
    description: "Para operações que exigem excelência.",
    features: [
      "Tudo do Knight +",
      "Integração ERP/PDV",
      "Análise preditiva",
      "Curva ABC completa",
      "Projeções 24 meses",
      "Até 10 usuários",
      "Suporte prioritário",
    ],
    cta: "Assinar Rook",
    href: "https://app.rooksystem.com.br/registro?plan=rook",
    highlighted: true,
  },
  {
    name: "Chess",
    subtitle: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    description: "Para redes e grupos com necessidades específicas.",
    features: [
      "Tudo do Rook +",
      "Multi-unidades",
      "API dedicada",
      "SLA garantido",
      "Onboarding personalizado",
      "Usuários ilimitados",
      "Gerente de conta",
    ],
    cta: "Falar com Vendas",
    href: "#contato",
    highlighted: false,
  },
];

export function PlansPreview() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      className="section"
      aria-labelledby="plans-heading"
      id="planos"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 0%, rgba(229,76,0,0.05), transparent 60%),
          #0F0A06
        `,
        borderTop: "1px solid rgba(176,124,74,0.16)",
      }}
    >
      <div className="container-rook">
        <div className="text-center mb-14">
          <p className="eyebrow mb-[22px]">— Planos</p>
          <h2 id="plans-heading" className="section-title">
            Invista no controle. <em>Colha margem.</em>
          </h2>
          <p className="section-lede mx-auto text-center">
            Todos os planos incluem dados 100% auditáveis e rastreabilidade
            fiscal completa.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className="text-[14px]"
            style={{ color: !annual ? "#F5EDE0" : "rgba(245,237,224,0.58)" }}
          >
            Mensal
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-[52px] h-[28px] rounded-full transition-colors"
            style={{ background: annual ? "#E54C00" : "rgba(176,124,74,0.32)" }}
            aria-label={annual ? "Mudar para plano mensal" : "Mudar para plano anual"}
            role="switch"
            aria-checked={annual}
          >
            <span
              className="absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full transition-transform"
              style={{ left: annual ? "27px" : "3px" }}
            />
          </button>
          <span
            className="text-[14px]"
            style={{ color: annual ? "#F5EDE0" : "rgba(245,237,224,0.58)" }}
          >
            Anual{" "}
            <span className="text-[12px] font-medium" style={{ color: "#44604A" }}>
              -25%
            </span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="relative flex flex-col p-6 rounded-rook border transition-all"
              style={{
                background: "linear-gradient(160deg, #241A11 0%, #1A130C 100%)",
                borderColor: plan.highlighted
                  ? "rgba(229,76,0,0.48)"
                  : "rgba(176,124,74,0.24)",
                boxShadow: plan.highlighted
                  ? "0 0 30px rgba(229,76,0,0.12)"
                  : "none",
              }}
            >
              {plan.highlighted && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-mono tracking-[0.14em] uppercase rounded-full"
                  style={{ background: "#E54C00", color: "white" }}
                >
                  Mais Popular
                </div>
              )}

              <div className="mb-5">
                <h3
                  className="font-display font-medium text-[20px] tracking-[-0.01em]"
                  style={{ color: "#F5EDE0" }}
                >
                  {plan.name}
                </h3>
                <p className="text-[12px] mt-1" style={{ color: "rgba(245,237,224,0.58)" }}>
                  {plan.subtitle}
                </p>
              </div>

              <div className="mb-5">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span
                      className="font-display font-medium text-[32px] leading-none tracking-[-0.02em]"
                      style={{ color: "#F5EDE0" }}
                    >
                      R${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-[13px] ml-1" style={{ color: "rgba(245,237,224,0.58)" }}>
                      /mês
                    </span>
                    {annual && plan.monthlyPrice > 0 && (
                      <p
                        className="text-[12px] line-through mt-1"
                        style={{ color: "rgba(245,237,224,0.34)" }}
                      >
                        R${plan.monthlyPrice}/mês
                      </p>
                    )}
                  </>
                ) : (
                  <span
                    className="font-display font-medium text-[24px] tracking-[-0.01em]"
                    style={{ color: "#F5EDE0" }}
                  >
                    Sob consulta
                  </span>
                )}
              </div>

              <p className="text-[13px] leading-[1.5] mb-5" style={{ color: "#D8CCB8" }}>
                {plan.description}
              </p>

              <ul className="list-none p-0 m-0 flex flex-col gap-[8px] mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-shrink-0 mt-0.5"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="#E79F4A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[12.5px] leading-[1.4]" style={{ color: "rgba(245,237,224,0.58)" }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-auto text-center py-[10px] px-4 rounded-[6px] text-[13px] font-medium no-underline transition-all ${
                  plan.highlighted
                    ? "btn-primary"
                    : "btn-ghost"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
