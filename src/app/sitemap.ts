import type { MetadataRoute } from "next";
import { getAllPublishedPosts, postUrl } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://rooksystem.com.br";
  const now = new Date().toISOString();
  const posts = await getAllPublishedPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/funcionalidades/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/planos/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sobre/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: postUrl(post),
    lastModified: post.updatedAt || post.publishedAt || now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
