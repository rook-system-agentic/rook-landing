import type { Metadata } from "next";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Blog | Rook System",
  description: "Artigos baseados em dados reais do mercado food service brasileiro. Benchmarks, análises e estratégias para proteger sua margem.",
};

const editorials = [
  { tag: "Benchmarks", title: "CMV médio por segmento: dados reais de restaurantes brasileiros", desc: "Margem, CMV, ticket médio e prime cost por porte e tipo de operação." },
  { tag: "Tributário", title: "Simples Nacional vs Lucro Presumido: simulação para food service", desc: "Mudanças regulatórias e simulações por regime tributário." },
  { tag: "CMV e Compras", title: "Como reduzir 15% do CMV sem cortar qualidade", desc: "Comportamento de categorias, sazonalidade e estratégias de compra." },
  { tag: "Tendências", title: "O que os dados de 2025 mostram sobre o food service brasileiro", desc: "Comportamento do consumidor, sazonalidade e projeções." },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-4">— Blog</p>
          <h1 className="text-3xl lg:text-[2.8rem] font-bold leading-tight mb-4 max-w-2xl">
            Conteúdo para quem quer <em className="not-italic text-terracota">lucrar de verdade.</em>
          </h1>
          <p className="text-muted max-w-xl">
            Em breve: artigos baseados em dados reais do mercado food service brasileiro. Benchmarks, análises e estratégias para proteger sua margem.
          </p>
        </div>
      </section>

      {/* Editorial fronts */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-8">— Frentes editoriais</p>
          <div className="grid md:grid-cols-2 gap-5">
            {editorials.map((e) => (
              <div key={e.tag} className="card p-6">
                <p className="font-mono text-xs text-terracota uppercase tracking-wider mb-2">{e.tag}</p>
                <h3 className="font-semibold text-cream mb-2">{e.title}</h3>
                <p className="text-sm text-muted">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 border-t border-border">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="section-label mb-4">— Newsletter</p>
          <h2 className="text-2xl font-bold mb-3">Receba em primeira mão.</h2>
          <p className="text-muted text-sm mb-8">
            Cadastre-se para receber nossos artigos, benchmarks e análises direto no seu email. Sem spam, conteúdo de valor.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
