ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS presentation text,
  ADD COLUMN IF NOT EXISTS protein_content text,
  ADD COLUMN IF NOT EXISTS price_card_3m numeric;