-- Función helper: ¿es staff (admin o empleado)?
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::app_role, 'employee'::app_role)
  )
$$;

-- Tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  phone text,
  address text,
  city text,
  province text,
  postal_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

INSERT INTO public.profiles (user_id, full_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
FROM auth.users ON CONFLICT (user_id) DO NOTHING;

-- cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER cart_items_set_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas: incluir empleados
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Staff can view all orders" ON public.orders
  FOR SELECT USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Staff can update orders" ON public.orders
  FOR UPDATE USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Staff can update products" ON public.products
  FOR UPDATE USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Staff can update categories" ON public.categories
  FOR UPDATE USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Admins can update subcategories" ON public.subcategories;
CREATE POLICY "Staff can update subcategories" ON public.subcategories
  FOR UPDATE USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert company images" ON public.company_images;
CREATE POLICY "Staff can insert company images" ON public.company_images
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Admins can update company images" ON public.company_images;
CREATE POLICY "Staff can update company images" ON public.company_images
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Admins can delete company images" ON public.company_images;
CREATE POLICY "Staff can delete company images" ON public.company_images
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert page heroes" ON public.page_heroes;
CREATE POLICY "Staff can insert page heroes" ON public.page_heroes
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Admins can update page heroes" ON public.page_heroes;
CREATE POLICY "Staff can update page heroes" ON public.page_heroes
  FOR UPDATE USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can update supplier logos" ON public.supplier_logos;
CREATE POLICY "Staff can update supplier logos" ON public.supplier_logos
  FOR UPDATE USING (public.is_staff(auth.uid()));

-- admin_list_customers: permitir empleados
CREATE OR REPLACE FUNCTION public.admin_list_customers()
RETURNS TABLE(user_id uuid, email text, full_name text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, is_subscribed boolean, orders_count bigint, total_spent numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado: solo personal autorizado';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')::text,
    u.created_at, u.last_sign_in_at,
    EXISTS (SELECT 1 FROM public.newsletter_subscribers ns WHERE ns.active = true AND lower(ns.email) = lower(u.email::text)),
    COALESCE((SELECT COUNT(*) FROM public.orders o WHERE o.user_id = u.id OR lower(o.customer_email) = lower(u.email::text)), 0),
    COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE (o.user_id = u.id OR lower(o.customer_email) = lower(u.email::text)) AND o.status <> 'cancelled'), 0)
  FROM auth.users u ORDER BY u.created_at DESC;
END;
$$;