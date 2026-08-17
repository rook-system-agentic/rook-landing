"use client";

import Script from "next/script";
import { isTrackingEnabled } from "@/lib/tracking";

const CLARITY_ID = "x4y25y8xz4";

export default function MicrosoftClarity() {
  // Homologação não rastreia. Ver src/lib/tracking.ts.
  if (!isTrackingEnabled()) return null;

  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  /*
   * `lazyOnload`, e não `afterInteractive` (ROO-1124).
   *
   * O Clarity é o terceiro mais caro da página: medido em produção em
   * 17/08/2026, ele sozinho abre quatro hosts — www., scripts., c. e
   * i.clarity.ms — de um total de doze hosts de terceiros na home. Em
   * `afterInteractive` isso tudo disputa a linha principal enquanto o celular
   * ainda está pintando a primeira tela, e é parte do TBT de 410 ms.
   *
   * `lazyOnload` empurra a carga para depois do `load`, quando a página já
   * está na tela. O que se perde: o primeiro segundo da gravação de sessão e
   * do mapa de calor. O que NÃO se perde: nada de conversão — Clarity é
   * ferramenta de observação de comportamento, não pixel de anúncio. Por isso
   * o Google Analytics, o Google Ads e o Meta Pixel continuam em
   * `afterInteractive`: atribuição de campanha não pode chegar atrasada.
   */
  return (
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
