
-- Phase 1: CRITICAL Security Fixes

-- Fix 1: Remove anonymous access and require authentication for all tables
-- Update guesty_listings policies to require authentication
DROP POLICY IF EXISTS "Allow authenticated users to read listings" ON public.guesty_listings;
CREATE POLICY "guesty_listings_authenticated_read" ON public.guesty_listings
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role to update listings" ON public.guesty_listings;
CREATE POLICY "guesty_listings_service_role_all" ON public.guesty_listings
  FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Update guesty_bookings policies
DROP POLICY IF EXISTS "Allow authenticated users to read bookings" ON public.guesty_bookings;
CREATE POLICY "guesty_bookings_authenticated_read" ON public.guesty_bookings
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

-- Update housekeeping_tasks policies to be more restrictive
DROP POLICY IF EXISTS "Allow authenticated users to create housekeeping tasks" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Allow authenticated users to read housekeeping tasks" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Allow authenticated users to update housekeeping tasks" ON public.housekeeping_tasks;

CREATE POLICY "housekeeping_tasks_staff_read" ON public.housekeeping_tasks
  FOR SELECT TO authenticated
  USING (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff'])
  );

CREATE POLICY "housekeeping_tasks_staff_update" ON public.housekeeping_tasks
  FOR UPDATE TO authenticated
  USING (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff'])
  );

CREATE POLICY "housekeeping_tasks_manager_insert" ON public.housekeeping_tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator', 'property_manager'])
  );

-- Fix 2: Add missing search_path to all security definer functions
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'database', jsonb_build_object(
      'tables_count', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
      'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
      'rls_enabled_tables', (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true)
    ),
    'authentication', jsonb_build_object(
      'total_users', (SELECT COUNT(*) FROM auth.users),
      'active_sessions', (SELECT COUNT(*) FROM auth.sessions WHERE expires_at > NOW())
    ),
    'integrations', jsonb_build_object(
      'guesty_listings', (SELECT COUNT(*) FROM guesty_listings WHERE is_deleted = false),
      'guesty_bookings', (SELECT COUNT(*) FROM guesty_bookings),
      'last_sync', (SELECT MAX(last_synced) FROM guesty_listings)
    ),
    'performance', jsonb_build_object(
      'avg_query_time', (
        SELECT COALESCE(AVG(execution_time_ms), 0) 
        FROM query_performance_log 
        WHERE created_at > NOW() - INTERVAL '1 hour'
      ),
      'slow_queries_count', (
        SELECT COUNT(*) 
        FROM query_performance_log 
        WHERE execution_time_ms > 1000 AND created_at > NOW() - INTERVAL '1 hour'
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix all other security definer functions
CREATE OR REPLACE FUNCTION public.get_housekeeping_metrics(start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), end_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_tasks', COUNT(*),
    'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
    'completion_rate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / NULLIF(COUNT(*), 0)), 2
    ),
    'overdue_tasks', COUNT(*) FILTER (
      WHERE status != 'completed' AND due_date < CURRENT_DATE
    ),
    'by_type', jsonb_object_agg(
      task_type, 
      COUNT(*)
    ),
    'by_status', jsonb_object_agg(
      status,
      COUNT(*)
    )
  ) INTO result
  FROM housekeeping_tasks
  WHERE created_at::date BETWEEN start_date AND end_date;
  
  RETURN result;
END;
$$;

-- Fix 3: Create secure user management functions
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  email TEXT,
  password TEXT,
  full_name TEXT,
  user_role TEXT DEFAULT 'property_manager'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_user_id UUID;
  result jsonb;
BEGIN
  -- Only superadmins can create users
  IF get_user_role_safe(auth.uid()) != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can create users';
  END IF;
  
  -- Validate role
  IF user_role NOT IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- This would need to be handled by a separate auth service in production
  -- For now, return a placeholder response
  result := jsonb_build_object(
    'success', true,
    'message', 'User creation initiated - would be handled by auth service',
    'email', email,
    'role', user_role
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role TEXT;
  result jsonb;
BEGIN
  -- Get current user's role
  current_user_role := get_user_role_safe(auth.uid());
  
  -- Only superadmins can change roles
  IF current_user_role != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can change user roles';
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Log the role change
  INSERT INTO audit_logs (table_name, action, record_id, new_values, user_id)
  VALUES ('profiles', 'ROLE_CHANGE', target_user_id::text, 
          jsonb_build_object('new_role', new_role), auth.uid());
  
  result := jsonb_build_object(
    'success', true,
    'message', 'User role updated successfully',
    'user_id', target_user_id,
    'new_role', new_role
  );
  
  RETURN result;
END;
$$;

-- Fix 4: Create comprehensive user activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_activity_admin_access" ON public.user_activity_log
  FOR ALL TO authenticated
  USING (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator'])
  )
  WITH CHECK (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator'])
  );

-- Fix 5: Create security monitoring tables
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'failed_login', 'suspicious_activity', 'privilege_escalation', etc.
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_events_admin_access" ON public.security_events
  FOR ALL TO authenticated
  USING (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator'])
  )
  WITH CHECK (
    get_user_role_safe(auth.uid()) = ANY (ARRAY['superadmin', 'administrator'])
  );

-- Fix 6: Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  severity TEXT DEFAULT 'medium',
  target_user_id UUID DEFAULT NULL,
  details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type, severity, user_id, details
  ) VALUES (
    event_type, severity, COALESCE(target_user_id, auth.uid()), details
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fix 7: Create system health monitoring function
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow superadmins to access security dashboard
  IF get_user_role_safe(auth.uid()) != 'superadmin' THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;
  
  SELECT jsonb_build_object(
    'recent_security_events', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'event_type', event_type,
          'severity', severity,
          'created_at', created_at,
          'resolved', resolved
        )
      )
      FROM (
        SELECT * FROM security_events 
        ORDER BY created_at DESC 
        LIMIT 10
      ) recent_events
    ),
    'unresolved_events_count', (
      SELECT COUNT(*) FROM security_events WHERE resolved = false
    ),
    'critical_events_count', (
      SELECT COUNT(*) FROM security_events 
      WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '24 hours'
    ),
    'active_users_count', (
      SELECT COUNT(DISTINCT user_id) FROM user_activity_log 
      WHERE created_at > NOW() - INTERVAL '1 hour'
    ),
    'failed_login_attempts', (
      SELECT COUNT(*) FROM security_events 
      WHERE event_type = 'failed_login' AND created_at > NOW() - INTERVAL '24 hours'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
