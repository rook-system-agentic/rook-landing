"use client";

import Script from "next/script";
import { isTrackingEnabled } from "@/lib/tracking";

const GA_MEASUREMENT_ID = "G-PM4DF3FFMN";

export default function GoogleAnalytics() {
  // Homologação não rastreia. Ver src/lib/tracking.ts.
  if (!isTrackingEnabled()) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
