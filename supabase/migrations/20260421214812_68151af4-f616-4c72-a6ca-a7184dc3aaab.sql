CREATE OR REPLACE FUNCTION public.promote_user_to_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: solo admins pueden promover usuarios';
  END IF;

  SELECT id INTO _user_id FROM auth.users WHERE email = lower(_email) LIMIT 1;

  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_user_to_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(TEXT) TO authenticated;