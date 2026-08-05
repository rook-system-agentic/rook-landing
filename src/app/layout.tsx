import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rooksystem.com.br"),
  title: "Rook System — Gestão Financeira para Restaurantes",
  description:
    "Controle CMV, otimize compras e proteja sua margem. Sistema de gestão financeira para food service com diagnóstico, relatório anual e painel multi-unidade.",
  keywords: ["gestão financeira restaurante", "CMV", "food service", "controle de custos", "margem de lucro restaurante"],
  openGraph: {
    title: "Rook System — Gestão Financeira para Restaurantes",
    description: "Controle CMV, otimize compras e proteja sua margem.",
    url: "https://rooksystem.com.br",
    siteName: "Rook System",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <Header />
        <main className="pt-[72px]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
