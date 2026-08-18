import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";

export const metadata: Metadata = {
  title: "Setores atendidos | Rook System",
  description:
    "O Rook atende o food service: restaurantes, bares, cafeterias, padarias e redes. Inteligência financeira sobre os dados que a operação já emite.",
  alternates: {
    canonical: siteUrl("/setores/"),
  },
};

/*
 * Stub (18/08/2026): a página existe para a navegação do redesenho v5 não
 * apontar para o vazio. O conteúdo por setor vem depois.
 */
export default function SetoresPage() {
  return (
    <>
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label mb-6">— Setores</p>
          <h1 className="heading-hero mb-8">
            Food service, por <em>inteiro.</em>
          </h1>
          <p className="text-body max-w-2xl mb-6">
            Restaurantes, bares, cafeterias, padarias e redes multiunidade. O método é o mesmo em
            todos: o Rook lê o que a operação já emite — PDV, ERP, Open Finance, SEFAZ, eSocial e
            adquirentes — interpreta as seis etapas e devolve a próxima decisão em reais.
          </p>
          <p className="text-body max-w-2xl mb-10">
            Para redes e franquias, o módulo Chess consolida o grupo e soma a visão multiunidade
            ao plano da casa.
          </p>
          <Link href="/diagnostico/" className="btn-primary">
            Fazer meu diagnóstico →
          </Link>
        </div>
      </section>
    </>
  );
}
