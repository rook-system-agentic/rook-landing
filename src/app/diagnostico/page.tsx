import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/DiagnosticoFlow";
import { siteUrl } from "@/lib/site-origin";
import { OG_IMAGE } from "@/lib/og-image";

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
    canonical: siteUrl("/diagnostico/"),
  },
  openGraph: {
    /* Ver `@/lib/og-image`: sem isto, esta rota compartilha sem imagem. */
    images: [OG_IMAGE],
    title: "Diagnóstico Financeiro Gratuito | Rook System",
    description: "Descubra quanto seu restaurante precisa faturar para ter lucro real.",
    type: "website",
  },
};

export default function DiagnosticoPage() {
  return <DiagnosticoFlow />;
}
