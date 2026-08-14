import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/company";

export const metadata: Metadata = {
  title: "Política de Privacidade — Rook System",
  description: "Informações gerais sobre o tratamento de dados pessoais pelo Rook System.",
};

const sections = [
  ["1. A quem esta política se aplica", "Esta política abrange visitantes do site, interessados que enviam formulários e usuários da plataforma. Em operações realizadas para clientes empresariais, os papéis e responsabilidades também são definidos no contrato aplicável."],
  ["2. Dados que podemos tratar", "Podemos tratar dados cadastrais e de contato, informações profissionais e empresariais, registros de acesso, dispositivo, navegação, atendimento e preferências. Quando você contrata a plataforma, também tratamos os dados necessários à execução do serviço e ao faturamento."],
  ["3. Finalidades", "Tratamos dados para responder contatos, criar e administrar contas, prestar suporte, executar contratos, processar pagamentos, manter segurança, prevenir fraude, cumprir obrigações legais e melhorar nossos serviços."],
  ["4. Bases legais", "O tratamento pode se apoiar na execução de contrato ou procedimentos preliminares, cumprimento de obrigação legal, exercício regular de direitos, legítimo interesse e consentimento, conforme a finalidade e a legislação aplicável."],
  ["5. Compartilhamento", "Não vendemos dados pessoais. Podemos compartilhá-los, no limite necessário, com fornecedores de infraestrutura, comunicação, atendimento, análise, segurança, pagamento e outros operadores que apoiam a prestação dos serviços, além de autoridades quando houver obrigação legal."],
  ["6. Cookies e medição", ""],
  ["7. Retenção e segurança", "Mantemos dados pelo período necessário às finalidades informadas, à execução contratual e ao cumprimento de prazos legais. Adotamos medidas técnicas e administrativas proporcionais aos riscos, sem prometer segurança absoluta."],
  ["8. Direitos do titular", "Nos termos da LGPD, você pode solicitar confirmação e acesso, correção, anonimização, bloqueio ou eliminação quando cabíveis, portabilidade, informações sobre compartilhamento, revisão de decisões automatizadas e revogação do consentimento."],
  ["9. Atualizações", "Esta política pode ser atualizada para refletir mudanças legais, operacionais ou nos serviços. A data da versão vigente será indicada nesta página."],
];

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bg">
      <article className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16 pb-10 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold text-cream tracking-wide uppercase">Política de Privacidade</h1>
          <p className="text-muted mt-4 italic">Última atualização: 14 de agosto de 2026</p>
        </header>
        <div className="prose-legal space-y-6 text-muted leading-relaxed">
          <p>A <strong className="text-cream">{COMPANY_INFO.razaoSocial}</strong>, CNPJ <strong className="text-cream">{COMPANY_INFO.cnpj}</strong>, é responsável pelos tratamentos em que define finalidade e meios. Esta página apresenta informações gerais, sem expor arquitetura, fornecedores específicos ou controles internos.</p>
          {sections.map(([title, text]) => (
            <section key={title}>
              <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">{title}</h2>
              {title.startsWith("6") ? (
                <>
                  <p>Usamos cookies de duas naturezas:</p>
                  <p>
                    <strong className="text-cream">Medição de audiência.</strong> Google Analytics e Microsoft Clarity, para entender
                    como o site é usado e o que precisa melhorar. A base legal é o legítimo
                    interesse (art. 7º, IX, da LGPD), e os dados são tratados de forma agregada.
                  </p>
                  <p>
                    <strong className="text-cream">Publicidade.</strong> Meta Pixel e Google Ads, para medir e direcionar campanhas.
                    Sem o seu consentimento, eles não gravam cookies nem usam seus dados para publicidade;
                    o consentimento é pedido no primeiro acesso. Recusar não limita nenhuma funcionalidade do
                    site.
                  </p>
                  <p>
                    Você pode rever sua escolha a qualquer momento limpando os dados do site no seu
                    navegador.
                  </p>
                </>
              ) : (
                <p>{text}</p>
              )}
            </section>
          ))}
          <p className="mt-12 pt-6 border-t border-border">
            <strong className="text-cream">Canal de privacidade:</strong>{" "}
            <a href="mailto:contato@rook.com.br" className="text-cream underline hover:text-terracota transition-colors">
              contato@rook.com.br
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}
