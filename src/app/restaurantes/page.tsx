import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";

export const metadata: Metadata = {
  title: "Rook para Restaurantes | Rook System",
  description:
    "Inteligência financeira para restaurantes à la carte, delivery, bares e cafeterias. O Rook lê a operação e aponta a próxima decisão em reais.",
  alternates: {
    canonical: siteUrl("/restaurantes/"),
  },
};

/*
 * Stub (18/08/2026): a página existe para a navegação do redesenho v5 não
 * apontar para o vazio. O conteúdo por segmento de restaurante vem depois.
 */
export default function RestaurantesPage() {
  return (
    <>
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Restaurantes</p>
          <h1 className="heading-hero mb-8">
            Cada casa joga um jogo. O tabuleiro é <em>o mesmo.</em>
          </h1>
          <p className="text-body max-w-2xl mb-6">
            À la carte, delivery, bar, cafeteria ou padaria: entre o caixa e o bolso, o dinheiro
            passa pelas mesmas seis etapas — vendas, impostos, custos, despesas, dívidas e
            resultado. O Rook lê a operação da sua casa e aponta, em reais, a próxima decisão.
          </p>
          <p className="text-body max-w-2xl mb-10">
            Comece pelo diagnóstico gratuito: em dois minutos você vê se o restaurante está no
            lucro ou no prejuízo — e quanto precisa faturar para virar o mês.
          </p>
          <Link href="/diagnostico/" className="btn-primary">
            Fazer meu diagnóstico →
          </Link>
        </div>
      </section>
    </>
  );
}
