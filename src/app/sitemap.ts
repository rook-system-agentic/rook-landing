import type { MetadataRoute } from "next";
import { getAllPublishedPosts, postUrl } from "@/lib/blog";
import { siteUrl } from "@/lib/site-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const posts = await getAllPublishedPosts();

  // ROO-1125: cada URL passa pelo helper. Concatenar sobre `siteUrl()` — que
  // devolve a raiz COM barra — produziria `https://www.rook.com.br//pagina/`,
  // e barra dupla é outra URL para o Google: trocaríamos um conflito de
  // canonização por outro.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl(), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: siteUrl("/funcionalidades/"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: siteUrl("/calculadora-cmv/"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/diagnostico/"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/planos/"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: siteUrl("/sobre/"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/blog/"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/privacidade/"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/termos/"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: postUrl(post),
    lastModified: post.updatedAt || post.publishedAt || now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
