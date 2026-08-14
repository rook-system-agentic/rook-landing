"use client";

import { useEffect, useState } from "react";
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
 * Usa a função global `gtag`, definida no script inline da Task 11.
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
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsentState(estado));
  } catch {
    // Sem persistência, o visitante só vê o banner de novo na próxima visita.
  }
}

export default function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

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
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-card p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Usamos cookies para medir o uso do site e, com a sua autorização, para
          personalizar anúncios. Você pode recusar os anúncios e continuar
          navegando normalmente.{" "}
          <Link href="/privacidade/" className="text-cream underline hover:text-terracota transition-colors">
            Política de privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              atualizarConsentimento(defaultConsentState());
              setVisivel(false);
            }}
          >
            Recusar anúncios
          </button>
          <button
            type="button"
            className="btn-primary"
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
