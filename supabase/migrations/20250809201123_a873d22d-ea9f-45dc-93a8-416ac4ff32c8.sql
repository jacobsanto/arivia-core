-- Phase 1 Security Hardening (batch 2): tighten chat_channels SELECT policies
-- Replace SELECT policies to explicitly require authentication

DROP POLICY IF EXISTS "Allow users to view channels they have access to" ON public.chat_channels;
DROP POLICY IF EXISTS "Users can view chat channels" ON public.chat_channels;

CREATE POLICY "Users can view chat channels"
ON public.chat_channels
FOR SELECT
USING (
  is_authenticated() AND (
    -- Keep existing logic from prior policy: any authenticated user with a role
    get_user_role_safe() IS NOT NULL
  )
);

CREATE POLICY "Allow users to view channels they have access to"
ON public.chat_channels
FOR SELECT
USING (
  is_authenticated() AND (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'admin' -- legacy role string kept if present
          OR chat_channels.property_id = ANY (p.secondary_roles)
        )
    )
  )
);