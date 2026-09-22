import { CmvCalculator } from "@/components/CmvCalculator";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
export const metadata: Metadata = {
 title: "Análise de CMV para restaurantes | Rook System",
 description: "Compare o CMV informado com uma referência de segmento e entenda a diferença estimada na sua receita.",
 keywords: [
  "calculadora cmv restaurante",
  "como calcular cmv restaurante",
  "cmv ideal restaurante",
  "calculadora de custos restaurante",
  "sistema de gestão para restaurante",
 ],
 alternates: { canonical: siteUrl("/calculadora-cmv/") },
};
export default function Page() { return <CmvCalculator />; }
