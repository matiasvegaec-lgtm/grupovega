
CREATE TABLE public.page_heroes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page heroes"
  ON public.page_heroes FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert page heroes"
  ON public.page_heroes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update page heroes"
  ON public.page_heroes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page heroes"
  ON public.page_heroes FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_page_heroes_updated_at
  BEFORE UPDATE ON public.page_heroes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
