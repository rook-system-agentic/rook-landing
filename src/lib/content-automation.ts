import { estimateReadingTime, postUrl } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog-types";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import type { ContentPack, ContentVariation, ContentChannel, PublicationJob, PublicationResult } from "@/lib/content-types";

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
  status: string;
  published_at: string;
};

type PublishOptions = {
  contentPackId: string;
  actor?: string;
  force?: boolean;
};

const manualChannels = new Set<ContentChannel>(["linkedin", "instagram_carousel", "instagram_caption", "story", "newsletter"]);

function first<T>(rows: T[] | T | null) {
  if (!rows) return null;
  if (Array.isArray(rows)) return rows[0] || null;
  return rows;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function plainText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFromPillar(pillar: ContentPack["pillar"]) {
  const categories: Record<ContentPack["pillar"], string> = {
    vendas: "Vendas",
    impostos: "Impostos",
    compras: "CMV e Compras",
    despesas: "Despesas",
    endividamento: "Endividamento",
    resultado: "Gestão Financeira",
    produto: "Produto Rook",
    marca: "Rook",
    outro: "Food Service",
  };

  return categories[pillar];
}

function ensureApproved(pack: ContentPack, force?: boolean) {
  if (force) return;
  if (!["approved", "scheduled"].includes(pack.status)) {
    throw new Error(`Content pack ${pack.id} precisa estar approved ou scheduled antes da publicação.`);
  }
}

function canPublishVariation(variation: ContentVariation, force?: boolean) {
  if (force) return true;
  return ["approved", "scheduled"].includes(variation.status);
}

async function getContentPack(contentPackId: string) {
  const rows = await supabaseAdminRequest<ContentPack[]>(
    `content_packs?id=eq.${encodeURIComponent(contentPackId)}&select=*`,
  );
  return first(rows);
}

async function getContentVariations(contentPackId: string) {
  return supabaseAdminRequest<ContentVariation[]>(
    `content_variations?content_pack_id=eq.${encodeURIComponent(contentPackId)}&select=*&order=created_at.asc`,
  );
}

async function createPublicationJob(
  pack: ContentPack,
  variation: ContentVariation,
  status: PublicationJob["status"],
  metadata: Record<string, unknown> = {},
) {
  const rows = await supabaseAdminRequest<PublicationJob[]>("publication_jobs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      content_pack_id: pack.id,
      variation_id: variation.id,
      channel: variation.channel,
      status,
      scheduled_at: pack.scheduled_at,
      metadata,
    }),
  });

  return first(rows);
}

async function patchPublicationJob(jobId: string, values: Partial<PublicationJob>) {
  const rows = await supabaseAdminRequest<PublicationJob[]>(`publication_jobs?id=eq.${encodeURIComponent(jobId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values),
  });

  return first(rows);
}

async function patchContentVariation(variationId: string, values: Partial<ContentVariation>) {
  const rows = await supabaseAdminRequest<ContentVariation[]>(`content_variations?id=eq.${encodeURIComponent(variationId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values),
  });

  return first(rows);
}

