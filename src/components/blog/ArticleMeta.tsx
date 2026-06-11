import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate } from "@/lib/blog";

export default function ArticleMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
      <span>{post.authorName}</span>
      {post.authorRole && <span className="hidden sm:inline">•</span>}
      {post.authorRole && <span>{post.authorRole}</span>}
      {post.publishedAt && <span className="hidden sm:inline">•</span>}
      {post.publishedAt && <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>}
      <span className="hidden sm:inline">•</span>
      <span>{post.readingTimeMin} min de leitura</span>
    </div>
  );
}

