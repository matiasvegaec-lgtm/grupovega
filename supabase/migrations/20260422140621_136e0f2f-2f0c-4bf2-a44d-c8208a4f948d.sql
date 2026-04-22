-- Add slug column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Function to generate a URL-friendly slug from a name
CREATE OR REPLACE FUNCTION public.slugify(_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(
      translate(
        _text,
        'áàäâãåéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÅÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
        'aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC'
      )
    ),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

-- Backfill existing products with unique slugs
WITH numbered AS (
  SELECT
    id,
    public.slugify(name) AS base_slug,
    ROW_NUMBER() OVER (PARTITION BY public.slugify(name) ORDER BY created_at) AS rn
  FROM public.products
  WHERE slug IS NULL OR slug = ''
)
UPDATE public.products p
SET slug = CASE WHEN n.rn = 1 THEN n.base_slug ELSE n.base_slug || '-' || n.rn END
FROM numbered n
WHERE p.id = n.id;

-- Trigger to auto-generate slug on insert/update if missing
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base text;
  candidate text;
  i int := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := public.slugify(NEW.name);
    candidate := base;
    WHILE EXISTS (
      SELECT 1 FROM public.products
      WHERE slug = candidate AND id <> NEW.id
    ) LOOP
      i := i + 1;
      candidate := base || '-' || i;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_product_slug ON public.products;
CREATE TRIGGER trg_set_product_slug
BEFORE INSERT OR UPDATE OF name, slug ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_slug();

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products (slug);