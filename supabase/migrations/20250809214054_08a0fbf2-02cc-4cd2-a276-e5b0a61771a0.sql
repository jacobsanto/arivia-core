-- Ensure required storage buckets exist and are private
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-attachments') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'User Avatars') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('User Avatars', 'User Avatars', false);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'Property Images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('Property Images', 'Property Images', false);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'Maintenance Photos') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('Maintenance Photos', 'Maintenance Photos', false);
  END IF;
END $$;

-- Force buckets to be private
UPDATE storage.buckets SET public = false WHERE id IN ('chat-attachments','User Avatars','Property Images','Maintenance Photos');

-- Helper: create authenticated CRUD policies for a bucket if they don't exist
DO $$
DECLARE b TEXT;
BEGIN
  FOREACH b IN ARRAY ARRAY['chat-attachments','User Avatars','Property Images','Maintenance Photos'] LOOP
    -- SELECT
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname = b || '_select_auth'
    ) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT TO authenticated USING (bucket_id = %L);', b || '_select_auth', b);
    END IF;
    -- INSERT
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname = b || '_insert_auth'
    ) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L);', b || '_insert_auth', b);
    END IF;
    -- UPDATE
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname = b || '_update_auth'
    ) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L) WITH CHECK (bucket_id = %L);', b || '_update_auth', b, b);
    END IF;
    -- DELETE
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname = b || '_delete_auth'
    ) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L);', b || '_delete_auth', b);
    END IF;
  END LOOP;
END $$;