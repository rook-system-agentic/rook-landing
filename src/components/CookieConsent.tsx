"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_STORAGE_KEY,
  defaultConsentState,
  grantedConsentState,
  parseConsentState,
  serializeConsentState,
} from "@/lib/consent.mjs";
import { isTrackingEnabled } from "@/lib/tracking";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Usa a função global `gtag`, definida em GoogleTagManager.tsx antes de o
 * contêiner subir.
 *
 * Empurrar um array literal para o dataLayer NÃO é equivalente: o `gtag`
 * empurra o objeto `arguments`, e é esse formato que o Consent Mode espera.
 * Se `gtag` não existir, o contêiner não subiu — e aí não há consentimento a
 * atualizar, só o valor a persistir para a próxima visita.
 *
 * O `localStorage.setItem` fica em try/catch: em Safari com "bloquear todos
 * os cookies", em webview restrita e em iframe com armazenamento
 * particionado, esse acesso lança. Falha em persistir não pode impedir o
 * banner de sumir da tela — o consentimento já foi aplicado à sessão pelo
 * `gtag` acima; só a lembrança para a próxima visita se perde.
 */
function atualizarConsentimento(estado: Record<string, string>) {
  window.gtag?.("consent", "update", estado);

  // POR QUE ESTE EVENTO EXISTE, ALÉM DO gtag('consent','update')
  //
  // As tags Meta no contêiner são HTML personalizado com checagem de
  // `ad_storage`. Quando o visitante chega, o gatilho de visualização de
  // página dispara com a publicidade negada e o GTM bloqueia o pixel — certo.
  // Mas o GTM NÃO re-dispara tag de HTML personalizado quando o consentimento
  // é concedido depois: o gatilho já passou. Medido em produção em 21/08/2026.
  //
  // O efeito não é só perder o PageView daquela página. `Meta - Lead` dispara
  // em `generate_lead`, já com consentimento, e chama `fbq(...)` — que não
  // existe, porque o pixel base nunca rodou ali. Quem cai em /planos, aceita
  // o banner e envia o formulário sem navegar perde a conversão, em silêncio.
  //
  // Este evento dá ao contêiner um gatilho para subir o pixel base no momento
  // do aceite. Só é emitido quando a publicidade é concedida: para quem
  // recusa, nada deve subir. Visitante que volta não passa por aqui (o banner
  // não aparece), então não há disparo em dobro.
  if (estado.ad_storage === "granted") {
    window.dataLayer?.push({ event: "consent_ads_granted" });
  }

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsentState(estado));
  } catch {
    // Sem persistência, o visitante só vê o banner de novo na próxima visita.
  }
}

export default function CookieConsent() {
  const [visivel, setVisivel] = useState(false);
  const banner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visivel || !banner.current) return;
    const updateOffset = () => document.documentElement.style.setProperty('--rook-cookie-height', `${banner.current?.getBoundingClientRect().height || 0}px`);
    const observer = new ResizeObserver(updateOffset);
    observer.observe(banner.current);
    updateOffset();
    return () => {observer.disconnect(); document.documentElement.style.removeProperty('--rook-cookie-height');};
  }, [visivel]);

  useEffect(() => {
    if (!isTrackingEnabled()) return;
    let salvo = null;
    try {
      salvo = parseConsentState(localStorage.getItem(CONSENT_STORAGE_KEY));
    } catch {
      // Mesmo risco de exceção da escrita acima, na leitura: trata como se
      // não houvesse nada salvo e mostra o banner, sem derrubar a página.
    }
    if (!salvo) setVisivel(true);
  }, []);

  if (!visivel) return null;

  return (
    <div
      ref={banner}
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-card px-4 py-3 shadow-lg sm:p-4"
    >
      {/* ROO-1876: no celular o banner ocupava ~1/4 da primeira tela e
          disputava espaço com o CTA da /bl1. Mesmo texto e mesmas opções, com
          fonte menor e botões lado a lado. */}
      <div className="mx-auto flex max-w-4xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs leading-snug text-muted sm:text-sm sm:leading-normal">
          Usamos cookies para medir o uso do site e, com a sua autorização, para
          personalizar anúncios. Você pode recusar os anúncios e continuar
          navegando normalmente.{" "}
          <Link href="/privacidade/" className="text-cream underline hover:text-terracota transition-colors">
            Política de privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="btn-ghost flex-1 !px-3 !py-2 text-sm sm:flex-none sm:!px-5 sm:!py-3 sm:text-[15px]"
            onClick={() => {
              atualizarConsentimento(defaultConsentState());
              setVisivel(false);
            }}
          >
            Recusar anúncios
          </button>
          <button
            type="button"
            className="btn-primary flex-1 !px-3 !py-2 text-sm sm:flex-none sm:!px-7 sm:!py-3.5 sm:text-[15px]"
            onClick={() => {
              atualizarConsentimento(grantedConsentState());
              setVisivel(false);
            }}
          >
            Aceitar tudo
          </button>
        </div>
      </div>
    </div>
  );
}
