import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Homologação recusa todo robô. O cabeçalho X-Robots-Tag (next.config.mjs)
  // cobre o que já foi rastreado; isto impede o rastreamento começar.
  if (process.env.NEXT_PUBLIC_ENV === "homolog") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: "https://rook.com.br/sitemap.xml",
  };
}
