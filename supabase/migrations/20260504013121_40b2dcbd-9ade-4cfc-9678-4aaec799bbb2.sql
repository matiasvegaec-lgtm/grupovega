CREATE OR REPLACE FUNCTION public.admin_list_staff()
RETURNS TABLE(role_id uuid, user_id uuid, email text, full_name text, role app_role, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;
  RETURN QUERY
  SELECT ur.id, ur.user_id, u.email::text,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')::text,
    ur.role, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role IN ('admin'::app_role, 'employee'::app_role)
  ORDER BY ur.role, ur.created_at;
END;
$$;