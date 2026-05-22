
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  session_id TEXT NOT NULL,
  device TEXT,
  browser TEXT,
  country TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views (path);
CREATE INDEX idx_page_views_session ON public.page_views (session_id, created_at);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (
  path IS NOT NULL AND length(path) <= 500
  AND session_id IS NOT NULL AND length(session_id) <= 100
);

CREATE POLICY "Staff can view page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (is_staff(auth.uid()));
