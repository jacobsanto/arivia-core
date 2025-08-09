-- Security hardening migration: tighten permissive policies and set search_path on functions

-- 1) Fix overly permissive INSERT on api_logs (restrict to service_role)
DROP POLICY IF EXISTS "System can create API logs" ON public.api_logs;
CREATE POLICY "System can create API logs"
ON public.api_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 2) Tighten permissions table policies
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Users can view permissions in their tenant" ON public.permissions;

CREATE POLICY "Admins can manage permissions"
ON public.permissions
FOR ALL
USING (public.get_current_user_role() IN ('superadmin','administrator'))
WITH CHECK (public.get_current_user_role() IN ('superadmin','administrator'));

CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
USING (public.is_authenticated());

-- 3) Tenant branding: require authentication for SELECT
DROP POLICY IF EXISTS "Users can view their tenant branding" ON public.tenant_branding;
CREATE POLICY "Users can view their tenant branding"
ON public.tenant_branding
FOR SELECT
USING (public.is_authenticated());

-- 4) Ensure function search_path is explicit where missing
-- update_updated_at_column lacked an explicit search_path; add it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
