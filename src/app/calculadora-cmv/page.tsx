import { CmvCalculator } from "@/components/CmvCalculator";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
export const metadata: Metadata = {
 title: "Análise de CMV para restaurantes | Rook System",
 description: "Analise o custo dos ingredientes do seu restaurante e receba uma orientação a partir dos números da sua operação.",
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
