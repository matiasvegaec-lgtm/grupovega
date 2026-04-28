-- Tabla para logos de marcas/proveedores editables desde admin
CREATE TABLE IF NOT EXISTS public.supplier_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active supplier logos"
  ON public.supplier_logos FOR SELECT
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert supplier logos"
  ON public.supplier_logos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update supplier logos"
  ON public.supplier_logos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete supplier logos"
  ON public.supplier_logos FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_supplier_logos_updated_at
BEFORE UPDATE ON public.supplier_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();