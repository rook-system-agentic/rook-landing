export type ContentPillar =
  | "vendas"
  | "impostos"
  | "compras"
  | "despesas"
  | "endividamento"
  | "resultado"
  | "produto"
  | "marca"
  | "outro";

export type ContentPackStatus =
  | "idea"
  | "briefed"
  | "drafted"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed"
  | "archived";

export type ContentChannel = "blog" | "linkedin" | "instagram_carousel" | "instagram_caption" | "story" | "newsletter";

export type ContentVariationStatus =
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed"
  | "manual_required"
  | "archived";

export type PublicationJobStatus = "queued" | "publishing" | "published" | "failed" | "skipped" | "manual_required";

export type ContentPack = {
  id: string;
  pillar: ContentPillar;
  topic: string;
  angle?: string | null;
  audience: string;
  status: ContentPackStatus;
  scheduled_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_by?: string | null;
  source_issue?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContentVariation = {
  id: string;
  content_pack_id: string;
  channel: ContentChannel;
  title: string;
  body: string;
  status: ContentVariationStatus;
  asset_brief?: string | null;
  asset_url?: string | null;
  slug?: string | null;
  subtitle?: string | null;
  excerpt?: string | null;
  direct_answer?: string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  category?: string | null;
  tags?: string[] | null;
  primary_keyword?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  schema_faq?: unknown[] | null;
  data_sources?: unknown[] | null;
  methodology_note?: string | null;
  reading_time_min?: number | null;
  metadata?: Record<string, unknown> | null;
  blog_post_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PublicationJob = {
  id: string;
  content_pack_id: string;
  variation_id?: string | null;
  channel: ContentChannel;
  status: PublicationJobStatus;
  scheduled_at?: string | null;
  published_at?: string | null;
  external_id?: string | null;
  external_url?: string | null;
  error_message?: string | null;
  retry_count: number;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PublicationResult = {
  channel: ContentChannel;
  variationId: string;
  status: PublicationJobStatus;
  blogPostId?: string;
  externalUrl?: string;
  errorMessage?: string;
};
