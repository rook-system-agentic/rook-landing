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
      "O Rook System é uma plataforma de gestão financeira desenvolvida especificamente para restaurantes. Ele conecta controle de compras, resultado financeiro automático e simulação tributária em um só lugar, transformando seus dados em indicadores claros para decisões mais inteligentes.",
  },
  {
    question: "O que é CMV e por que devo controlar minhas compras?",
    answer:
      "CMV (Custo de Mercadoria Vendida) representa quanto você gasta em ingredientes e produtos para gerar suas vendas. É o maior custo variável de um restaurante. Quando as compras saem do controle, o lucro desaparece — mesmo com o salão cheio. A faixa de referência varia entre 28% e 35% do faturamento, dependendo do porte e segmento do restaurante. O Rook te ajuda a acompanhar isso de perto.",
  },
  {
    question: "O Simulador Tributário substitui meu contador?",
    answer:
      "Não. O Simulador Tributário é uma ferramenta de apoio à decisão que permite comparar cenários entre Simples Nacional, Lucro Presumido e Lucro Real com base nos seus dados reais. Os resultados são estimativas para orientar conversas mais produtivas com seu contador. Recomendamos sempre a validação profissional antes de qualquer mudança de regime tributário.",
  },
  {
    question: "Como o Rook usa documentos fiscais para validar meu faturamento?",
    answer:
      "Quando você habilita a alimentação automatizada, o Rook organiza seus documentos fiscais de forma segura e os utiliza para validar e complementar os dados financeiros que você informa. Isso garante mais precisão nos seus indicadores, sem que você precise fazer nada manualmente. Toda a comunicação é feita por conexão autenticada e criptografada.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Utilizamos criptografia AES-256 para dados em repouso e TLS 1.3 para dados em trânsito. Além disso, oferecemos controle de acesso por perfil, logs de auditoria completos e estamos em conformidade com a LGPD.",
  },
  {
    question: "Preciso ter conhecimento técnico para usar?",
    answer:
      "Não. O Rook foi projetado para ser simples e intuitivo. Você insere seus dados financeiros básicos e o sistema faz toda a análise automaticamente. Dados como CNAE e data de abertura são preenchidos automaticamente a partir do CNPJ. Se tiver dúvidas, nosso suporte está disponível por email.",
  },
  {
    question: "O plano Pawn é realmente grátis?",
    answer:
      "Sim. O plano Pawn é 100% gratuito, sem prazo de validade. Você tem acesso à calculadora básica de CMV com até 8 cálculos por mês e 1 diagnóstico parcial. É o primeiro passo para começar a entender seus números sem nenhum compromisso financeiro.",
  },
  {
    question: "Qual a diferença entre os planos Knight e Rook?",
    answer:
      "O Knight (R$ 179,90/mês) oferece controle financeiro completo: até 25 cálculos de compras/mês, 5 diagnósticos completos, resultado automático (DRE), alertas, Simulador Tributário, alimentação automatizada e histórico de 6 meses para 1 estabelecimento. O Rook (R$ 379,90/mês) adiciona cálculos e diagnósticos ilimitados, integração ERP, histórico completo, projeções e cenários, relatórios personalizados e suporte para até 5 estabelecimentos.",
  },
  {
    question: "O que acontece depois que eu me cadastro?",
    answer:
      "Após o cadastro, você acessa imediatamente o painel do Rook. O primeiro passo é configurar seu restaurante (CNPJ, regime tributário) e inserir seus dados de compras e receitas. Em poucos minutos, você já terá seu primeiro cálculo e poderá gerar um diagnóstico financeiro completo.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim. Todos os planos são sem contrato de fidelidade e você pode cancelar quando quiser. Não há multas ou taxas de cancelamento. Seus dados ficam disponíveis por 30 dias após o cancelamento.",
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
