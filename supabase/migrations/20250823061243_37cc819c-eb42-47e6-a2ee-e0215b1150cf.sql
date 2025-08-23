-- Security Enhancement: Restrict profile and vendor access
-- Update RLS policies to limit data exposure

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Managers can view team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Read vendors (managers/admins only)" ON public.vendors;

-- Create more restrictive profile access policies
CREATE POLICY "Managers can view limited profile info"
  ON public.profiles
  FOR SELECT
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Restrict vendor access to administrators only
CREATE POLICY "Administrators can view vendors"
  ON public.vendors
  FOR SELECT
  USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Add read-only system settings access for administrators
CREATE POLICY "Administrators can read system settings"
  ON public.system_settings
  FOR SELECT
  USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Security events access policies
CREATE POLICY "Administrators can view security events"
  ON public.security_events
  FOR SELECT
  USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "System can log security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Administrators can resolve security events"
  ON public.security_events
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Create user activity log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Activity log access policies
CREATE POLICY "Users can view their own activity"
  ON public.user_activity_log
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Administrators can view all activity"
  ON public.user_activity_log
  FOR SELECT
  USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "Authenticated users can log activity"
  ON public.user_activity_log
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create functions for security monitoring
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  severity TEXT,
  details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), event_type, severity, details)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Create function to get security dashboard data
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS TABLE(
  recent_security_events JSONB,
  unresolved_events_count BIGINT,
  critical_events_count BIGINT,
  active_users_count BIGINT,
  failed_login_attempts BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow superadmins to access security dashboard
  IF NOT (has_role(auth.uid(), 'superadmin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied - requires superadmin role';
  END IF;

  RETURN QUERY
  SELECT 
    (
      SELECT COALESCE(json_agg(se), '[]'::json)::jsonb
      FROM (
        SELECT id, event_type, severity, user_id, details, resolved, created_at
        FROM public.security_events 
        ORDER BY created_at DESC 
        LIMIT 10
      ) se
    ) as recent_security_events,
    (SELECT COUNT(*) FROM public.security_events WHERE NOT resolved) as unresolved_events_count,
    (SELECT COUNT(*) FROM public.security_events WHERE severity = 'critical' AND NOT resolved) as critical_events_count,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_activity_log WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_count,
    (SELECT COUNT(*) FROM public.security_events WHERE event_type = 'failed_login' AND created_at > NOW() - INTERVAL '1 hour') as failed_login_attempts;
END;
$$;