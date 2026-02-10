import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é o Rook System?",
    answer:
      "O Rook System é uma plataforma de gestão financeira desenvolvida especificamente para restaurantes. Ele analisa seus dados financeiros — receita, custos, despesas, impostos — e transforma em indicadores claros para você tomar decisões melhores. Não é contabilidade: é visão estratégica do seu negócio.",
  },
  {
    question: "O que é CMV e por que devo controlá-lo?",
    answer:
      "CMV (Custo de Mercadoria Vendida) é quanto você gasta em ingredientes e produtos para gerar suas vendas. É o maior custo variável de um restaurante. Quando o CMV sai do controle, o lucro desaparece — mesmo com o salão cheio. O ideal é manter entre 28% e 35% do faturamento, dependendo do porte do restaurante.",
  },
  {
    question: "O que é o Diagnóstico Financeiro?",
    answer:
      "É uma análise gratuita que gera um raio-x completo do seu restaurante em 2 minutos. Você informa receita, custos, despesas e dívidas, e recebe um DRE (Demonstrativo de Resultado), análise tributária comparativa entre regimes (Simples, Presumido e Real), indicadores de saúde financeira e recomendações personalizadas.",
  },
  {
    question: "O Rook usa Inteligência Artificial?",
    answer:
      "O Rook é construído sobre uma base sólida de matemática estatística e analítica. Utilizamos modelos de análise de dados para gerar projeções, alertas e recomendações. O foco é na precisão dos cálculos e na relevância das análises para o seu negócio, não em buzzwords.",
  },
  {
    question: "Preciso ter conhecimento técnico para usar?",
    answer:
      "Não. O Rook foi projetado para ser simples e intuitivo. Você insere seus dados financeiros básicos e o sistema faz toda a análise automaticamente. Se tiver dúvidas, nosso suporte está disponível para ajudar.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim. Todos os planos são sem contrato de fidelidade e você pode cancelar quando quiser. Não há multas ou taxas de cancelamento. Seus dados ficam disponíveis por 30 dias após o cancelamento.",
  },
  {
    question: "O plano Pawn é realmente grátis?",
    answer:
      "Sim. O plano Pawn é 100% gratuito para sempre. Você tem acesso à calculadora básica de CMV com até 5 cálculos por mês. É o primeiro passo para começar a entender seus números sem nenhum compromisso financeiro.",
  },
  {
    question: "Qual a diferença entre os planos Knight e Rook?",
    answer:
      "O Knight (R$ 179,90/mês) oferece controle financeiro completo: cálculos ilimitados, DRE automático, alertas e análise tributária para 1 estabelecimento. O Rook (R$ 379,90/mês) adiciona diagnóstico financeiro completo, projeções e cenários, relatórios personalizados e suporte para até 5 estabelecimentos.",
  },
  {
    question: "Por que tantos restaurantes fecham?",
    answer:
      "Em 2024, 397 mil restaurantes fecharam no Brasil. A principal causa não é falta de clientes — é falta de controle financeiro. Sem saber o CMV real, a margem de lucro e o impacto dos impostos, o dono toma decisões no escuro. O lucro líquido médio do setor não passa de 10%, e 55% dos restaurantes não geram lucro. O Rook existe para mudar essa realidade.",
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
