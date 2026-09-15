import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/DiagnosticoFlow";
import { siteUrl } from "@/lib/site-origin";
import { OG_IMAGE } from "@/lib/og-image";

export const metadata: Metadata = {
  title: "Diagnóstico Financeiro Gratuito para Restaurantes | Rook System",
  description:
    "Estime a receita mensal necessária para cobrir os custos do restaurante, com os valores informados por você.",
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
    description: "Estime o ponto de equilíbrio com os números informados da sua operação.",
    type: "website",
  },
};

export default function DiagnosticoPage() {
  return <DiagnosticoFlow />;
}
