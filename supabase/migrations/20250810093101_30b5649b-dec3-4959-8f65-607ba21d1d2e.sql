-- Critical Security Fix Phase 1: Remove Anonymous Access and Strengthen RLS

-- 1. Fix most critical anonymous access policies
-- Update audit_logs policy to restrict access to authenticated superadmins only
DROP POLICY IF EXISTS "audit_logs_superadmin_only" ON public.audit_logs;
CREATE POLICY "audit_logs_superadmin_only" ON public.audit_logs
FOR ALL USING (
  auth.role() = 'authenticated'::text 
  AND get_user_role_safe() = 'superadmin'::text
);

-- 2. Fix security_events policy to restrict access properly
DROP POLICY IF EXISTS "security_events_superadmin_only" ON public.security_events;
CREATE POLICY "security_events_superadmin_only" ON public.security_events
FOR ALL USING (
  auth.role() = 'authenticated'::text 
  AND get_user_role_safe() = 'superadmin'::text
);

-- 3. Fix system_settings policy to require authentication
DROP POLICY IF EXISTS "system_settings_admin_restricted" ON public.system_settings;
CREATE POLICY "system_settings_admin_restricted" ON public.system_settings
FOR ALL USING (
  auth.role() = 'authenticated'::text
  AND get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text])
)
WITH CHECK (
  auth.role() = 'authenticated'::text
  AND get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text])
);

-- 4. Fix api_logs policy to require authentication
DROP POLICY IF EXISTS "Admins can view API logs" ON public.api_logs;
CREATE POLICY "Admins can view API logs" ON public.api_logs
FOR SELECT USING (
  auth.role() = 'authenticated'::text
  AND get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text])
);

-- 5. Fix integration_tokens to be service role only (already correct but ensuring)
DROP POLICY IF EXISTS "integration_tokens_service_only" ON public.integration_tokens;
CREATE POLICY "integration_tokens_service_only" ON public.integration_tokens
FOR ALL USING (auth.role() = 'service_role'::text);

-- 6. Fix profiles table to require authentication for access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (
  auth.role() = 'authenticated'::text 
  AND auth.uid() = id
)
WITH CHECK (
  auth.role() = 'authenticated'::text 
  AND auth.uid() = id
);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'::text 
  AND auth.uid() = id
);

-- 7. Fix chat-related policies to require authentication
DROP POLICY IF EXISTS "Users can view chat channels" ON public.chat_channels;
CREATE POLICY "Authenticated users can view chat channels" ON public.chat_channels
FOR SELECT USING (
  auth.role() = 'authenticated'::text
  AND get_user_role_safe() IS NOT NULL
);

-- 8. Fix housekeeping tasks policies
DROP POLICY IF EXISTS "housekeeping_tasks_staff_read" ON public.housekeeping_tasks;
CREATE POLICY "housekeeping_tasks_staff_read" ON public.housekeeping_tasks
FOR SELECT USING (
  auth.role() = 'authenticated'::text
  AND (
    get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text, 'housekeeping_staff'::text])
    OR assigned_to = (auth.uid())::text
  )
);

-- 9. Fix permissions table to require authentication
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.permissions;
CREATE POLICY "Authenticated users can view permissions" ON public.permissions
FOR SELECT USING (auth.role() = 'authenticated'::text);

-- 10. Add function to validate user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.role() = 'authenticated'::text AND auth.uid() IS NOT NULL;
$$;