'use client';

import Link from "next/link";
import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate } from "@/lib/blog";

export default function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const coverImageUrl = post.coverImageUrl?.trim() || "/og-image-blog-template.png";
  const postHref = `/blog/${post.slug}/`;

  return (
    <article className={`card p-6 flex flex-col ${featured ? "lg:col-span-2" : ""}`}>
      <Link
        href={postHref}
        className="mb-5 block overflow-hidden rounded-lg border border-border bg-terracota/5 hover:border-terracota/30 transition-colors"
      >
        <img
          src={coverImageUrl}
          alt={post.coverImageAlt || post.title}
          className={`w-full object-cover ${featured ? "aspect-[16/7]" : "aspect-[3/2]"}`}
          loading={featured ? "eager" : "lazy"}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith("/og-image-blog-template.png")) {
              target.src = "/og-image-blog-template.png";
            }
          }}
        />
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="font-mono text-[11px] text-terracota uppercase tracking-wider">{post.category}</span>
        {post.publishedAt && <span className="text-xs text-muted">{formatBlogDate(post.publishedAt)}</span>}
        <span className="text-xs text-muted font-medium">• {post.readingTimeMin} min de leitura</span>
      </div>

      <h2 className={`${featured ? "text-2xl lg:text-3xl" : "text-xl"} font-bold leading-tight text-cream mb-3`}>
        <Link href={postHref} className="hover:text-terracota transition-colors">
          {post.title}
        </Link>
      </h2>

      {post.subtitle && <p className="text-sm text-ocre/90 mb-3">{post.subtitle}</p>}
      <p className="text-sm text-muted leading-relaxed mb-6">{post.excerpt}</p>

      <div className="mt-auto flex flex-wrap gap-2">
        {post.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-border px-3 py-1 text-[11px] text-muted">
            {tag}
          </span>
        ))}
      </div>

      <Link href={postHref} className="mt-6 text-sm font-semibold text-terracota hover:text-ocre transition-colors">
        Ler artigo →
      </Link>
    </article>
  );
}
