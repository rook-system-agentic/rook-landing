import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
import { COMPANY_INFO } from "@/lib/company";

export const metadata: Metadata = {
  title: "Termos de Uso do Site — Rook System",
  description: "Condições gerais de acesso ao site público do Rook System.",
  alternates: { canonical: siteUrl("/termos/") },
};

const sections = [
  ["1. Escopo", "Estes termos regulam o acesso ao site público do Rook System e aos seus conteúdos institucionais. A contratação e o uso da plataforma SaaS são regidos por contrato próprio, apresentado ao cliente no fluxo de contratação."],
  ["2. Conteúdo informativo", "As informações deste site têm caráter geral e podem ser atualizadas sem aviso prévio. Elas não constituem aconselhamento contábil, fiscal, jurídico, financeiro ou recomendação de investimento."],
  ["3. Uso permitido", "Você deve utilizar este site de forma lícita e não pode tentar acessar áreas restritas, interferir em seu funcionamento, automatizar coletas não autorizadas ou violar direitos de terceiros."],
  ["4. Propriedade intelectual", "Marcas, textos, identidade visual, materiais e demais conteúdos pertencem ao Rook System ou a seus licenciadores. Nenhum direito é transferido pelo simples acesso ao site."],
  ["5. Serviços de terceiros", "O site pode conter links ou recursos mantidos por terceiros. O Rook System não controla esses ambientes e não responde por sua disponibilidade, conteúdo ou práticas."],
  ["6. Disponibilidade", "Empregamos esforços razoáveis para manter o site disponível e seguro, mas podem ocorrer interrupções, manutenções ou falhas externas."],
  ["7. Privacidade", "O tratamento de dados pessoais relacionados ao site segue a nossa Política de Privacidade. Ao enviar um formulário, você declara que as informações fornecidas são verdadeiras e que está autorizado a compartilhá-las."],
  ["8. Legislação e contato", "Estes termos são regidos pelas leis brasileiras. Dúvidas podem ser encaminhadas para contato@rook.com.br."],
];

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-bg">
      <article className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16 pb-10 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold text-cream tracking-wide uppercase">Termos de Uso do Site</h1>
          <p className="text-muted mt-4 italic">Última atualização: 31 de julho de 2026</p>
        </header>
        <div className="prose-legal space-y-6 text-muted leading-relaxed">
          <p>Este site é mantido pela <strong className="text-cream">{COMPANY_INFO.razaoSocial}</strong>, CNPJ <strong className="text-cream">{COMPANY_INFO.cnpj}</strong>.</p>
          {sections.map(([title, text]) => (
            <section key={title} id={title.startsWith("8") ? "contato" : undefined}>
              <h2 className="text-2xl text-terracota font-semibold mt-12 mb-4">{title}</h2>
              <p>
                {title.startsWith("8") ? (
                  <>
                    Estes termos são regidos pelas leis brasileiras. Dúvidas podem ser encaminhadas para{" "}
                    <a href="mailto:contato@rook.com.br" className="text-cream underline hover:text-terracota transition-colors">
                      contato@rook.com.br
                    </a>.
                  </>
                ) : (
                  text
                )}
              </p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
