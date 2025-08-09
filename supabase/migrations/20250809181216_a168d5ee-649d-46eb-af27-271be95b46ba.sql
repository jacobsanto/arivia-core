BEGIN;
-- Clean up redundant/overly broad public storage policies
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1el3xx4_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1el3xx4_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1el3xx4_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1el3xx4_3" ON storage.objects;

-- Recreate minimal, explicit public-read policies for intended public buckets
CREATE POLICY "Public read: User Avatars bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'User Avatars');

DROP POLICY IF EXISTS "Public read access for maintenance photos" ON storage.objects;
CREATE POLICY "Public read: Maintenance Photos bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Maintenance Photos');

DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
CREATE POLICY "Public read: Property Images bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Property Images');

COMMIT;