import type { ContentPack, ContentPackStatus, ContentVariation, ContentVariationStatus, PublicationJob } from "@/lib/content-types";
import { supabaseAdminRequest } from "@/lib/supabase-admin";

export type ContentStudioPack = ContentPack & {
  variations: ContentVariation[];
  latestJobs: Record<string, PublicationJob | undefined>;
};

type CreatePackInput = {
  pillar: ContentPack["pillar"];
  topic: string;
  angle?: string | null;
  audience?: string | null;
  status?: ContentPackStatus;
  source_issue?: string | null;
  notes?: string | null;
};

type UpdatePackInput = Partial<
  Pick<ContentPack, "pillar" | "topic" | "angle" | "audience" | "status" | "source_issue" | "notes" | "scheduled_at" | "metadata">
> & {
  approved_by?: string | null;
};

type CreateVariationInput = {
  content_pack_id: string;
  channel: ContentVariation["channel"];
  title: string;
  body: string;
  status?: ContentVariationStatus;
  asset_brief?: string | null;
  asset_url?: string | null;
  slug?: string | null;
  subtitle?: string | null;
  excerpt?: string | null;
  direct_answer?: string | null;
  category?: string | null;
  tags?: string[] | null;
  primary_keyword?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  methodology_note?: string | null;
};

type UpdateVariationInput = Partial<
  Pick<
    ContentVariation,
    | "channel"
    | "title"
    | "body"
    | "status"
    | "asset_brief"
    | "asset_url"
    | "slug"
    | "subtitle"
    | "excerpt"
    | "direct_answer"
    | "category"
    | "tags"
    | "primary_keyword"
    | "seo_title"
    | "seo_description"
    | "methodology_note"
    | "metadata"
  >
>;

function first<T>(rows: T[] | T | null) {
  if (!rows) return null;
  if (Array.isArray(rows)) return rows[0] || null;
  return rows;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}

function inList(values: string[]) {
  return values.map((value) => `"${value}"`).join(",");
}

function packLatestJobs(jobs: PublicationJob[]) {
  return jobs.reduce<Record<string, PublicationJob | undefined>>((acc, job) => {
    if (job.variation_id && !acc[job.variation_id]) {
      acc[job.variation_id] = job;
    }
    return acc;
  }, {});
}

export async function listContentStudioPacks(limit = 30) {
  const packs = await supabaseAdminRequest<ContentPack[]>(
    `content_packs?select=*&order=updated_at.desc&limit=${Math.min(Math.max(limit, 1), 100)}`,
  );

  if (packs.length === 0) return [];

  const ids = packs.map((pack) => pack.id);
  const [variations, jobs] = await Promise.all([
    supabaseAdminRequest<ContentVariation[]>(
      `content_variations?content_pack_id=in.(${inList(ids)})&select=*&order=created_at.asc`,
    ),
    supabaseAdminRequest<PublicationJob[]>(
      `publication_jobs?content_pack_id=in.(${inList(ids)})&select=*&order=created_at.desc`,
    ),
  ]);

  return packs.map<ContentStudioPack>((pack) => {
    const packVariations = variations.filter((variation) => variation.content_pack_id === pack.id);
    const packJobs = jobs.filter((job) => job.content_pack_id === pack.id);
    return {
      ...pack,
      variations: packVariations,
      latestJobs: packLatestJobs(packJobs),
    };
  });
}

export async function getContentStudioPack(contentPackId: string) {
  const rows = await supabaseAdminRequest<ContentPack[]>(
    `content_packs?id=eq.${encodeURIComponent(contentPackId)}&select=*`,
  );
  const pack = first(rows);
  if (!pack) return null;

  const [variations, jobs] = await Promise.all([
    supabaseAdminRequest<ContentVariation[]>(
      `content_variations?content_pack_id=eq.${encodeURIComponent(contentPackId)}&select=*&order=created_at.asc`,
    ),
    supabaseAdminRequest<PublicationJob[]>(
      `publication_jobs?content_pack_id=eq.${encodeURIComponent(contentPackId)}&select=*&order=created_at.desc`,
    ),
  ]);

  return {
    ...pack,
    variations,
    latestJobs: packLatestJobs(jobs),
  } satisfies ContentStudioPack;
}

export async function createContentStudioPack(input: CreatePackInput) {
  const payload = compactObject({
    pillar: input.pillar,
    topic: input.topic.trim(),
    angle: input.angle?.trim() || null,
    audience: input.audience?.trim() || "donos de restaurantes",
    status: input.status || "briefed",
    source_issue: input.source_issue?.trim() || "ROO-117",
    notes: input.notes?.trim() || null,
    metadata: {
      source: "content-studio",
    },
  });

  const rows = await supabaseAdminRequest<ContentPack[]>("content_packs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  return first(rows);
}

export async function updateContentStudioPack(contentPackId: string, input: UpdatePackInput) {
  const payload = compactObject({
    ...input,
    approved_at: input.status === "approved" ? new Date().toISOString() : undefined,
    approved_by: input.status === "approved" ? input.approved_by || "Content Studio" : input.approved_by,
  });

  const rows = await supabaseAdminRequest<ContentPack[]>(`content_packs?id=eq.${encodeURIComponent(contentPackId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  return first(rows);
}

export async function createContentStudioVariation(input: CreateVariationInput) {
  const payload = compactObject({
    ...input,
    title: input.title.trim(),
    body: input.body.trim(),
    status: input.status || "draft",
    tags: input.tags || [],
    metadata: {
      source: "content-studio",
    },
  });

  const rows = await supabaseAdminRequest<ContentVariation[]>("content_variations", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  return first(rows);
}

export async function updateContentStudioVariation(variationId: string, input: UpdateVariationInput) {
  const rows = await supabaseAdminRequest<ContentVariation[]>(
    `content_variations?id=eq.${encodeURIComponent(variationId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(compactObject(input)),
    },
  );

  return first(rows);
}
