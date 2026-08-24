import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
import { segmentoPorSlug, pctBr, BENCHMARK_FONTE } from "@/lib/cmv-benchmarks.mjs";

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
 * OS NÚMEROS vêm de `@/lib/cmv-benchmarks`, a mesma tabela que a calculadora
 * usa. Nenhum percentual é digitado aqui: se o benchmark mudar, muda em um
 * lugar só e as duas páginas acompanham. `segmentoPorSlug` devolve `undefined`
 * para slug desconhecido, e o `!` abaixo é deliberado — se alguém renomear um
 * slug na tabela, isto quebra no build, que é onde deve quebrar.
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
            O CMV de referência de cada segmento sai do {BENCHMARK_FONTE} — o mesmo que a
            calculadora usa. É a régua contra a qual o Rook compara a sua casa, todo mês.
          </p>

          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BLOCOS.map((b) => {
              const seg = segmentoPorSlug(b.slug)!;
              return (
                <li key={b.slug} className="card h-full p-6">
                  <h3 className="heading-section text-xl mb-3">{b.titulo}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
                    {b.dor}
                  </p>
                  <p
                    className="font-mono text-xs uppercase tracking-wider pt-4"
                    style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)" }}
                  >
                    CMV de referência{" "}
                    <span style={{ color: "var(--color-terracota-text)" }}>
                      {pctBr(seg.defaultCmvTarget)}
                    </span>{" "}
                    · faixa saudável {pctBr(seg.cmvMin)}–{pctBr(seg.cmvMax)}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="text-body mt-8">
            Self-service, japonesa, italiana, fine dining, fast food — a calculadora traz os onze
            segmentos com a faixa de cada um.{" "}
            <Link
              href="/calculadora-cmv/"
              className="underline underline-offset-4"
              style={{ color: "var(--color-terracota-text)" }}
            >
              Ver a calculadora de CMV →
            </Link>
          </p>
        </div>
      </section>

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
