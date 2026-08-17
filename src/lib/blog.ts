import { cache } from "react";
import { localBlogPosts } from "@/content/blog-posts";
import {
  resolveBlogCollection,
  resolveMissingSlugBehavior,
  type BlogCollection,
  type BlogFetchOutcome,
  type BlogSourceStatus,
  type MissingSlugBehavior,
} from "@/lib/blog-source.mjs";
import type { BlogDataSource, BlogFaq, BlogListOptions, BlogPost, BlogStatus } from "@/lib/blog-types";

export type { BlogSourceStatus, MissingSlugBehavior } from "@/lib/blog-source.mjs";

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

type SupabaseFetchResult = {
  outcome: BlogFetchOutcome;
  posts: BlogPost[];
  /** Motivo curto, publicável. O erro cru vai só para o log. */
  reason: string | null;
  /** Texto completo do erro, para o log do servidor. Nunca sai numa resposta. */
  detail: string | null;
};

async function fetchSupabasePosts(): Promise<SupabaseFetchResult> {
  // Sem URL ou chave não houve consulta nenhuma. Isso não é "a consulta veio
  // vazia" nem "a consulta falhou" — é um terceiro caso, e confundi-lo com os
  // outros é exatamente como a queda ficava invisível.
  if (!shouldUseSupabase()) {
    return { outcome: "unconfigured", posts: [], reason: "sem SUPABASE_URL/chave", detail: null };
  }

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
      // Tabela inexistente (o caso de homologação hoje) chega aqui como 404
      // com corpo PostgREST. O corpo entra só no log: pode nomear schema e
      // relação, e a rota de diagnóstico é pública.
      const body = await response.text().catch(() => "");
      return {
        outcome: "failed",
        posts: [],
        reason: `HTTP ${response.status}`,
        detail: `${response.status} ${response.statusText} ${body}`.trim().slice(0, 500),
      };
    }

    const rows = (await response.json()) as SupabaseBlogRow[];
    return { outcome: "ok", posts: rows.map(toBlogPost), reason: null, detail: null };
  } catch (error) {
    return {
      outcome: "failed",
      posts: [],
      reason: "falha de rede",
      detail: error instanceof Error ? error.message : "erro desconhecido",
    };
  }
}

/**
 * Carrega os artigos E o diagnóstico da origem.
 *
 * `cache()` é por requisição: a página do blog chama a listagem e as
 * categorias, e sem isto o log sairia duplicado para uma queda só.
 */
const loadBlog = cache(async (): Promise<BlogCollection> => {
  const remote = await fetchSupabasePosts();
  const collection = resolveBlogCollection({
    outcome: remote.outcome,
    remotePosts: remote.posts,
    localPosts: localBlogPosts,
    reason: remote.reason,
  });

  // Critério 1 do ROO-1116: a falha precisa deixar sinal. `console.error`
  // (não `warn`) porque é isto que a coleta de log do runtime trata como
  // incidente — o `console.warn` antigo se perdia no ruído.
  if (collection.status.source === "fallback") {
    console.error("[ROO-1116] Blog caiu para os posts locais", {
      reason: remote.reason,
      detail: remote.detail,
      servedPostCount: collection.status.servedPostCount,
    });
  } else if (collection.status.source === "unconfigured") {
    // Normal na máquina de quem desenvolve, erro de configuração em qualquer
    // ambiente publicado. Por isso `warn`, e por isso `/api/blog/status`
    // reporta o estado separado em vez de dizer só "degradado".
    console.warn("[ROO-1116] Blog sem Supabase configurado; servindo só a semente local");
  } else if (collection.status.source === "empty") {
    // A consulta respondeu e disse que não há artigo publicado. Não é falha,
    // mas em produção é anormal o bastante para merecer registro.
    console.warn("[ROO-1116] Supabase respondeu sem nenhum artigo publicado");
  }

  return collection;
});

async function allPosts() {
  return (await loadBlog()).posts;
}

/**
 * Critério 2 do ROO-1116: dá para responder "o blog está servindo dado fresco
 * ou fallback?" sem abrir o código. Serve `/api/blog/status` e as telas.
 */
export async function getBlogSourceStatus(): Promise<BlogSourceStatus> {
  return (await loadBlog()).status;
}

export async function getBlogCollection(): Promise<BlogCollection> {
  return loadBlog();
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

/**
 * Procura um artigo pelo slug e devolve, junto, o que fazer se ele não vier.
 *
 * Substituiu o antigo `getPostBySlug`, que devolvia só `BlogPost | null`. Com
 * aquela assinatura era impossível para quem chamava distinguir "esse artigo
 * não existe" de "não consegui perguntar" — e as duas viravam o mesmo 404.
 * A regra em si mora em `resolveMissingSlugBehavior`, com a justificativa.
 */
export async function findPostBySlug(slug: string): Promise<{
  post: BlogPost | null;
  status: BlogSourceStatus;
  missingBehavior: MissingSlugBehavior;
}> {
  const { posts, status } = await loadBlog();
  return {
    post: posts.find((post) => post.slug === slug) || null,
    status,
    missingBehavior: resolveMissingSlugBehavior(status),
  };
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
