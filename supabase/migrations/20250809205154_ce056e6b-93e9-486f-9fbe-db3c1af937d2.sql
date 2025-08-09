-- Phase 2: Move extensions out of public schema to 'extensions' schema to satisfy linter

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- For each extension currently installed in public, move it to extensions schema
DO $$
DECLARE 
  ext RECORD;
BEGIN
  FOR ext IN 
    SELECT e.extname
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext.extname);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'Skipping extension % due to insufficient privileges', ext.extname;
    WHEN others THEN
      RAISE NOTICE 'Skipping extension % due to error: %', ext.extname, SQLERRM;
    END;
  END LOOP;
END $$;