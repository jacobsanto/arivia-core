-- Fix remaining security issues (corrected - drop existing policies first)

-- Tighten Profiles table access (High) - Restrict property manager access to employee personal info
DROP POLICY IF EXISTS "Managers can view basic profile info" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
);

-- Create damage_reports table if it doesn't exist and secure it (High)
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  room_number text,
  reported_by uuid REFERENCES auth.users(id),
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'reported',
  title text NOT NULL,
  description text,
  repair_cost numeric DEFAULT 0,
  photos text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on damage_reports
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on damage_reports first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'damage_reports' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- Create secure policies for damage_reports
CREATE POLICY "View damage reports (staff/managers/admins)" ON public.damage_reports
FOR SELECT 
USING (
  (reported_by = auth.uid()) OR 
  has_role(auth.uid(), 'maintenance_staff'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Create damage reports (authenticated)" ON public.damage_reports
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) AND 
  (reported_by = auth.uid())
);

CREATE POLICY "Update damage reports (reporter/managers/admins)" ON public.damage_reports
FOR UPDATE 
USING (
  (reported_by = auth.uid()) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Delete damage reports (admins only)" ON public.damage_reports
FOR DELETE 
USING (
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Secure security_events table - Remove overly permissive insert policy
DROP POLICY IF EXISTS "System can log security events" ON public.security_events;

CREATE POLICY "Service role can log security events" ON public.security_events
FOR INSERT 
WITH CHECK (
  -- Only allow service role or authenticated users logging their own events
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.role() = 'service_role')
);

-- Secure vendors table - Restrict to admins only
DROP POLICY IF EXISTS "Property staff can view vendors" ON public.vendors;

CREATE POLICY "Admins can view vendors" ON public.vendors
FOR SELECT 
USING (
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);