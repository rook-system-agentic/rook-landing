import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é CMV e por que devo controlá-lo?",
    answer:
      "CMV (Custo de Mercadoria Vendida) é quanto você gasta em ingredientes e produtos para gerar suas vendas. Restaurantes com CMV acima de 36% perdem em média 11,84% de lucro. Controlar o CMV é essencial para manter seu negócio lucrativo e evitar prejuízos.",
  },
  {
    question: "Como o Rook System calcula meu CMV?",
    answer:
      "Você insere sua receita do período e o valor total de compras. O Rook calcula automaticamente seu CMV percentual e compara com sua meta. Além disso, a IA prevê quanto você pode comprar na próxima semana sem ultrapassar sua meta.",
  },
  {
    question: "Preciso ter conhecimento técnico para usar?",
    answer:
      "Não! O Rook foi criado para ser simples e intuitivo. Você só precisa inserir receita e compras. O sistema faz todo o resto automaticamente. Nosso suporte está sempre disponível para ajudar.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim! Todos os planos são sem contrato e você pode cancelar quando quiser. Não há multas ou taxas de cancelamento.",
  },
  {
    question: "O plano Pawn é realmente grátis?",
    answer:
      "Sim! O plano Pawn é 100% gratuito para sempre. Você tem acesso à calculadora básica de CMV com até 30 cálculos por mês. É o primeiro passo estratégico para conhecer o Rook e começar a controlar seu CMV sem compromisso.",
  },
  {
    question: "Quando o plano Rook estará disponível?",
    answer:
      "O plano Rook com integração automática de ERP e domínio total da estratégia está em desenvolvimento e será lançado em breve. Você pode se cadastrar para ser avisado quando estiver disponível.",
  },
  {
    question: "Por que tantos restaurantes fecham?",
    answer:
      "71% fecham por 'queda de vendas', mas o problema real é CMV descontrolado. Quando você compra sem planejamento, gasta 40% a mais. Quando seu CMV passa de 36%, você perde 11,84% de lucro. O Rook System te ajuda a ver isso ANTES de virar prejuízo. Em 2024, 397 mil restaurantes fecharam - não seja o próximo.",
  },
  {
    question: "Como o Rook System me ajuda a não fechar?",
    answer:
      "Restaurantes com controle de CMV têm 15% mais chances de sobreviver. O Rook te dá visão em tempo real, alertas quando você está comprando demais, e projeções para tomar decisões baseadas em dados, não no 'feeling'. 50% dos pequenos restaurantes fecham em 2 anos - o Rook te tira dessa estatística.",
  },
  {
    question: "Quanto posso economizar controlando o CMV?",
    answer:
      "Depende do seu faturamento! Use nossa calculadora acima para ver seu potencial. Exemplos reais: Faturamento R$ 50k/mês = até R$ 36 mil/ano de economia | Faturamento R$ 300k/mês = até R$ 288 mil/ano | Faturamento R$ 600k/mês = até R$ 576 mil/ano. O Rook System custa R$ 99/mês. ROI médio: 30-500x.",
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
            Perguntas{" "}
            <span className="text-rook-marrom">Frequentes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo que você precisa saber sobre o Rook System
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
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
