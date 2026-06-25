import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/company";

export const metadata: Metadata = {
  title: "Política de Privacidade — Rook System",
  description:
    "Política de Privacidade do Rook System - Como coletamos, usamos e protegemos seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-bg">
      <article className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16 pb-10 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold text-cream tracking-wide uppercase">
            Política de Privacidade
          </h1>
          <p className="text-muted mt-4 italic">
            Última atualização: 07 de dezembro de 2025
          </p>
        </header>

        <div className="prose-legal space-y-6 text-muted leading-relaxed">
          <p>
            Bem-vindo à Política de Privacidade do Rook System. A sua privacidade
            e a segurança dos seus dados são de extrema importância para nós. Este
            documento explica como a{" "}
            <strong className="text-cream">{COMPANY_INFO.razaoSocial}</strong>, pessoa jurídica de
            direito privado, inscrita no CNPJ sob o nº{" "}
            <strong className="text-cream">{COMPANY_INFO.cnpj}</strong>, com sede em{" "}
            <strong className="text-cream">{COMPANY_INFO.endereco}</strong>{" "}
            (doravante &quot;Rook System&quot;, &quot;nós&quot; ou
            &quot;nosso&quot;), coleta, usa, compartilha e protege as informações
            dos usuários (&quot;você&quot;) de nossa plataforma e serviços.
          </p>

          <p>
            Esta política se aplica à nossa landing page (www.rooksystem.com.br),
            nossa aplicação web (app.rooksystem.com.br) e todos os serviços
            relacionados.
          </p>

          {/* 1. Definições */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            1. Definições Importantes
          </h2>
          <ul className="list-disc pl-8 space-y-2">
            <li>
              <strong className="text-cream">LGPD:</strong> Lei Geral de Proteção
              de Dados (Lei nº 13.709/2018).
            </li>
            <li>
              <strong className="text-cream">Dados Pessoais:</strong> Qualquer
              informação relacionada a uma pessoa natural identificada ou
              identificável.
            </li>
            <li>
              <strong className="text-cream">Tratamento:</strong> Toda operação
              realizada com dados pessoais, como coleta, produção, recepção,
              classificação, utilização, acesso, reprodução, transmissão,
              distribuição, processamento, arquivamento, armazenamento, eliminação,
              avaliação ou controle da informação, modificação, comunicação,
              transferência, difusão ou extração.
            </li>
            <li>
              <strong className="text-cream">Titular:</strong> Pessoa natural a
              quem se referem os dados pessoais que são objeto de tratamento.
            </li>
            <li>
              <strong className="text-cream">Controlador:</strong> Pessoa natural
              ou jurídica, de direito público ou privado, a quem competem as
              decisões referentes ao tratamento de dados pessoais. Neste caso, o
              Rook System.
            </li>
            <li>
              <strong className="text-cream">
                DPO (Data Protection Officer):
              </strong>{" "}
              Pessoa indicada pelo controlador para atuar como canal de comunicação
              entre o controlador, os titulares dos dados e a Autoridade Nacional de
              Proteção de Dados (ANPD).
            </li>
          </ul>

          {/* 2. Quais Dados Coletamos */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            2. Quais Dados Coletamos
          </h2>

          <h3 className="text-xl text-ocre font-medium mt-8 mb-4">
            2.1. Dados Fornecidos Diretamente por Você
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#1a1410]">
                  <th className="text-left p-4 text-cream font-medium">
                    Dado Coletado
                  </th>
                  <th className="text-left p-4 text-cream font-medium">
                    Finalidade
                  </th>
                  <th className="text-left p-4 text-cream font-medium">
                    Base Legal (LGPD)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Nome Completo, Email, Telefone, Senha
                  </td>
                  <td className="p-4">
                    Criação de conta, autenticação, comunicação e suporte.
                  </td>
                  <td className="p-4">Execução de Contrato</td>
                </tr>
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Nome da Empresa, CNPJ, Endereço
                  </td>
                  <td className="p-4">
                    Personalização da conta, faturamento e emissão de notas fiscais.
                  </td>
                  <td className="p-4">Execução de Contrato</td>
                </tr>
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Dados de Pagamento (via Stripe)
                  </td>
                  <td className="p-4">
                    Processamento de assinaturas e pagamentos.
                  </td>
                  <td className="p-4">Execução de Contrato</td>
                </tr>
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Informações de Suporte
                  </td>
                  <td className="p-4">
                    Resolução de problemas e melhoria do serviço.
                  </td>
                  <td className="p-4">Legítimo Interesse</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl text-ocre font-medium mt-8 mb-4">
            2.2. Dados Coletados Automaticamente
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#1a1410]">
                  <th className="text-left p-4 text-cream font-medium">
                    Dado Coletado
                  </th>
                  <th className="text-left p-4 text-cream font-medium">
                    Finalidade
                  </th>
                  <th className="text-left p-4 text-cream font-medium">
                    Base Legal (LGPD)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Endereço IP, Tipo de Navegador, Sistema Operacional
                  </td>
                  <td className="p-4">
                    Segurança, prevenção de fraudes e análise de uso.
                  </td>
                  <td className="p-4">Legítimo Interesse</td>
                </tr>
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Dados de Uso da Plataforma
                  </td>
                  <td className="p-4">
                    Melhoria do produto, identificação de gargalos e personalização
                    da experiência.
                  </td>
                  <td className="p-4">Legítimo Interesse</td>
                </tr>
                <tr>
                  <td className="p-4 text-cream font-medium">
                    Cookies e Tecnologias Similares
                  </td>
                  <td className="p-4">
                    Funcionalidades essenciais, análise de performance e marketing.
                  </td>
                  <td className="p-4">Consentimento / Legítimo Interesse</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl text-ocre font-medium mt-8 mb-4">
            2.3. Dados Financeiros e Operacionais do seu Negócio
          </h3>
          <p>
            Ao utilizar o Rook System, você inserirá dados financeiros e
            operacionais do seu restaurante, como faturamento, compras e custos
            (CMV), dados de vendas e informações de estoque.
          </p>
          <p>
            <strong className="text-cream">
              Estes dados são de sua propriedade.
            </strong>{" "}
            Nós apenas os utilizamos para realizar os cálculos, gerar os relatórios
            e fornecer as projeções preditivas que são o core do nosso serviço.{" "}
            <strong className="text-cream">
              Jamais compartilharemos ou venderemos esses dados a terceiros.
            </strong>
          </p>

          {/* 3. Como Usamos */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            3. Como Usamos Seus Dados
          </h2>
          <p>
            Utilizamos os dados coletados para fornecer e manter nossos serviços,
            melhorar e personalizar sua experiência, realizar comunicações
            importantes sobre sua conta, garantir a segurança da plataforma,
            oferecer suporte ao cliente e cumprir com obrigações legais e
            regulatórias.
          </p>

          {/* 4. Compartilhamento */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            4. Compartilhamento de Dados
          </h2>
          <p>
            Nós não vendemos seus dados pessoais. Compartilhamos informações apenas
            com parceiros tecnológicos estritamente necessários para a operação dos
            nossos serviços, nas seguintes categorias:
          </p>
          <ul className="list-disc pl-8 space-y-2">
            <li>Hospedagem e infraestrutura de aplicação</li>
            <li>Banco de dados e armazenamento seguro</li>
            <li>Processamento de pagamentos e assinaturas</li>
            <li>Análise de tráfego e comportamento do usuário</li>
            <li>Envio de emails transacionais</li>
          </ul>
          <p>
            Todos os parceiros são selecionados com base em critérios rigorosos de
            segurança, conformidade com a LGPD e certificações internacionais
            (ISO 27001, SOC 2). Nenhum parceiro tem acesso aos dados financeiros
            e operacionais do seu negócio além do estritamente necessário para a
            prestação do serviço.
          </p>

          {/* 5. Seus Direitos */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            5. Seus Direitos (LGPD)
          </h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados, você tem direito de
            confirmar a existência de tratamento dos seus dados, acessar seus dados
            a qualquer momento, corrigir dados incompletos ou desatualizados,
            anonimizar ou eliminar dados desnecessários, solicitar a portabilidade
            dos seus dados, eliminar dados tratados com seu consentimento, obter
            informações sobre compartilhamento e revogar o consentimento a qualquer
            momento.
          </p>
          <p>
            Para exercer qualquer um desses direitos, entre em contato com nosso DPO
            através do email{" "}
            <strong className="text-cream">juliana.abdala@abdalavega.adv.br</strong>.
          </p>

          {/* 6. Segurança */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            6. Segurança da Informação
          </h2>
          <p>
            Implementamos medidas técnicas e organizacionais robustas para proteger
            seus dados, incluindo criptografia de dados em trânsito (TLS 1.3) e em
            repouso (AES-256), controle rigoroso de acesso, utilização de provedores
            de nuvem com certificações ISO 27001 e SOC 2, e monitoramento contínuo
            24/7 para detectar e responder a ameaças de segurança.
          </p>

          {/* 7. DPO */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            7. Contato do DPO
          </h2>
          <p>
            Para qualquer dúvida sobre esta Política de Privacidade ou sobre o
            tratamento dos seus dados pessoais, entre em contato:
          </p>
          <ul className="list-disc pl-8 space-y-2">
            <li>
              <strong className="text-cream">Responsável:</strong> Abdala Vega Advogados
            </li>
            <li>
              <strong className="text-cream">Email:</strong>{" "}
              juliana.abdala@abdalavega.adv.br
            </li>
          </ul>

          {/* 8. Alterações */}
          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">
            8. Alterações a Esta Política
          </h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Quando o
            fizermos, notificaremos você por email ou através de um aviso em nossa
            plataforma. Recomendamos que você revise esta página regularmente para se
            manter informado sobre como estamos protegendo seus dados.
          </p>

          <p className="mt-12 pt-6 border-t border-border">
            <strong className="text-cream">Contato:</strong>{" "}
            contato@rooksystem.com.br
          </p>
        </div>
      </article>
    </main>
  );
}
