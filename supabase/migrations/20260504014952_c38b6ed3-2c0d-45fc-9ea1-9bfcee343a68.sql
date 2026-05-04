
-- Trigger-only functions: nobody should call them directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role()    FROM PUBLIC, anon, authenticated;

-- Storage: drop broad bucket-wide SELECT, keep direct-URL access via name match.
-- Direct CDN URLs (storage/v1/object/public/...) still resolve because the
-- public-bucket flag bypasses RLS for that endpoint, but the JS .list() call
-- can no longer enumerate every file.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company images" ON storage.objects;

CREATE POLICY "Read product images by name"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND name IS NOT NULL
    AND length(name) > 0
    AND name NOT LIKE '%/'
  );

CREATE POLICY "Read company images by name"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'company-images'
    AND name IS NOT NULL
    AND length(name) > 0
    AND name NOT LIKE '%/'
  );
