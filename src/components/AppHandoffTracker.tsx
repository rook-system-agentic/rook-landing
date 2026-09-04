"use client";

import { useEffect } from "react";
import { track, TRACKING_EVENTS } from "@/lib/track";
import { resolveAppHandoff } from "@/lib/tracking-events.mjs";
import { lpExperimentDims } from "@/lib/lp-experiment-client";

/**
 * Registra o momento em que a pessoa sai da LP para o app.
 *
 * Escuta cliques no documento em vez de instrumentar cada CTA: os links para o
 * app aparecem no Header, no Footer, na página de planos e no link de checkout
 * direto, e um CTA novo amanhã passaria a ser medido sem ninguém lembrar.
 *
 * A decisão (é saída para o app? para qual destino?) mora em
 * `resolveAppHandoff` (tracking-events.mjs), testável sem navegador. Este
 * componente só liga o clique do DOM a essa decisão.
 */
export default function AppHandoffTracker() {
  useEffect(() => {
    function onClick(evento: MouseEvent) {
      const alvo = evento.target as HTMLElement | null;
      const link = alvo?.closest?.("a");

      if (!link) return;

      const destino = resolveAppHandoff(link.href, window.location.href);
      if (!destino) return;

      // As dimensões do experimento de /planos (ROO-1207) viajam junto: com
      // `destino=contratar` este evento é o início do checkout por variante.
      track(TRACKING_EVENTS.appHandoff, { destino, ...lpExperimentDims() });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
