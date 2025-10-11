-- ============================================================================
-- SECURITY FIX MIGRATION
-- Fixes: Profiles PII exposure, Audit logs RLS, Role storage architecture
-- ============================================================================

-- 1. FIX PROFILES TABLE RLS - Restrict PII access
-- ============================================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- 2. FIX AUDIT LOGS RLS - Allow legitimate insertions
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.audit_logs;

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 3. MIGRATE ROLES TO USER_ROLES TABLE
-- ============================================================================

-- Populate user_roles table from existing profiles.role data
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role 
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update has_role function to use user_roles table instead of profiles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add strict RLS policies to user_roles table
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only superadmins can manage roles" ON public.user_roles
  FOR ALL USING (
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- 4. UPDATE PROFILE POLICIES TO PREVENT ROLE COLUMN ACCESS
-- ============================================================================

-- Update the prevent_profile_escalation trigger to block role changes entirely
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- Allow admins/superadmins to update anything
  IF (public.has_role(auth.uid(), 'administrator'::app_role) OR public.has_role(auth.uid(), 'superadmin'::app_role)) THEN
    RETURN NEW;
  END IF;

  -- Non-admins: prevent changes to sensitive fields
  IF (NEW.role IS DISTINCT FROM OLD.role) THEN
    RAISE EXCEPTION 'Changing role is not allowed. Roles must be managed via user_roles table by superadmins only.';
  END IF;
  
  IF (NEW.custom_permissions IS DISTINCT FROM OLD.custom_permissions) THEN
    RAISE EXCEPTION 'Changing custom permissions is not allowed';
  END IF;
  
  IF (NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Changing user_id is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

-- 5. ADD TRIGGER TO SYNC NEW USERS TO USER_ROLES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_new_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- When a new profile is created, add the role to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, NEW.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_role_on_profile_insert ON public.profiles;

CREATE TRIGGER sync_user_role_on_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_new_user_role();