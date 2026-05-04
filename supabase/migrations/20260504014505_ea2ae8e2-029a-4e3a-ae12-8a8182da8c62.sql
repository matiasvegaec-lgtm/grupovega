
-- 1. Remove public read on orders; replace with secure lookup RPC
DROP POLICY IF EXISTS "Anyone can view orders by number" ON public.orders;

CREATE OR REPLACE FUNCTION public.get_order_by_number(_order_number text)
RETURNS public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.orders WHERE order_number = _order_number LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_by_number(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon, authenticated;

-- 2. Tighten "always true" policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    customer_email IS NOT NULL AND customer_email <> ''
    AND customer_name  IS NOT NULL AND customer_name  <> ''
    AND customer_phone IS NOT NULL AND customer_phone <> ''
    AND jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0
  );

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- 3. Revoke public EXECUTE on privileged SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_list_customers()        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_staff()            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_subscribe_customer(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_unsubscribe_customer(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.promote_user_to_admin(text)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role)      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid)                FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_list_customers()         TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_staff()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_subscribe_customer(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unsubscribe_customer(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(text)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid)                 TO authenticated;

-- 4. Stop public bucket listing (files still load by direct CDN URL)
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company images" ON storage.objects;
