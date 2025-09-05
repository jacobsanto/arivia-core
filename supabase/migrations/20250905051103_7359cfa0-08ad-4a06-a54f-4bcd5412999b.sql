-- Fix remaining security issues

-- Tighten Profiles table access (High) - Restrict property manager access to only basic info
DROP POLICY IF EXISTS "Managers can view basic profile info" ON public.profiles;

CREATE POLICY "Managers can view basic profile info" ON public.profiles
FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR (has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
  OR (
    has_role(auth.uid(), 'property_manager'::app_role) 
    AND id IN (
      SELECT p.id FROM public.profiles p 
      WHERE p.role IN ('housekeeping_staff'::app_role, 'maintenance_staff'::app_role)
    )
  )
);

-- Create damage_reports table if it doesn't exist with proper RLS
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  room_number text,
  reported_by uuid REFERENCES auth.users(id),
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'assessed', 'in_repair', 'completed')),
  photos text[] DEFAULT '{}',
  repair_notes text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on damage_reports
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Property Damage Information Fully Exposed" ON public.damage_reports;

-- Create proper role-based policies for damage_reports
CREATE POLICY "Staff can create damage reports" ON public.damage_reports
FOR INSERT 
WITH CHECK (
  auth.uid() = reported_by 
  AND (
    has_role(auth.uid(), 'housekeeping_staff'::app_role)
    OR has_role(auth.uid(), 'maintenance_staff'::app_role)
    OR has_role(auth.uid(), 'property_manager'::app_role)
    OR has_role(auth.uid(), 'administrator'::app_role)
    OR has_role(auth.uid(), 'superadmin'::app_role)
  )
);

CREATE POLICY "View damage reports (role-based)" ON public.damage_reports
FOR SELECT 
USING (
  reported_by = auth.uid()
  OR has_role(auth.uid(), 'property_manager'::app_role)
  OR has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Update damage reports (managers/admins)" ON public.damage_reports
FOR UPDATE 
USING (
  has_role(auth.uid(), 'property_manager'::app_role)
  OR has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Delete damage reports (admins only)" ON public.damage_reports
FOR DELETE 
USING (
  has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- Restrict security_events INSERT policy
DROP POLICY IF EXISTS "System can log security events" ON public.security_events;

CREATE POLICY "System can log security events" ON public.security_events
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- Restrict vendor access to administrators only
DROP POLICY IF EXISTS "Property staff can view vendors" ON public.vendors;

CREATE POLICY "Administrators can view vendors" ON public.vendors
FOR SELECT 
USING (
  has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);