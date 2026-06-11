-- ROO-145 hardening: pin search_path for trigger helper functions created by ROO-138/ROO-145.

ALTER FUNCTION public.set_blog_posts_updated_at() SET search_path = public;
ALTER FUNCTION public.set_content_automation_updated_at() SET search_path = public;
