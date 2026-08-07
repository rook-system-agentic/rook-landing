import { CmvCalculator } from "@/components/CmvCalculator";
import Link from "next/link";
import type { Metadata } from "next";

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
    canonical: "https://rook.com.br/calculadora-cmv/",
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
            Simulador de CMV & <em>Potencial de Lucro</em>
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

          <div className="card p-8 sm:p-10 bg-gradient-to-br from-card to-bg text-center">
            <h3 className="heading-section text-2xl mb-3">
              Abandone as planilhas manuais.
            </h3>
            <p className="text-muted max-w-xl mx-auto mb-6 text-sm">
              O <strong>Rook System</strong> conecta-se diretamente à SEFAZ e ao seu ERP para calcular o seu CMV real, ficha técnica e margem de lucro em tempo real — 100% automático.
            </p>
            <div className="flex justify-center">
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
