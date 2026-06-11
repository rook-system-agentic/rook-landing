import { NextResponse } from "next/server";
import { escapeXml, getAllPublishedPosts, markdownToPlainText, postUrl, siteUrl } from "@/lib/blog";

export const revalidate = 60;

export async function GET() {
  const posts = await getAllPublishedPosts();
  const latest = posts[0]?.updatedAt || posts[0]?.publishedAt || new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = postUrl(post);
      const description = post.seoDescription || post.excerpt || markdownToPlainText(post.contentMarkdown).slice(0, 220);
      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <description>${escapeXml(description)}</description>
          <category>${escapeXml(post.category)}</category>
          <pubDate>${new Date(post.publishedAt || post.createdAt || Date.now()).toUTCString()}</pubDate>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Blog Rook System</title>
        <link>${escapeXml(`${siteUrl}/blog/`)}</link>
        <description>Inteligência financeira para restaurantes: CMV, DRE, compras, impostos e margem.</description>
        <language>pt-BR</language>
        <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
