import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/company";

export const metadata: Metadata = {
  title: "Termos de Uso — Rook System",
  description: "Termos de Uso do Rook System - Condições de acesso e uso da plataforma.",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-bg">
      <article className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16 pb-10 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold text-cream tracking-wide uppercase">
            Termos de Uso
          </h1>
          <p className="text-muted mt-4 italic">Última atualização: 07 de dezembro de 2025</p>
        </header>

        <div className="prose-legal space-y-6 text-muted leading-relaxed">
          <p>
            Bem-vindo ao Rook System! Estes Termos de Uso regem o seu acesso e uso da nossa plataforma de gestão financeira para restaurantes. Os Serviços são fornecidos pela <strong className="text-cream">{COMPANY_INFO.razaoSocial}</strong>, CNPJ <strong className="text-cream">{COMPANY_INFO.cnpj}</strong>.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou usar os Serviços, você concorda em ficar vinculado a estes Termos. Se você não concordar, não deverá usar os Serviços.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">2. Descrição dos Serviços</h2>
          <p>
            O Rook System é uma plataforma SaaS que ajuda restaurantes a otimizar sua gestão financeira através do controle de CMV, projeções preditivas e dashboards inteligentes.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">3. Planos e Pagamentos</h2>
          <p>
            Oferecemos planos gratuitos (Pawn) e pagos (Knight, Rook, Chess). Assinaturas pagas são renovadas automaticamente. Você pode cancelar a qualquer momento através das configurações da sua conta.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">4. Suas Responsabilidades</h2>
          <p>
            Você é responsável por fornecer informações precisas, manter a confidencialidade da sua senha e usar os Serviços de forma legal. Você não deve tentar obter acesso não autorizado aos nossos sistemas ou usar os Serviços para fins ilegais.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">5. Propriedade Intelectual</h2>
          <p>
            O Rook System e todo o seu conteúdo são de propriedade exclusiva da {COMPANY_INFO.razaoSocial}. Você retém todos os direitos sobre os dados que insere na plataforma.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">6. Limitação de Responsabilidade</h2>
          <p>
            Nossa responsabilidade total não excederá o valor pago por você nos últimos 6 meses. Não seremos responsáveis por danos indiretos ou consequenciais.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">7. Rescisão</h2>
          <p>
            Você pode cancelar sua conta a qualquer momento. Podemos suspender ou encerrar seu acesso aos Serviços com ou sem aviso prévio.
          </p>

          <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">8. Legislação Aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Foro: Brasília-DF.
          </p>

          <p className="mt-12 pt-6 border-t border-border">
            <strong className="text-cream">Contato:</strong> contato@rooksystem.com.br
          </p>
        </div>
      </article>
    </main>
  );
}
