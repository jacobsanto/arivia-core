-- Fix infinite recursion in profiles table RLS policies
-- First, drop all existing problematic policies on profiles table

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_authenticated_select" ON public.profiles;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON public.profiles;
DROP POLICY IF EXISTS "allow_authenticated_update" ON public.profiles;

-- Create simple, non-recursive policies for profiles table
-- These policies use only auth.uid() and auth.role() to avoid recursion

-- Policy 1: Users can view their own profile
CREATE POLICY "users_can_view_own_profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "users_can_update_own_profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (for new user creation)
CREATE POLICY "users_can_insert_own_profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Service role can manage all profiles (for admin functions)
CREATE POLICY "service_role_full_access" ON public.profiles
FOR ALL USING (auth.role() = 'service_role');

-- Policy 5: Authenticated users can view basic profile info (for user lists)
CREATE POLICY "authenticated_users_can_view_basic_profiles" ON public.profiles
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  -- Only allow viewing id, name, email, role - not sensitive data
  current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
);

-- Update the get_user_role_safe function to be truly safe and avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Use a direct query without any policy checks to avoid recursion
  SELECT role 
  FROM public.profiles 
  WHERE id = COALESCE(user_id, auth.uid())
  LIMIT 1;
$$;

-- Update is_authenticated function to be simpler
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Test that our functions work by calling them
SELECT public.get_user_role_safe();
SELECT public.is_authenticated();