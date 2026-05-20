-- Storage bucket for blog thumbnails (run after schema.sql)

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Authenticated upload blog images" ON storage.objects;
CREATE POLICY "Authenticated upload blog images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated update blog images" ON storage.objects;
CREATE POLICY "Authenticated update blog images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated delete blog images" ON storage.objects;
CREATE POLICY "Authenticated delete blog images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);
