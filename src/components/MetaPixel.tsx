"use client";
import Script from "next/script";
import { isTrackingEnabled } from "@/lib/tracking";

/**
 * Meta (Facebook) Pixel
 *
 * Loads the Meta Pixel base code and fires PageView on every page.
 * Custom events (Lead, CompleteRegistration) can be fired from other
 * components via `window.fbq('track', 'Lead', { ... })`.
 *
 * Set NEXT_PUBLIC_META_PIXEL_ID in Vercel env vars (numeric string).
 */
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  // Homologação não rastreia. Ver src/lib/tracking.ts.
  if (!isTrackingEnabled()) return null;

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      {/*
        O pixel de fallback vai como HTML cru, e não como <img> de React.
        POR QUÊ (ROO-1124)

        Escrito como <img> de JSX, o Next enxergava a imagem mesmo dentro do
        <noscript> e emitia
          <link rel="preload" as="image" href="https://www.facebook.com/tr?...">
        como PRIMEIRA tag do <head> — antes até da folha de estilo. Medido em
        produção em 17/08/2026: o celular abria conexão com o facebook.com
        (DNS + TLS) na frente do CSS que pinta a tela, para buscar um pixel que
        só faz sentido quando o JavaScript está desligado.

        Efeito colateral que isso também corrige: com JavaScript ligado o
        PageView era disparado DUAS vezes — uma pelo preload do pixel, outra
        pelo fbq abaixo. O Meta contava a mesma visita em dobro.

        Em `dangerouslySetInnerHTML` o React não cria o elemento, então o
        varredor de preload do Next não tem o que encontrar. Sem JavaScript o
        navegador continua renderizando o <noscript> normalmente.
      */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`,
        }}
      />
    </>
  );
}
