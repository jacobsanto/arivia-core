
-- Fix infinite recursion by updating the existing get_current_user_role function
-- This approach preserves all existing dependencies while fixing the recursion

-- Update the existing get_current_user_role function to use SECURITY DEFINER
-- This will bypass RLS policies and prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Also create the helper function for consistency
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;
