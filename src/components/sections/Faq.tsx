"use client";

const faqs = [
  {
    q: "Preciso de contador para usar a Rook?",
    a: "Não. A Rook foi desenhada para o gestor. Você importa as notas fiscais e o sistema faz a classificação, cálculo de CMV e geração de relatórios automaticamente. Seu contador pode acessar os dados quando necessário.",
  },
  {
    q: "Quanto tempo leva para ver resultados?",
    a: "O primeiro relatório fica pronto em minutos após a importação das notas. Com 3 meses de dados, as projeções e benchmarks ficam ainda mais precisos.",
  },
  {
    q: "Funciona para qualquer tipo de restaurante?",
    a: "Sim. A Rook atende desde operações single-unit até redes com múltiplas unidades. O sistema se adapta ao porte e complexidade do seu negócio.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "100%. Infraestrutura em nuvem com criptografia em trânsito e em repouso, backups automáticos e conformidade com LGPD. Seus dados nunca são compartilhados.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem fidelidade, sem multa. Você pode exportar todos os seus dados a qualquer momento.",
  },
  {
    q: "Como funciona o plano gratuito?",
    a: "O plano Pawn dá acesso à calculadora de CMV básica com limite de cálculos mensais. Ideal para conhecer a plataforma antes de assinar.",
  },
];

export function FaqSection() {
  return (
    <section
      className="section"
      aria-labelledby="faq-heading"
      style={{ borderTop: "1px solid rgba(176,124,74,0.16)" }}
    >
      {/* FAQ Schema for GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />

      <div className="container-rook">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-20">
          {/* Left: Sticky CTA */}
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <p className="eyebrow mb-[22px]">— Perguntas frequentes</p>
            <h2
              id="faq-heading"
              className="font-display font-medium text-[36px] leading-[1.1] tracking-[-0.015em] mb-4"
              style={{ color: "#F5EDE0" }}
            >
              Ainda com dúvidas?
            </h2>
            <p className="text-[15px] leading-[1.55] mb-8" style={{ color: "#D8CCB8" }}>
              Fale diretamente com nosso time. Sem chatbot, sem fila.
            </p>
            <a href="#contato" className="btn btn-primary btn-lg">
              Falar com o time
            </a>
          </div>

          {/* Right: FAQ items */}
          <div className="flex flex-col">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group"
                style={{ borderBottom: "1px solid rgba(176,124,74,0.16)" }}
              >
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer">
                  <span
                    className="font-display font-medium text-[16px] leading-[1.3]"
                    style={{ color: "#F5EDE0" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="faq-icon flex-shrink-0 text-[20px] font-light"
                    style={{ color: "#E79F4A" }}
                  >
                    +
                  </span>
                </summary>
                <div className="pb-5 pr-8">
                  <p className="text-[14.5px] leading-[1.6] m-0" style={{ color: "#D8CCB8" }}>
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
