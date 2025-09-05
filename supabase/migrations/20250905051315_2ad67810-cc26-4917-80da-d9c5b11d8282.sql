-- Fix the remaining function search path warning
-- Find and fix the function that's missing search_path
CREATE OR REPLACE FUNCTION public.is_channel_member(_user_id uuid, _channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE user_id = _user_id AND channel_id = _channel_id
  );
$$;

-- Clean up any remaining "dev-admin-user" references in the database
-- This will safely handle the UUID conversion errors
UPDATE public.profiles 
SET user_id = gen_random_uuid() 
WHERE user_id::text = 'dev-admin-user' AND EXISTS (
  SELECT 1 FROM auth.users WHERE id = profiles.user_id
) = false;

-- Remove any orphaned records with invalid UUIDs
DELETE FROM public.audit_logs 
WHERE user_id IS NOT NULL 
AND user_id::text = 'dev-admin-user';

DELETE FROM public.user_activity_log 
WHERE user_id IS NOT NULL 
AND user_id::text = 'dev-admin-user';

-- Clean up any other tables that might have dev-admin-user references
DELETE FROM public.security_events 
WHERE user_id IS NOT NULL 
AND user_id::text = 'dev-admin-user';