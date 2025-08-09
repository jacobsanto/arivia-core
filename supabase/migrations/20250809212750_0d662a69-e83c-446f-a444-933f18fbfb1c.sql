-- Make previously public buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('Property Images', 'Maintenance Photos');

-- Drop legacy public-read policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read: User Avatars bucket'
  ) THEN
    DROP POLICY "Public read: User Avatars bucket" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read: Property Images bucket'
  ) THEN
    DROP POLICY "Public read: Property Images bucket" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read: Maintenance Photos bucket'
  ) THEN
    DROP POLICY "Public read: Maintenance Photos bucket" ON storage.objects;
  END IF;
END $$;

-- Authenticated policies for Property Images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='property_images_select_auth'
  ) THEN
    CREATE POLICY "property_images_select_auth" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'Property Images');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='property_images_insert_auth'
  ) THEN
    CREATE POLICY "property_images_insert_auth" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'Property Images');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='property_images_update_auth'
  ) THEN
    CREATE POLICY "property_images_update_auth" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'Property Images')
    WITH CHECK (bucket_id = 'Property Images');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='property_images_delete_auth'
  ) THEN
    CREATE POLICY "property_images_delete_auth" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'Property Images');
  END IF;
END $$;

-- Authenticated policies for Maintenance Photos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='maintenance_photos_select_auth'
  ) THEN
    CREATE POLICY "maintenance_photos_select_auth" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'Maintenance Photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='maintenance_photos_insert_auth'
  ) THEN
    CREATE POLICY "maintenance_photos_insert_auth" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'Maintenance Photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='maintenance_photos_update_auth'
  ) THEN
    CREATE POLICY "maintenance_photos_update_auth" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'Maintenance Photos')
    WITH CHECK (bucket_id = 'Maintenance Photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='maintenance_photos_delete_auth'
  ) THEN
    CREATE POLICY "maintenance_photos_delete_auth" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'Maintenance Photos');
  END IF;
END $$;