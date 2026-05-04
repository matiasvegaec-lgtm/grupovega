DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
TO public
USING (
  active = true
  OR (
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
TO public
USING (
  active = true
  OR (
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Anyone can view active subcategories" ON public.subcategories;
CREATE POLICY "Anyone can view active subcategories"
ON public.subcategories
FOR SELECT
TO public
USING (
  active = true
  OR (
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Anyone can view active supplier logos" ON public.supplier_logos;
CREATE POLICY "Anyone can view active supplier logos"
ON public.supplier_logos
FOR SELECT
TO public
USING (
  active = true
  OR (
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Anyone can view page heroes" ON public.page_heroes;
CREATE POLICY "Anyone can view active page heroes"
ON public.page_heroes
FOR SELECT
TO public
USING (
  active = true
  OR (
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Anyone can view company images" ON public.company_images;
CREATE POLICY "Anyone can view company images"
ON public.company_images
FOR SELECT
TO public
USING (true);