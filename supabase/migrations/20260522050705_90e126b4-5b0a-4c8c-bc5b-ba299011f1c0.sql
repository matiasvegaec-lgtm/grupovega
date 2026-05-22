
-- 1. Server-side order creation with price validation
CREATE OR REPLACE FUNCTION public.create_order(
  _items jsonb,
  _customer_name text,
  _customer_email text,
  _customer_phone text,
  _shipping_address text,
  _shipping_city text,
  _shipping_province text,
  _shipping_country text DEFAULT 'Ecuador',
  _shipping_postal_code text DEFAULT NULL,
  _shipping_notes text DEFAULT NULL,
  _status text DEFAULT 'pending'
)
RETURNS TABLE(order_number text, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _item jsonb;
  _product_id uuid;
  _qty int;
  _product record;
  _line_total numeric;
  _subtotal numeric := 0;
  _validated_items jsonb := '[]'::jsonb;
  _new_order public.orders;
BEGIN
  -- Basic validation
  IF _customer_name IS NULL OR length(trim(_customer_name)) = 0 THEN
    RAISE EXCEPTION 'customer_name requerido';
  END IF;
  IF _customer_email IS NULL OR _customer_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'customer_email inválido';
  END IF;
  IF _customer_phone IS NULL OR length(trim(_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'customer_phone requerido';
  END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'items requeridos';
  END IF;
  IF jsonb_array_length(_items) > 100 THEN
    RAISE EXCEPTION 'demasiados items';
  END IF;
  IF _status NOT IN ('pending', 'quote') THEN
    RAISE EXCEPTION 'status inválido';
  END IF;

  -- Recompute prices server-side from products table
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    BEGIN
      _product_id := (_item->>'product_id')::uuid;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'product_id inválido';
    END;
    _qty := COALESCE((_item->>'quantity')::int, 0);
    IF _qty <= 0 OR _qty > 10000 THEN
      RAISE EXCEPTION 'quantity inválido';
    END IF;

    SELECT id, name, price, image_url, presentation
    INTO _product
    FROM public.products
    WHERE id = _product_id AND active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'producto no disponible: %', _product_id;
    END IF;

    _line_total := _product.price * _qty;
    _subtotal := _subtotal + _line_total;

    _validated_items := _validated_items || jsonb_build_object(
      'id', _product.id,
      'product_id', _product.id,
      'name', _product.name,
      'price', _product.price,
      'image_url', _product.image_url,
      'presentation', _product.presentation,
      'quantity', _qty,
      'line_total', _line_total
    );
  END LOOP;

  INSERT INTO public.orders (
    customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_province, shipping_country,
    shipping_postal_code, shipping_notes,
    items, subtotal, total, status, user_id
  ) VALUES (
    trim(_customer_name), lower(trim(_customer_email)), trim(_customer_phone),
    COALESCE(_shipping_address, '—'), COALESCE(_shipping_city, '—'),
    COALESCE(_shipping_province, '—'), COALESCE(_shipping_country, 'Ecuador'),
    _shipping_postal_code, _shipping_notes,
    _validated_items, _subtotal, _subtotal, _status, auth.uid()
  )
  RETURNING * INTO _new_order;

  RETURN QUERY SELECT _new_order.order_number, _new_order.total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(jsonb, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;

-- Remove direct INSERT access; orders must go through create_order
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- 2. Allow users to view their own newsletter subscription
CREATE POLICY "Users can view own subscription"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR lower(email) = lower((SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text)
);
