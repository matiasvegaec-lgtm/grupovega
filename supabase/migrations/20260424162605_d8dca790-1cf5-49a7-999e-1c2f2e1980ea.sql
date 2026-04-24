
-- Tabla para imágenes del carrusel "Quiénes Somos"
CREATE TABLE public.company_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_images ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Anyone can view company images"
  ON public.company_images FOR SELECT
  USING (true);

-- Solo admins escriben
CREATE POLICY "Admins can insert company images"
  ON public.company_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update company images"
  ON public.company_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete company images"
  ON public.company_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Bucket público para imágenes de la empresa
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-images', 'company-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas storage
CREATE POLICY "Public can view company images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-images');

CREATE POLICY "Admins can upload company images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update company images storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete company images storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'company-images' AND public.has_role(auth.uid(), 'admin'));
