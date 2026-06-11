-- ROO-145: Content Studio foundation and publication automation.
-- Creates the editorial workflow tables used before publishing to blog/social channels.

CREATE TABLE IF NOT EXISTS public.content_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL,
  topic TEXT NOT NULL,
  angle TEXT,
  audience TEXT NOT NULL DEFAULT 'donos de restaurantes',
  status TEXT NOT NULL DEFAULT 'idea',
  scheduled_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  created_by TEXT,
  source_issue TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT content_packs_pillar_check
    CHECK (pillar IN ('vendas', 'impostos', 'compras', 'despesas', 'endividamento', 'resultado', 'produto', 'marca', 'outro')),
  CONSTRAINT content_packs_status_check
    CHECK (status IN ('idea', 'briefed', 'drafted', 'review', 'approved', 'scheduled', 'published', 'failed', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.content_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_pack_id UUID NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  asset_brief TEXT,
  asset_url TEXT,
  slug TEXT,
  subtitle TEXT,
  excerpt TEXT,
  direct_answer TEXT,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_name TEXT DEFAULT 'Rook Editorial',
  author_role TEXT DEFAULT 'Inteligência financeira para food service',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  primary_keyword TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  schema_faq JSONB DEFAULT '[]'::jsonb,
  data_sources JSONB DEFAULT '[]'::jsonb,
  methodology_note TEXT,
  reading_time_min INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT content_variations_channel_check
    CHECK (channel IN ('blog', 'linkedin', 'instagram_carousel', 'instagram_caption', 'story', 'newsletter')),
  CONSTRAINT content_variations_status_check
    CHECK (status IN ('draft', 'review', 'approved', 'scheduled', 'published', 'failed', 'manual_required', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.publication_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_pack_id UUID NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES public.content_variations(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_id TEXT,
  external_url TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT publication_jobs_channel_check
    CHECK (channel IN ('blog', 'linkedin', 'instagram_carousel', 'instagram_caption', 'story', 'newsletter')),
  CONSTRAINT publication_jobs_status_check
    CHECK (status IN ('queued', 'publishing', 'published', 'failed', 'skipped', 'manual_required'))
);

CREATE INDEX IF NOT EXISTS content_packs_status_idx
  ON public.content_packs (status, scheduled_at);

CREATE INDEX IF NOT EXISTS content_packs_pillar_idx
  ON public.content_packs (pillar);

CREATE INDEX IF NOT EXISTS content_variations_pack_idx
  ON public.content_variations (content_pack_id);

CREATE INDEX IF NOT EXISTS content_variations_channel_status_idx
  ON public.content_variations (channel, status);

CREATE INDEX IF NOT EXISTS publication_jobs_pack_idx
  ON public.publication_jobs (content_pack_id);

CREATE INDEX IF NOT EXISTS publication_jobs_status_idx
  ON public.publication_jobs (status, scheduled_at);

CREATE OR REPLACE FUNCTION public.set_content_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_content_packs_updated_at ON public.content_packs;
CREATE TRIGGER set_content_packs_updated_at
BEFORE UPDATE ON public.content_packs
FOR EACH ROW
EXECUTE FUNCTION public.set_content_automation_updated_at();

DROP TRIGGER IF EXISTS set_content_variations_updated_at ON public.content_variations;
CREATE TRIGGER set_content_variations_updated_at
BEFORE UPDATE ON public.content_variations
FOR EACH ROW
EXECUTE FUNCTION public.set_content_automation_updated_at();

DROP TRIGGER IF EXISTS set_publication_jobs_updated_at ON public.publication_jobs;
CREATE TRIGGER set_publication_jobs_updated_at
BEFORE UPDATE ON public.publication_jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_content_automation_updated_at();

ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages content packs" ON public.content_packs;
CREATE POLICY "Service role manages content packs"
  ON public.content_packs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages content variations" ON public.content_variations;
CREATE POLICY "Service role manages content variations"
  ON public.content_variations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages publication jobs" ON public.publication_jobs;
CREATE POLICY "Service role manages publication jobs"
  ON public.publication_jobs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
