DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO public
USING (active = true);
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
TO public
USING (active = true);
CREATE POLICY "Admins can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Public can view active subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins can view all subcategories" ON public.subcategories;
CREATE POLICY "Public can view active subcategories"
ON public.subcategories
FOR SELECT
TO public
USING (active = true);
CREATE POLICY "Admins can view all subcategories"
ON public.subcategories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active supplier logos" ON public.supplier_logos;
DROP POLICY IF EXISTS "Public can view active supplier logos" ON public.supplier_logos;
DROP POLICY IF EXISTS "Admins can view all supplier logos" ON public.supplier_logos;
CREATE POLICY "Public can view active supplier logos"
ON public.supplier_logos
FOR SELECT
TO public
USING (active = true);
CREATE POLICY "Admins can view all supplier logos"
ON public.supplier_logos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active page heroes" ON public.page_heroes;
DROP POLICY IF EXISTS "Public can view active page heroes" ON public.page_heroes;
DROP POLICY IF EXISTS "Admins can view all page heroes" ON public.page_heroes;
CREATE POLICY "Public can view active page heroes"
ON public.page_heroes
FOR SELECT
TO public
USING (active = true);
CREATE POLICY "Admins can view all page heroes"
ON public.page_heroes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));