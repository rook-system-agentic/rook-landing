import { CmvCalculator } from "@/components/CmvCalculator";
import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";

export const metadata: Metadata = {
  title: "Calculadora de CMV Grátis para Restaurante | Rook System",
  description:
    "Simule o impacto do CMV no seu lucro líquido. Descubra o potencial de economia do seu restaurante de acordo com o benchmark do seu segmento.",
  keywords: [
    "calculadora cmv restaurante",
    "como calcular cmv restaurante",
    "cmv ideal restaurante",
    "calculadora de custos restaurante",
    "sistema de gestão para restaurante",
  ],
  alternates: {
    canonical: siteUrl("/calculadora-cmv/"),
  },
};

export default function CalculadoraCmvPage() {
  return (
    <div className="section-spacing">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="section-label mb-3">— Ferramenta Interativa Gratuita</p>
          <h1 className="heading-hero text-3xl sm:text-5xl font-bold mb-4">
            Quanto o CMV está comendo <em>do seu lucro?</em>
          </h1>
          <p className="text-body text-lg">
            Descubra quanto dinheiro seu restaurante pode economizar ao otimizar o Custo de Mercadoria Vendida para a faixa ideal do seu segmento.
          </p>
        </div>

        {/* Calculator Component */}
        <CmvCalculator />

        {/* SEO & Educational Content Section */}
        <div className="max-w-4xl mx-auto mt-20 space-y-10 text-body">
          <div className="card p-8 sm:p-10">
            <h2 className="heading-section text-2xl mb-4">
              O que é o CMV e por que ele define a sobrevivência do restaurante?
            </h2>
            <p className="mb-4">
              O <strong>CMV (Custo de Mercadoria Vendida)</strong> é o indicador financeiro mais crítico no setor de food service. Ele mede exatamente a porcentagem da sua receita bruta destinada à compra dos insumos, ingredientes e embalagens utilizados nos pratos.
            </p>
            <p className="mb-4">
              Restaurantes com CMV acima de <strong>38%</strong> raramente conseguem gerar lucro líquido sustentável após pagarem folha de pagamento, impostos e custos de ocupação (aluguel).
            </p>
          </div>

          {/*
            * O CTA daqui era "Testar o Rook System Grátis" e apontava para
            * /planos/. O teste de 7 dias pede cartão no início — a palavra
            * "grátis" prometia o que a página seguinte desmentia, e desmentir o
            * visitante no clique é o jeito mais caro de perder a conversão.
            * O gratuito de verdade é o diagnóstico, que agora leva o primário.
            */}
          <div className="card p-8 sm:p-10 bg-gradient-to-br from-card to-bg text-center">
            <h3 className="heading-section text-2xl mb-3">
              Esse valor por mês é o que está em jogo.
            </h3>
            <p className="text-muted max-w-xl mx-auto mb-6 text-sm leading-relaxed">
              A calculadora mostra o tamanho do problema. O <strong>diagnóstico</strong> mostra onde
              ele está: em dois minutos, etapa por etapa, você vê se a casa está no lucro ou no
              prejuízo — e quanto precisa faturar para virar o mês. Sem planilha e sem cartão.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/diagnostico/" className="btn-primary">
                Fazer meu diagnóstico gratuito
              </Link>
              <Link href="/planos/" className="btn-ghost">
                Ver planos e teste
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
