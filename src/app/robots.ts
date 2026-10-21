import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { indexabilityDecision } from "@/lib/indexability-policy.mjs";
import { siteUrl } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const decision = indexabilityDecision({
    environment: process.env.NEXT_PUBLIC_ENV,
    deploymentEnvironment: process.env.VERCEL_ENV,
    host: headers().get("host"),
  });

  // O cabeçalho X-Robots-Tag (next.config.mjs) retira páginas já rastreadas do
  // índice. Mantemos o crawl permitido em host não indexável para que o robô
  // consiga ler esse noindex e remover URLs antigas; o sitemap só aparece no
  // www oficial.
  if (!decision.indexable) {
    return { rules: [{ userAgent: "*", allow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: siteUrl("/sitemap.xml"),
  };
}
