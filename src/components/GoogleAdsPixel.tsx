"use client";
import Script from "next/script";
import { isTrackingEnabled } from "@/lib/tracking";

/**
 * Google Ads Conversion Tracking (gtag.js)
 *
 * Reuses the existing gtag/dataLayer from GoogleAnalytics component.
 * Only adds the Google Ads config call so conversions are tracked.
 *
 * Set NEXT_PUBLIC_GOOGLE_ADS_ID in Vercel env vars (format: AW-XXXXXXXXX).
 */
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function GoogleAdsPixel() {
  // Homologação não rastreia. Ver src/lib/tracking.ts.
  if (!isTrackingEnabled()) return null;

  if (!GOOGLE_ADS_ID) return null;

  return (
    <Script id="google-ads-pixel" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('config', '${GOOGLE_ADS_ID}');
      `}
    </Script>
  );
}
