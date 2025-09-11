-- Fix chat_messages table foreign key relationship
-- Add foreign key constraint linking author_id to profiles.user_id
ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_author_id 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Ensure the handle_new_user trigger is working properly
-- First check if it exists, then recreate it to ensure it's correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger function to ensure profiles are created for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create any missing profiles for existing users
INSERT INTO public.profiles (user_id, name, email, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  'housekeeping_staff'::app_role
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;