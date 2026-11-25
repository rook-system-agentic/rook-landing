"use client";

import { HEALTH_TRACKING_DESTINATION } from "@/lib/health-whatsapp.mjs";
import { track, TRACKING_EVENTS } from "@/lib/track";

type HealthWhatsappCtaProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * O botão que abre a conversa no WhatsApp.
 *
 * É componente de cliente só por causa do clique medido: o evento é o
 * `cta_click` que já existe na allowlist, com um `destination` fixo. Nada do
 * visitante segue junto — nem poderia, a página não coleta nada.
 *
 * `track()` nunca derruba o clique: fora de produção ele relança para o erro
 * aparecer, em produção devolve `false` e o link segue abrindo.
 */
export default function HealthWhatsappCta({ href, children, className = "btn-primary" }: HealthWhatsappCtaProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        track(TRACKING_EVENTS.ctaClick, { destination: HEALTH_TRACKING_DESTINATION });
      }}
    >
      {children}
    </a>
  );
}
