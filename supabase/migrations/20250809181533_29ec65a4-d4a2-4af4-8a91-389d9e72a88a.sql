BEGIN;

-- Bulk harden: replace PUBLIC/ANON policy roles with AUTHENTICATED across public schema
CREATE OR REPLACE FUNCTION public._bulk_harden_policy_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        roles @> ARRAY['public']::name[]
        OR roles @> ARRAY['anon']::name[]
        OR array_length(roles,1) IS NULL
      )
  LOOP
    EXECUTE format('ALTER POLICY %I ON %I.%I TO authenticated', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END;
$$;

SELECT public._bulk_harden_policy_roles();

DROP FUNCTION public._bulk_harden_policy_roles();

COMMIT;