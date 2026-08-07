import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/DiagnosticoFlow";

export const metadata: Metadata = {
  title: "Diagnóstico Financeiro Gratuito para Restaurantes | Rook System",
  description:
    "Descubra se seu restaurante está no lucro ou no prejuízo. Calcule seu Ponto de Equilíbrio e compare com o benchmark do seu segmento. 100% gratuito.",
  keywords: [
    "diagnóstico financeiro restaurante",
    "ponto de equilíbrio restaurante",
    "calculadora ponto de equilíbrio",
    "margem de lucro restaurante",
    "CMV ideal restaurante",
    "quanto preciso faturar restaurante",
  ],
  alternates: {
    canonical: "https://rook.com.br/diagnostico/",
  },
  openGraph: {
    title: "Diagnóstico Financeiro Gratuito | Rook System",
    description: "Descubra quanto seu restaurante precisa faturar para ter lucro real.",
    type: "website",
  },
};

export default function DiagnosticoPage() {
  return <DiagnosticoFlow />;
}
