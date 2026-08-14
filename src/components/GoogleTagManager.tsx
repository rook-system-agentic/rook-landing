"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isTrackingEnabled } from "@/lib/tracking";
import { resolvePageType } from "@/lib/tracking-events.mjs";
import {
  CONSENT_STORAGE_KEY,
  defaultConsentState,
} from "@/lib/consent.mjs";

const GTM_ID = "GTM-M8ZJ3WTV";

/**
 * Carrega o contêiner GTM, que é COMPARTILHADO com app.rook.com.br.
 *
 * Toda tag criada nesse contêiner precisa de condição de hostname. Sem ela,
 * uma tag de GA4 configurada para a LP dispararia também nas telas do app —
 * que envia page_view manualmente e desliga o automático. O app passaria a
 * contar cada tela duas vezes, e o defeito não apareceria: o número só cresce.
 *
 * A camada de dados é inicializada ANTES do contêiner. Contêiner que sobe
 * antes dela não sabe em que página está.
 */
export default function GoogleTagManager() {
  const pathname = usePathname();

  if (!isTrackingEnabled()) return null;

  const consentBootstrap = `
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    var salvo=null;
    try{salvo=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}));}catch(e){}
    gtag('consent','default', salvo || ${JSON.stringify(defaultConsentState())});
    window.dataLayer.push(${JSON.stringify({
      page_type: resolvePageType(pathname),
      environment: "production",
    })});
  `;

  return (
    <>
      <Script id="gtm-data-layer" strategy="beforeInteractive">
        {consentBootstrap}
      </Script>
      <Script id="gtm-container" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
