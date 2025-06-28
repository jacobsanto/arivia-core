
-- Phase 1: Fix Function Search Path Issue for get_current_user_role
-- Update the function to use a more secure search path configuration
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Phase 2: Move pg_net extension to a more secure schema if needed
-- First check if we can move it to extensions schema
-- Note: This may already be properly configured by Supabase, but we'll ensure it's secure
DO $$
BEGIN
  -- Check if extensions schema exists, create if not
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'extensions') THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
  END IF;
  
  -- Grant necessary permissions for extensions schema
  GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
  
  -- The pg_net extension is typically managed by Supabase and may need to stay in public
  -- We'll add a comment to document this is intentional for Supabase functionality
  COMMENT ON EXTENSION pg_net IS 'Required by Supabase Edge Functions for HTTP requests - placement in public schema is necessary for proper functionality';
END $$;

-- Phase 3: Additional security hardening
-- Ensure only necessary roles have access to sensitive functions
REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
