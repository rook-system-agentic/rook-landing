import { localBlogPosts } from "@/content/blog-posts";
import type { BlogDataSource, BlogFaq, BlogListOptions, BlogPost, BlogStatus } from "@/lib/blog-types";

// ROO-1125: a origem vinha daqui, com default no domínio ANTIGO
// (`rooksystem.com.br`) — era a fonte das URLs de post no sitemap, e por isso
// os 6 posts do blog apareciam no domínio errado. Agora deriva do módulo
// canônico. Reexportado como `siteUrl` para não quebrar os consumidores.
import { SITE_ORIGIN } from "@/lib/site-origin";

export const siteUrl = SITE_ORIGIN;

type SupabaseBlogRow = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt: string;
  direct_answer?: string | null;
  content?: string | null;
  content_markdown?: string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  author_id?: string | null;
  author_name: string;
  author_role?: string | null;
  category: string;
  tags?: string[] | null;
  status: BlogStatus;
  primary_keyword?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  schema_faq?: BlogFaq[] | null;
  data_sources?: BlogDataSource[] | null;
  methodology_note?: string | null;
  reading_time_min?: number | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function shouldUseSupabase() {
  return Boolean(supabaseUrl && supabaseKey);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function toBlogPost(row: SupabaseBlogRow): BlogPost {
  const contentMarkdown = row.content_markdown || row.content || "";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    directAnswer: row.direct_answer,
    contentMarkdown,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    authorId: row.author_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    category: row.category,
    tags: row.tags || [],
    status: row.status,
    primaryKeyword: row.primary_keyword,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    schemaFaq: row.schema_faq || [],
    dataSources: row.data_sources || [],
    methodologyNote: row.methodology_note,
    readingTimeMin: row.reading_time_min || estimateReadingTime(contentMarkdown),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchSupabasePosts(): Promise<BlogPost[]> {
  if (!shouldUseSupabase()) return [];

  const endpoint = new URL(`${supabaseUrl!.replace(/\/$/, "")}/rest/v1/blog_posts`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("status", "eq.published");
  endpoint.searchParams.set("order", "published_at.desc");

  try {
    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn("[blog] Supabase returned", response.status, response.statusText);
      return [];
    }

    const rows = (await response.json()) as SupabaseBlogRow[];
    return rows.map(toBlogPost);
  } catch (error) {
    console.warn("[blog] Falling back to local posts:", error);
    return [];
  }
}

async function allPosts() {
  const remotePosts = await fetchSupabasePosts();
  const postsBySlug = new Map(localBlogPosts.map((post) => [post.slug, post]));

  for (const post of remotePosts) {
    postsBySlug.set(post.slug, post);
  }

  const posts = Array.from(postsBySlug.values());

  return posts
    .filter((post) => post.status === "published")
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
}

export async function getPublishedPosts(options: BlogListOptions = {}) {
  const posts = await allPosts();
  const filtered = posts.filter((post) => {
    if (options.category && normalizeText(post.category) !== normalizeText(options.category)) return false;
    if (options.tag && !post.tags.some((tag) => normalizeText(tag) === normalizeText(options.tag!))) return false;
    return true;
  });

  const offset = options.offset || 0;
  const limit = options.limit || filtered.length;
  return filtered.slice(offset, offset + limit);
}

export async function getAllPublishedPosts() {
  return allPosts();
}

export async function getPostBySlug(slug: string) {
  const posts = await allPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3) {
  const posts = await allPosts();
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const categoryScore = candidate.category === post.category ? 2 : 0;
      const tagScore = candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      return { candidate, score: categoryScore + tagScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getBlogCategories() {
  const posts = await allPosts();
  return Array.from(new Set(posts.map((post) => post.category))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function postUrl(post: BlogPost) {
  return `${siteUrl}/blog/${post.slug}/`;
}

export function formatBlogDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function estimateReadingTime(markdown: string) {
  const words = markdownToPlainText(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
