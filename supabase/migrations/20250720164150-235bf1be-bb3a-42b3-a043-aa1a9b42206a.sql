
-- Fix infinite recursion in profiles RLS policies
-- Create a safe role-checking function that bypasses RLS

-- Drop the existing problematic function
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create a new safe role-checking function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

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

-- Recreate the get_current_user_role function to use the safe approach
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT get_user_role_safe();
$$;
