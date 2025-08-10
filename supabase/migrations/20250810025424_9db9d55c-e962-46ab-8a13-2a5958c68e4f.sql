-- Remove Guesty-related functions that depend on guesty tables
DROP FUNCTION IF EXISTS public.handle_new_booking() CASCADE;
DROP FUNCTION IF EXISTS public.generate_housekeeping_tasks_for_booking(public.guesty_bookings) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_generate_housekeeping_tasks() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_generate_cleaning_tasks() CASCADE;
DROP FUNCTION IF EXISTS public.generate_cleaning_tasks_from_config(public.guesty_bookings) CASCADE;

-- Drop Guesty-related tables (if they exist)
DROP TABLE IF EXISTS public.guesty_api_usage CASCADE;
DROP TABLE IF EXISTS public.guesty_bookings CASCADE;
DROP TABLE IF EXISTS public.guesty_listings CASCADE;

-- Update get_property_metrics to use properties table instead of guesty_listings
CREATE OR REPLACE FUNCTION public.get_property_metrics(
  start_date date DEFAULT (CURRENT_DATE - '30 days'::interval),
  end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  damage_count integer;
BEGIN
  -- Get damage reports count for the period
  SELECT COUNT(*) INTO damage_count
  FROM damage_reports
  WHERE created_at::date BETWEEN start_date AND end_date;

  SELECT jsonb_build_object(
    'total_properties', (SELECT COUNT(*) FROM properties),
    'active_properties', (SELECT COUNT(*) FROM properties WHERE status = 'active'),
    'sync_status', jsonb_build_object('n/a', 0),
    'damage_reports_period', damage_count,
    'last_sync', NULL
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Update get_dashboard_metrics to avoid guesty tables
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'properties', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM properties),
      'active', (SELECT COUNT(*) FROM properties WHERE status = 'active')
    ),
    'tasks_today', (
      SELECT COUNT(*) 
      FROM housekeeping_tasks 
      WHERE due_date = CURRENT_DATE AND status != 'completed'
    ),
    'bookings_this_month', 0,
    'revenue_this_month', 0
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Update get_system_health to not reference guesty tables
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
      'guesty_listings', 0,
      'guesty_bookings', 0,
      'last_sync', NULL
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
$function$;