import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é CMV e por que ele é importante?",
    answer:
      "CMV (Custo de Mercadoria Vendida) é o custo dos ingredientes e insumos usados para produzir seus pratos. É o indicador mais importante para a saúde financeira do seu restaurante. Um CMV descontrolado pode consumir todo seu lucro, mesmo com vendas altas.",
  },
  {
    question: "Como o Rook System calcula o CMV?",
    answer:
      "O Rook usa algoritmos estatísticos e IA preditiva para calcular seu CMV em tempo real. Basta inserir suas receitas e compras - o sistema faz o resto automaticamente, comparando com benchmarks do setor.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer:
      "Não! O Rook foi criado para ser simples. Se você sabe usar um celular, você consegue usar o Rook. Além disso, oferecemos suporte completo em português.",
  },
  {
    question: "Posso integrar com meu sistema atual?",
    answer:
      "Sim! O Rook integra com os principais ERPs do mercado: Omie, Colibri, Saipo, Teknisa e outros. Os dados são sincronizados automaticamente.",
  },
  {
    question: "E se eu não gostar do serviço?",
    answer:
      "Você pode cancelar a qualquer momento, sem multas ou burocracia. Além disso, oferecemos um período de teste gratuito para você conhecer a plataforma.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="section-label mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-rook-cafe">
            Dúvidas{" "}
            <span className="text-rook-marrom">frequentes</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl px-6 border border-border data-[state=open]:border-rook-pingado/50 shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-rook-cafe hover:text-rook-marrom hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
