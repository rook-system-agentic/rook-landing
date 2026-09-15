import type { Metadata } from "next";
import ConsultativeExperience from "@/components/acquisition/ConsultativeExperience";
import { siteUrl } from "@/lib/site-origin";
export const metadata: Metadata = {
  title: "Conheça o Rook — solicite uma demonstração",
  description: "Conte sobre seu estabelecimento e conheça a inteligência financeira do Rook.",
  alternates: { canonical: siteUrl("/planos/") },
};
// A URL existente continua atendida, agora com a jornada comercial sem preço público.
export default function PlanosPage() { return <ConsultativeExperience initialMode="form" />; }
