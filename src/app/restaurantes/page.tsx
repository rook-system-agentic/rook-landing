import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
import { BENCHMARK_FONTE } from "@/lib/cmv-benchmarks.mjs";
import TelasDoProduto from "@/components/restaurantes/TelasDoProduto";

export const metadata: Metadata = {
  title: "O Rook para o seu tipo de casa | Rook System",
  description:
    "À la carte, delivery, bar, padaria, pizzaria ou hamburgueria: cada segmento perde margem de um jeito. Veja o CMV de referência do seu e onde o dinheiro escapa.",
  alternates: {
    canonical: siteUrl("/restaurantes/"),
  },
};

/**
 * A página por segmento de casa.
 *
 * Era um stub de uma dobra desde 18/08/2026 ("o conteúdo por segmento vem
 * depois"). Este é o conteúdo.
 *
 * A REGRA DE CADA BLOCO: uma dor que só aquele segmento tem, na língua de quem
 * a vive, e o CMV de referência do segmento ao lado. Sem isso o texto viraria
 * "o Rook também atende pizzaria" — que não diz nada a um dono de pizzaria.
 *
 * O CMV DE REFERÊNCIA NÃO APARECE AQUI, e isso é decisão de conversão
 * (Gabriel, 24/08/2026). A primeira versão estampava o percentual de cada
 * segmento no card — e entregar o número de graça encerra o assunto: quem já
 * leu "32,0%" não tem motivo nenhum para abrir a calculadora. A página passa a
 * fazer a pergunta e mandar para a ferramenta que responde, que é onde o
 * visitante vira lead.
 *
 * O `slug` continua aqui porque é a chave que leva cada card ao segmento certo
 * dentro da calculadora — não é enfeite.
 */
const BLOCOS = [
  {
    slug: "a_la_carte",
    titulo: "À la carte",
    dor: "Ticket alto e proteína cara: um corte que sobe 8% sem ninguém avisar leva o resultado do mês junto. O preço do fornecedor muda na nota, não no cardápio.",
  },
  {
    slug: "delivery_especializado",
    titulo: "Delivery",
    dor: "Taxa de app, embalagem e entrega comem a margem por fora do prato. A conta só fecha quando inclui tudo — e no fim do mês quase nunca inclui.",
  },
  {
    slug: "bar_boteco",
    titulo: "Bar e boteco",
    dor: "Giro alto, perda invisível: dose mal tirada, quebra e cortesia não aparecem no caixa do dia. Aparecem no estoque, semanas depois.",
  },
  {
    slug: "padaria_cafeteria",
    titulo: "Padaria e cafeteria",
    dor: "Mix enorme, margem por item minúscula. Sem custo por família de produto, o balcão esconde exatamente onde se perde dinheiro.",
  },
  {
    slug: "pizzaria",
    titulo: "Pizzaria",
    dor: "Combo e promoção vendem volume. A pergunta que fica sem resposta é se sobra margem depois do desconto — e em qual canal ela some.",
  },
  {
    slug: "hamburgueria",
    titulo: "Hamburgueria",
    dor: "Ficha técnica curta, variação grande: 10 gramas a mais no blend, repetidos mil vezes no mês, viram uma conta que ninguém somou.",
  },
] as const;

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
            passa pelas mesmas seis paradas — venda, imposto, insumo, despesa, dívida e o que
            sobra. O que muda de casa para casa é onde a margem escapa primeiro.
          </p>
          <p className="text-body max-w-2xl mb-10">
            Comece pelo diagnóstico gratuito: em dois minutos você vê se o restaurante está no
            lucro ou no prejuízo — e quanto precisa faturar para virar o mês. Sem cartão.
          </p>
          <Link href="/diagnostico/" className="btn-primary">
            Fazer meu diagnóstico →
          </Link>
        </div>
      </section>

      <section className="section-spacing" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Onde a margem escapa em cada casa</p>
          <h2 className="heading-section mb-4">Ache a sua casa aqui.</h2>
          <p className="text-body max-w-2xl mb-10">
            Cada segmento tem um CMV saudável diferente — o que é ótimo numa pizzaria é sinal de
            alerta num bar. A calculadora mostra a faixa da sua casa pelo {BENCHMARK_FONTE} e,
            com o seu faturamento, quanto dinheiro está em jogo por mês.
          </p>

          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BLOCOS.map((b) => {
              return (
                <li key={b.slug} className="card h-full p-6 flex flex-col">
                  <h3 className="heading-section text-xl mb-3">{b.titulo}</h3>
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "var(--color-muted)" }}>
                    {b.dor}
                  </p>
                  <Link
                    href="/calculadora-cmv/"
                    className="font-mono text-xs uppercase tracking-wider pt-4 underline underline-offset-4"
                    style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-terracota-text)" }}
                  >
                    Ver o CMV ideal de {b.titulo.toLowerCase()} →
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="card mt-10 p-8 text-center">
            <h3 className="heading-section text-2xl mb-3">Quanto o CMV está comendo do seu lucro?</h3>
            <p className="text-body mx-auto mb-6 max-w-2xl">
              São onze segmentos, do fine dining ao self-service. Escolha o seu, informe o
              faturamento e o CMV de hoje: em segundos você vê a faixa saudável da sua casa e
              quanto sobra por mês ao chegar nela. Gratuito e sem cadastro.
            </p>
            <Link href="/calculadora-cmv/" className="btn-primary">
              Calcular o CMV da minha casa →
            </Link>
          </div>
        </div>
      </section>

      {/*
        * As telas entram DEPOIS dos cards de segmento e antes do fecho.
        *
        * A ordem é o argumento: o visitante acabou de se reconhecer numa dor
        * ("a proteína sobe sem avisar", "a dose mal tirada não aparece no
        * caixa") e a seção seguinte mostra a tela que responde exatamente
        * aquilo. Antes dos cards, seriam três telas de um produto que ele
        * ainda não sabe se é para ele.
        */}
      <TelasDoProduto />

      <section className="section-spacing" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="heading-section mb-4">Tem mais de uma unidade?</h2>
          <p className="text-body max-w-2xl mb-8">
            Para redes e franquias, o Chess consolida o grupo e soma a visão de todas as casas numa
            tela só, somada ao plano de cada uma.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/diagnostico/" className="btn-primary">
              Fazer meu diagnóstico
            </Link>
            <Link href="/planos/" className="btn-ghost">
              Ver planos e teste
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
