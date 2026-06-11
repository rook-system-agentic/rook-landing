-- ROO-138: Blog Editorial + CMS Minimo
-- Creates the canonical editorial table used by rook-landing.

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  direct_answer TEXT,
  content_markdown TEXT NOT NULL,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_id TEXT,
  author_name TEXT NOT NULL,
  author_role TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  primary_keyword TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  schema_faq JSONB DEFAULT '[]'::jsonb,
  data_sources JSONB DEFAULT '[]'::jsonb,
  methodology_note TEXT,
  reading_time_min INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT blog_posts_status_check
    CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  CONSTRAINT blog_posts_published_at_check
    CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON public.blog_posts (published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS blog_posts_category_idx
  ON public.blog_posts (category)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS blog_posts_tags_idx
  ON public.blog_posts USING GIN (tags);

CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_blog_posts_updated_at();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published blog posts are public" ON public.blog_posts;
CREATE POLICY "Published blog posts are public"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Service role manages blog posts" ON public.blog_posts;
CREATE POLICY "Service role manages blog posts"
  ON public.blog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

