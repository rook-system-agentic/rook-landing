"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isTrackingEnabled } from "@/lib/tracking";
import { resolvePageType } from "@/lib/tracking-events.mjs";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_KEYS,
  CONSENT_VALUES,
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
 *
 * POR QUE `window.gtag =` E NÃO `function gtag(){}`
 *
 * O `next/script` com `beforeInteractive` não emite este código como script
 * inline no HTML: ele vai para `self.__next_s`, e o runtime do Next o injeta
 * depois. Uma declaração `function gtag(){}` só se torna global se esse
 * runtime avaliar o trecho em escopo global — detalhe interno do Next, não
 * contrato. Atribuir a `window` não depende disso.
 *
 * A diferença importa porque o CookieConsent chama `window.gtag?.(...)` com
 * optional chaining: se a função não fosse global, o clique em "Aceitar tudo"
 * sumiria com o banner e NÃO atualizaria o consentimento — falha silenciosa
 * num controle de consentimento, o pior lugar possível para uma.
 */
export default function GoogleTagManager() {
  const pathname = usePathname();

  if (!isTrackingEnabled()) return null;

  const consentBootstrap = `
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
    var chaves=${JSON.stringify(CONSENT_KEYS)};
    var valores=${JSON.stringify(CONSENT_VALUES)};
    var salvo=null;
    try{
      var bruto=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}));
      var valido=bruto && typeof bruto==='object' && chaves.every(function(c){return valores.indexOf(bruto[c])!==-1;});
      if(valido){
        salvo={};
        for(var i=0;i<chaves.length;i++){salvo[chaves[i]]=bruto[chaves[i]];}
      }
    }catch(e){}
    window.gtag('consent','default', salvo || ${JSON.stringify(defaultConsentState())});
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
