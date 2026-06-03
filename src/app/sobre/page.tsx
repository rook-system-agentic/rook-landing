import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o Rook | Rook System",
  description: "A Rook é um sistema de gestão para donos de food service que querem parar de operar no escuro.",
};

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-4">— Sobre o Rook</p>
          <h1 className="text-3xl lg:text-[2.8rem] font-bold leading-tight mb-6">
            Visão. Estratégia. <em className="not-italic text-terracota">Controle.</em>
          </h1>
          <p className="text-muted max-w-2xl leading-relaxed">
            A Rook é um sistema de gestão para <strong className="text-cream">donos de food service</strong> — restaurantes, cafeterias, bares, padarias —
            que querem parar de operar no escuro. <strong className="text-cream">Faturar não é lucrar.</strong> A diferença entre o que entra no caixa
            e o que sobra no fim do mês é o nosso ponto de partida.
          </p>
        </div>
      </section>

      {/* Por que existimos */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-4">— Por que existimos</p>
          <h2 className="text-3xl font-bold mb-6 max-w-2xl">
            A maioria dos restaurantes fecha o mês <em className="not-italic text-terracota">sem saber onde está o dinheiro.</em>
          </h2>
          <p className="text-muted max-w-2xl mb-12">
            Planilha em Excel, &ldquo;feeling&rdquo; do gerente, conversa solta com o contador uma vez por ano.
            Entre o pedido no salão e o lucro no bolso há seis camadas — vendas, custos, impostos, despesas, endividamento, resultado —
            e cada uma pode estar corroendo a margem agora.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Clareza vence achismo", desc: "Toda recomendação vem com um número em R$ ao lado. Sem promessa vaga, sem \"otimização\" sem cifrão." },
              { n: "02", title: "Dados auditáveis", desc: "Cada linha do diagnóstico tem fonte rastreável. Receita líquida × 30% de CMV ideal. O contador olha e entende." },
              { n: "03", title: "Linguagem humana", desc: "Sem siglas, sem jargão técnico. A Rook conta a história do seu negócio como um consultor experiente faria." },
            ].map((item) => (
              <div key={item.n} className="card p-6">
                <span className="text-terracota font-mono font-bold text-lg">{item.n}</span>
                <h3 className="text-cream font-semibold mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="section-label mb-4">— O que defendemos</p>
          <p className="text-muted max-w-2xl mx-auto mb-8">
            Uma marca <em className="not-italic text-cream">governante</em>. A Rook traduz força, confiança e estratégia empenhadas
            na construção de um sistema de gestão com foco em dar mais <strong className="text-cream">visão e controle</strong> a gestores e empreendedores.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Image src="/brand/rook-logo-horizontal.png" alt="Rook — Visão | Estratégia | Controle" width={320} height={80} className="h-16 w-auto" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="section-label mb-4">— Conheça por dentro</p>
          <h2 className="text-2xl font-bold mb-4">Veja como o Rook <em className="not-italic text-terracota">funciona.</em></h2>
          <p className="text-muted mb-6">Calculadora interativa, Relatório Anual editorial e Chess para redes multi-unidade.</p>
          <Link href="/funcionalidades/" className="btn-ghost">Explorar funcionalidades →</Link>
        </div>
      </section>
    </>
  );
}
