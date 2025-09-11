-- Fix profile creation system and seed test users

-- First, let's check if there are any auth users and create profiles for them
DO $$
BEGIN
    -- Create profiles for any existing auth users that don't have profiles
    INSERT INTO public.profiles (user_id, name, email, role)
    SELECT 
        au.id,
        COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
        au.email,
        'housekeeping_staff'::app_role as role
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    WHERE p.user_id IS NULL
    AND au.email IS NOT NULL;
    
    -- Insert test user profiles if they don't exist
    INSERT INTO public.profiles (id, user_id, name, email, role, phone) VALUES
        (gen_random_uuid(), gen_random_uuid(), 'Admin User', 'admin@ariviavillas.com', 'administrator', '+30-210-555-0101'),
        (gen_random_uuid(), gen_random_uuid(), 'Property Manager', 'manager@ariviavillas.com', 'property_manager', '+30-210-555-0102'),
        (gen_random_uuid(), gen_random_uuid(), 'Housekeeping Staff', 'housekeeping@ariviavillas.com', 'housekeeping_staff', '+30-210-555-0104'),
        (gen_random_uuid(), gen_random_uuid(), 'Maintenance Staff', 'maintenance@ariviavillas.com', 'maintenance_staff', '+30-210-555-0105'),
        (gen_random_uuid(), gen_random_uuid(), 'Super Admin', 'superadmin@ariviavillas.com', 'superadmin', '+30-210-555-0107')
    ON CONFLICT (email) DO NOTHING;
END $$;

-- Ensure the handle_new_user function is working correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'housekeeping_staff'::app_role
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix the chat_channels infinite recursion issue in RLS policy
DROP POLICY IF EXISTS "View public channels" ON public.chat_channels;
CREATE POLICY "View public channels" ON public.chat_channels
FOR SELECT
TO authenticated
USING (
  type = 'public' 
  OR 
  EXISTS (
    SELECT 1 FROM public.channel_members cm
    WHERE cm.channel_id = chat_channels.id 
    AND cm.user_id = auth.uid()
  )
);