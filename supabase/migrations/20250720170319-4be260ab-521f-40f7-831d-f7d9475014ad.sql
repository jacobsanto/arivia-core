
-- Fix infinite recursion in profiles RLS policies
-- Drop the existing problematic policies and create safe ones

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Create new safe policies using the SECURITY DEFINER function
CREATE POLICY "profiles_select_admin_safe" ON public.profiles
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "profiles_update_admin_safe" ON public.profiles
  FOR UPDATE USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );
