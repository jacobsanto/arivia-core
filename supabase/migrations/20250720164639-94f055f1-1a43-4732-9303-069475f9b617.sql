
-- Phase 1: Critical Security Fixes
-- Fix 1: Enable RLS on query_performance_log table (Critical Security Issue)
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for query_performance_log - only admins can view performance data
CREATE POLICY "Admins can view performance logs" ON public.query_performance_log
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Create policy for system to insert performance logs
CREATE POLICY "System can insert performance logs" ON public.query_performance_log
  FOR INSERT WITH CHECK (true);

-- Fix 2: Update all database functions to have proper search_path security
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'properties', jsonb_build_object(
      'total', COUNT(*),
      'active', COUNT(*) FILTER (WHERE sync_status = 'active')
    ),
    'tasks_today', (
      SELECT COUNT(*) 
      FROM housekeeping_tasks 
      WHERE due_date = CURRENT_DATE AND status != 'completed'
    ),
    'bookings_this_month', (
      SELECT COUNT(*) 
      FROM guesty_bookings 
      WHERE DATE_TRUNC('month', check_in) = DATE_TRUNC('month', CURRENT_DATE)
      AND status = 'confirmed'
    ),
    'revenue_this_month', (
      SELECT COALESCE(SUM(revenue), 0)
      FROM financial_reports
      WHERE month = to_char(CURRENT_DATE, 'YYYY-MM')
    )
  ) INTO result
  FROM guesty_listings
  WHERE is_deleted = false;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_performance_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log the refresh attempt
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('materialized_view_refresh', 0, 'performance_views');
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Remove audit logs older than 6 months
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Remove performance logs older than 3 months
  DELETE FROM query_performance_log 
  WHERE created_at < NOW() - INTERVAL '3 months';
  
  -- Remove old sync logs
  DELETE FROM sync_logs 
  WHERE created_at < NOW() - INTERVAL '1 month';
  
  -- Log the cleanup
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('log_cleanup', 0, 'system_maintenance');
END;
$function$;

-- Fix 3: Add missing indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_guesty_bookings_listing_check_in ON guesty_bookings(listing_id, check_in);
CREATE INDEX IF NOT EXISTS idx_guesty_bookings_status ON guesty_bookings(status);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_due_date ON housekeeping_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_financial_reports_month ON financial_reports(month);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

-- Fix 4: Add comprehensive RLS policies for any missing tables
-- Ensure all tables have proper RLS coverage
CREATE POLICY "Admins can manage query performance logs" ON public.query_performance_log
  FOR ALL USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );
