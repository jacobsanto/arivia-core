-- Fix the chat_channels infinite recursion issue in RLS policy
DROP POLICY IF EXISTS "View public channels" ON public.chat_channels;

-- Create a security definer function to check channel membership
CREATE OR REPLACE FUNCTION public.is_channel_member_safe(_user_id uuid, _channel_id uuid)
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

-- Recreate the policy using the security definer function
CREATE POLICY "View public channels" ON public.chat_channels
FOR SELECT
TO authenticated
USING (
  type = 'public' 
  OR 
  public.is_channel_member_safe(auth.uid(), id)
);