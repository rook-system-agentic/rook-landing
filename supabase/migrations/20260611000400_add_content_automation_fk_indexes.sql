-- ROO-145 performance: add covering indexes for nullable foreign keys used by publication automation.

CREATE INDEX IF NOT EXISTS content_variations_blog_post_idx
  ON public.content_variations (blog_post_id);

CREATE INDEX IF NOT EXISTS publication_jobs_variation_idx
  ON public.publication_jobs (variation_id);
