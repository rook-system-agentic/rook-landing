import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funcionalidades do Rook System — 6 Módulos de Inteligência Financeira",
  description:
    "Conheça os 6 módulos do Rook: Vendas, Compras e CMV, Impostos, Despesas, Dívidas e DRE/Resultado. Controle financeiro completo para restaurantes com inteligência de dados.",
  keywords: [
    "funcionalidades sistema gestão restaurante",
    "módulos gestão financeira restaurante",
    "controle de vendas restaurante",
    "controle de compras restaurante",
    "DRE restaurante",
    "gestão de despesas restaurante",
    "controle de impostos restaurante",
    "sistema financeiro food service",
  ],
  alternates: { canonical: "https://rook.com.br/funcionalidades/" },
  openGraph: {
    title: "Funcionalidades do Rook System — 6 Módulos de Inteligência Financeira",
    description:
      "Vendas, Compras/CMV, Impostos, Despesas, Dívidas e Resultado. Tudo na mesma tela para o dono de restaurante.",
    url: "https://rook.com.br/funcionalidades/",
    type: "website",
  },
};

export default function FuncionalidadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
