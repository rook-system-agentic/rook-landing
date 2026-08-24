import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-origin";
import LpHero from "@/components/lp/LpHero";
import LpManifesto from "@/components/lp/LpManifesto";
import LpMethod from "@/components/lp/LpMethod";
import LpSources from "@/components/lp/LpSources";
import LpBoard from "@/components/lp/LpBoard";
import LpIntelligence from "@/components/lp/LpIntelligence";
import LpBriefing from "@/components/lp/LpBriefing";
import LpAuthority from "@/components/lp/LpAuthority";
import LpSector from "@/components/lp/LpSector";
import LpPartners from "@/components/lp/LpPartners";
import LpPricing from "@/components/lp/LpPricing";
import LpFaq from "@/components/lp/LpFaq";
import LpCta from "@/components/lp/LpCta";

/**
 * Home — v6 (24/08/2026), "o Rook na língua do dono".
 *
 * A ordem é a conversa que o dono precisa ter, e mudou na v6 porque a anterior
 * pedia paciência antes de dar motivo para tê-la:
 *
 *   promessa (hero) → integrações, que respondem "vai funcionar com o que eu já
 *   uso?" e emprestam a credibilidade dos parceiros → a dor dele (manifesto) →
 *   como funciona (método) → o produto por dentro (fontes, tabuleiro) → a prova
 *   que vale dinheiro (Rook.AI) → o hábito (briefing) → quem está por trás
 *   (autoridade) → você não está sozinho (setor) → oferta → dúvidas → fecho.
 *
 * O que saiu de lugar e por quê:
 *   - O MÉTODO era a segunda seção, antes de a página ter nomeado a dor.
 *     Explicar como funciona a quem ainda não se reconheceu no problema é
 *     responder pergunta que ninguém fez; agora vem depois do manifesto.
 *   - O ROOK.AI era a sétima seção. É a melhor prova do produto — um vazamento
 *     achado, quantificado e resolvido — e subiu para logo depois do tabuleiro.
 *   - O SETOR desceu para perto da oferta: a estatística agora conforta quem já
 *     entendeu a proposta, em vez de abrir a página com dado de mercado.
 *   - AS INTEGRAÇÕES subiram para logo abaixo do hero (24/08/2026). A v6 tinha
 *     posto ali uma faixa estática de logos, e a página passou a mostrar a
 *     MESMA lista duas vezes: a faixa nova e o marquee desta seção. Ficou a
 *     original — ela já rola sozinha, já traz o argumento em texto e já tem o
 *     CTA de solicitar integração. Uma lista só, no lugar onde a dúvida "vai
 *     funcionar com o meu sistema?" de fato aparece: logo depois da promessa.
 *
 * O atributo `data-lp-home` é o que aplica a paleta desta página. Ele é lido
 * por `body:has([data-lp-home])` no `globals.css`, e é assim que o Header e o
 * Footer — que vivem no layout, fora daqui — adotam a paleta nova sem que
 * nenhuma outra rota seja afetada. Remover este atributo devolve a página à
 * paleta antiga.
 *
 * Todo o texto vem de `@/lib/lp-content`.
 */
/*
 * A canonical da home mora aqui, e não no layout: no layout ela era herdada
 * por toda página sem canonical própria. Ver o comentário em `layout.tsx`.
 * O resto do metadata (título, descrição, openGraph) continua no layout, que é
 * onde faz sentido — a home É o padrão do site.
 */
/*
 * Título e descrição PRÓPRIOS da home, e não no layout (v6).
 *
 * O layout continua com o texto institucional porque ele é o padrão herdado
 * por toda rota que não declara o seu — inclusive /termos/ e /privacidade/,
 * onde "saiba todo dia se o seu restaurante deu lucro" seria mentira de
 * catálogo. Aqui a promessa é a mesma da manchete, que é o que o dono digita
 * no Google e o que ele vê quando alguém manda o link no WhatsApp.
 */
const TITULO = "Rook — Saiba todo dia se o seu restaurante deu lucro";
const DESCRICAO =
  "O Rook conecta vendas, notas e banco do seu restaurante e mostra, em reais, quanto sobrou — com resumo diário no WhatsApp e diagnóstico gratuito em 2 minutos.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: siteUrl() },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: siteUrl(),
    siteName: "Rook System",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div data-lp-home>
      {/* Progresso de leitura. Puramente decorativo — daí o aria-hidden — e
          invisível onde o navegador não tem timeline de scroll no CSS. */}
      <div className="lp-progress" aria-hidden="true" />
      <LpHero />
      <LpPartners />
      <LpManifesto />
      <LpMethod />
      <LpSources />
      <LpBoard />
      <LpIntelligence />
      <LpBriefing />
      <LpAuthority />
      <LpSector />
      <LpPricing />
      <LpFaq />
      <LpCta />
    </div>
  );
}
