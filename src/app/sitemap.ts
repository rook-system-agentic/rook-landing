import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rooksystem.com.br";
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/funcionalidades/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/planos/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sobre/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}
