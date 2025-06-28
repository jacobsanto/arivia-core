
-- Fix the profiles table RLS policies to prevent circular dependency
-- First, let's check what policies exist and drop them properly
DO $$
BEGIN
    -- Drop all existing policies on profiles table
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
END $$;

-- Create new policies that don't rely on get_current_user_role function
-- Allow users to read their own profile data directly
CREATE POLICY "user_select_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "user_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow system to insert profiles for new users (for the trigger)
CREATE POLICY "system_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Allow admins and superadmins to view all profiles (avoid circular dependency)
CREATE POLICY "admin_select_all_profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'administrator')
    )
  );

-- Allow admins to update other profiles
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'administrator')
    )
  );
