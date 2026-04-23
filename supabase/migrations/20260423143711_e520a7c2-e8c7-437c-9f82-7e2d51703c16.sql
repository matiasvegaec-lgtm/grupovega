CREATE OR REPLACE FUNCTION public.admin_list_customers()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_subscribed boolean,
  orders_count bigint,
  total_spent numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')::text AS full_name,
    u.created_at,
    u.last_sign_in_at,
    EXISTS (
      SELECT 1 FROM public.newsletter_subscribers ns
      WHERE ns.active = true AND lower(ns.email) = lower(u.email::text)
    ) AS is_subscribed,
    COALESCE((SELECT COUNT(*) FROM public.orders o WHERE o.user_id = u.id OR lower(o.customer_email) = lower(u.email::text)), 0) AS orders_count,
    COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE (o.user_id = u.id OR lower(o.customer_email) = lower(u.email::text)) AND o.status <> 'cancelled'), 0) AS total_spent
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_subscribe_customer(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;

  INSERT INTO public.newsletter_subscribers (email, active)
  VALUES (lower(_email), true)
  ON CONFLICT (email) DO UPDATE SET active = true, updated_at = now();

  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  UPDATE public.newsletter_subscribers SET active = true, updated_at = now() WHERE lower(email) = lower(_email);
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unsubscribe_customer(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;

  UPDATE public.newsletter_subscribers SET active = false, updated_at = now() WHERE lower(email) = lower(_email);
  RETURN TRUE;
END;
$$;