async function patchContentPack(packId: string, values: Partial<ContentPack>) {
  const rows = await supabaseAdminRequest<ContentPack[]>(`content_packs?id=eq.${encodeURIComponent(packId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values),
  });

  return first(rows);
}

function toBlogPostPayload(pack: ContentPack, variation: ContentVariation, now: string) {
  const slug = variation.slug || slugify(variation.title);
  const excerpt = variation.excerpt || plainText(variation.body).slice(0, 220);
  const readingTimeMin = variation.reading_time_min || estimateReadingTime(variation.body);

  return {
    slug,
    title: variation.title,
    subtitle: variation.subtitle,
    excerpt,
    direct_answer: variation.direct_answer,
    content_markdown: variation.body,
    cover_image_url: variation.cover_image_url,
    cover_image_alt: variation.cover_image_alt,
    author_name: variation.author_name || "Rook Editorial",
    author_role: variation.author_role || "Inteligência financeira para food service",
    category: variation.category || categoryFromPillar(pack.pillar),
    tags: variation.tags || [],
    status: "published",
    primary_keyword: variation.primary_keyword,
    seo_title: variation.seo_title || variation.title,
    seo_description: variation.seo_description || excerpt,
    canonical_url: variation.canonical_url,
    schema_faq: variation.schema_faq || [],
    data_sources: variation.data_sources || [],
    methodology_note: variation.methodology_note,
    reading_time_min: readingTimeMin,
    published_at: now,
  };
}

async function publishBlogVariation(pack: ContentPack, variation: ContentVariation): Promise<PublicationResult> {
  let job: PublicationJob | null = null;
  const now = new Date().toISOString();

  try {
    job = await createPublicationJob(pack, variation, "publishing", { source: "roo-145-blog-auto-publish" });
    const payload = toBlogPostPayload(pack, variation, now);
    const rows = await supabaseAdminRequest<BlogPostRow[]>("blog_posts?on_conflict=slug", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([payload]),
    });
    const blogPost = first(rows);

    if (!blogPost) {
      throw new Error("Supabase não retornou o post publicado.");
    }

    const blogPostForUrl = {
      slug: blogPost.slug,
    } as BlogPost;

    await patchContentVariation(variation.id, {
      status: "published",
      blog_post_id: blogPost.id,
    });

    if (job) {
      await patchPublicationJob(job.id, {
        status: "published",
        published_at: now,
        external_id: blogPost.id,
        external_url: postUrl(blogPostForUrl),
      });
    }

    return {
      channel: "blog",
      variationId: variation.id,
      status: "published",
      blogPostId: blogPost.id,
      externalUrl: postUrl(blogPostForUrl),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao publicar blog.";
    await patchContentVariation(variation.id, { status: "failed" });
    if (job) {
      await patchPublicationJob(job.id, { status: "failed", error_message: errorMessage });
    }

    return {
      channel: "blog",
      variationId: variation.id,
      status: "failed",
      errorMessage,
    };
  }
}

async function markManualRequired(pack: ContentPack, variation: ContentVariation): Promise<PublicationResult> {
  const job = await createPublicationJob(pack, variation, "manual_required", {
    reason: "API social ainda não configurada/aprovada. Conteúdo pronto para publicação manual assistida.",
  });

  await patchContentVariation(variation.id, { status: "manual_required" });

  return {
    channel: variation.channel,
    variationId: variation.id,
    status: "manual_required",
    externalUrl: job?.external_url || undefined,
  };
}

export async function publishApprovedContentPack(options: PublishOptions) {
  const pack = await getContentPack(options.contentPackId);
  if (!pack) {
    throw new Error(`Content pack ${options.contentPackId} não encontrado.`);
  }

  ensureApproved(pack, options.force);

  const variations = await getContentVariations(pack.id);
  const publishable = variations.filter((variation) => canPublishVariation(variation, options.force));

  if (publishable.length === 0) {
    throw new Error(`Content pack ${pack.id} não possui variações approved/scheduled para publicação.`);
  }

  const results: PublicationResult[] = [];

  for (const variation of publishable) {
    if (variation.channel === "blog") {
      results.push(await publishBlogVariation(pack, variation));
      continue;
    }

    if (manualChannels.has(variation.channel)) {
      results.push(await markManualRequired(pack, variation));
      continue;
    }

    results.push({
      channel: variation.channel,
      variationId: variation.id,
      status: "skipped",
      errorMessage: `Canal ${variation.channel} ainda não possui publicador configurado.`,
    });
  }

  const hasFailed = results.some((result) => result.status === "failed");
  await patchContentPack(pack.id, {
    status: hasFailed ? "failed" : "published",
    metadata: {
      ...(pack.metadata || {}),
      last_published_by: options.actor || "content-automation",
      last_published_at: new Date().toISOString(),
      last_publication_results: results,
    },
  });

  return {
    contentPackId: pack.id,
    results,
  };
}
