import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o Rook | Rook System",
  description: "O Rook é um sistema de gestão para donos de food service que querem parar de operar no escuro. Conheça nossa história.",
};

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Sobre o Rook</p>
          <h1 className="heading-hero mb-8">
            Visão. Estratégia. <em>Controle.</em>
          </h1>
          <p className="text-body max-w-2xl">
            O Rook é um sistema de gestão para <strong className="text-cream">donos de food service</strong> — restaurantes, cafeterias, bares,
            padarias — que querem parar de operar no escuro. <strong className="text-cream">Faturar não é lucrar.</strong> A diferença entre o que
            entra no caixa e o que sobra no fim do mês é o nosso ponto de partida.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="section-spacing border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Nossa história</p>
          <h2 className="heading-section mb-10 max-w-4xl">
            O Rook começou em <em>planilhas.</em>
          </h2>
          <div className="max-w-2xl space-y-6 text-muted leading-relaxed text-[17px]">
            <p>
              Por mais de 20 anos, nós fizemos o trabalho que quase ninguém quer fazer:
              entrar onde a operação está apertando e olhar os números sem romantizar,
              com profundidade, critério e clareza. Antes de existir produto, existia método.
              Existiam modelos de controladoria, análises de DRE, disciplina de caixa e
              rotinas de gestão que, na prática, ajudavam empresas a voltar a respirar.
            </p>
            <p>
              Quando começamos a olhar com atenção para restaurantes, vimos um padrão
              que se repetia: casa cheia, marca forte, bom faturamento e, mesmo assim, falta
              de clareza. <em className="text-cream italic">&ldquo;Eu vendo bem, mas não sei para onde o dinheiro está indo.&rdquo;</em> A partir
              daí, decidimos fazer diferente — não criar mais uma planilha, mas transformar
              esse conhecimento em uma plataforma viva, que acompanha o negócio,
              organiza os dados e entrega direção.
            </p>
            <p>
              O Rook nasce dessa evolução. A união entre método e tecnologia, com um
              objetivo simples: colocar <strong className="text-cream">clareza financeira na rotina do dono</strong>, sem complicar
              a operação. Em 2026, colocamos isso no mercado.
            </p>
          </div>
        </div>
      </section>

      {/* Por que existimos */}
      <section className="section-spacing border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Por que existimos</p>
          <h2 className="heading-section mb-6 max-w-4xl">
            A maioria dos restaurantes fecha o mês <em>sem saber onde está o dinheiro.</em>
          </h2>
          <p className="text-body mb-16">
            O Rook traz a controladoria — a gestão financeira que normalmente só empresa
            grande tem — para a tela do dono de restaurante. Entre o pedido no salão e o
            lucro no fim do mês há seis casas: vendas, impostos, custos, despesas, dívidas
            e resultado. Cada uma pode estar corroendo a margem agora.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Clareza vence achismo",
                desc: "Toda recomendação que damos vem com um número em R$ ao lado. Sem promessa vaga, sem \"otimização\" sem cifrão. Se o Rook sugere algo, é porque calcula o impacto.",
              },
              {
                n: "02",
                title: "Dados auditáveis",
                desc: "Cada linha do diagnóstico tem fonte rastreável. Receita líquida × 30% de CMV ideal. Imposto efetivo × regime atual. O contador olha e entende — porque é assim que ele já trabalha.",
              },
              {
                n: "03",
                title: "Linguagem humana",
                desc: "Sem siglas, sem jargão técnico no diagnóstico. O Rook conta a história do seu negócio como um consultor experiente faria — situação, complicação, impacto, próximo passo.",
              },
            ].map((item) => (
              <div key={item.n} className="card p-8">
                <span className="text-ocre font-mono font-bold text-3xl">{item.n}</span>
                <h3 className="heading-sub mt-4 mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que defendemos */}
      <section className="section-spacing border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="section-label mb-8">— O que defendemos</p>
          <h2 className="heading-section max-w-4xl mx-auto mb-6">
            <span className="text-ocre">Visão</span> para enxergar.{" "}
            <span className="text-ocre">Estratégia</span> para decidir.{" "}
            <span className="text-ocre">Controle</span> para executar.
          </h2>
          <p className="text-body mx-auto text-center mb-10">
            O Rook transforma dados financeiros em <strong className="text-cream">informação prática</strong> para melhorar a
            gestão do seu restaurante.
          </p>
          <p className="font-mono text-sm tracking-[0.3em] text-muted/60 uppercase">
            Visão <span className="text-ocre mx-3">|</span> Estratégia <span className="text-ocre mx-3">|</span> Controle
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="section-label mb-4">— Conheça por dentro</p>
            <h2 className="heading-section mb-3">
              Veja como o Rook <em>funciona.</em>
            </h2>
            <p className="text-body">Calculadora interativa, Relatório Anual editorial e Chess para redes multi-unidade.</p>
          </div>
          <Link href="/funcionalidades/" className="btn-primary whitespace-nowrap">
            Explorar funcionalidades →
          </Link>
        </div>
      </section>
    </>
  );
}
