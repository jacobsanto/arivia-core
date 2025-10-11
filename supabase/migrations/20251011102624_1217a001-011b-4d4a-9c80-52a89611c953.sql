-- Phase 1: Critical Security Fixes
-- Fix 1: Restrict audit_logs to service role only for inserts

-- Drop the user insert policy
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;

-- Keep service role policy and admin read policies
-- Users should NOT be able to insert their own audit logs


-- Fix 2: Restrict security_events to service role only for inserts

-- Drop the user/service role combined policy
DROP POLICY IF EXISTS "Service role can log security events" ON public.security_events;

-- Create new service role only insert policy
CREATE POLICY "Service role only can log security events"
ON public.security_events
FOR INSERT
WITH CHECK (auth.role() = 'service_role');


-- Fix 3: Fix notifications table - restrict creation to service role
-- First, check if notifications table exists and create proper policies

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Service role can create notifications
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());


-- Fix 4: Consolidate profiles RLS policies

-- Drop redundant/problematic policies
DROP POLICY IF EXISTS "Admins can view profile summaries only" ON public.profiles;

-- Keep the essential policies and ensure they're correct
-- The existing policies should be:
-- 1. Users can view their own profiles
-- 2. Admins can view all profiles
-- 3. Users can update own profiles
-- 4. Prevent privilege escalation


-- Fix 5: Consolidate vendors RLS policies

-- Drop duplicate policies
DROP POLICY IF EXISTS "Administrators can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can view vendors" ON public.vendors;

-- Keep only the "Admins can manage vendors" policy which covers all operations
-- This single policy is sufficient for admin access


-- Add trigger for notifications updated_at
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();