-- Phase 2: Production Readiness
-- Ensure auth configuration is production-ready
-- Note: These are configuration settings that should be applied via Supabase dashboard

-- Phase 2: Database optimizations and additional security
-- Add triggers for automatic audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    action,
    record_id,
    old_values,
    new_values,
    user_id,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add audit triggers to critical tables
DROP TRIGGER IF EXISTS profiles_audit_trigger ON profiles;
CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS properties_audit_trigger ON properties;
CREATE TRIGGER properties_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Phase 3: Development Mode Optimization
-- Create development utilities and monitoring functions
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
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
$function$;

-- Create function to reset demo data (for development)
CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only allow in development mode
  IF current_setting('app.environment', true) != 'development' THEN
    RAISE EXCEPTION 'Demo data reset only allowed in development mode';
  END IF;
  
  -- Reset non-critical tables for demo purposes
  TRUNCATE TABLE housekeeping_tasks CASCADE;
  TRUNCATE TABLE maintenance_tasks CASCADE;
  TRUNCATE TABLE inventory_usage CASCADE;
  TRUNCATE TABLE damage_reports CASCADE;
  TRUNCATE TABLE damage_report_media CASCADE;
  
  -- Log the reset
  INSERT INTO audit_logs (table_name, action, user_id, created_at)
  VALUES ('demo_data', 'RESET', auth.uid(), NOW());
END;
$function$;

-- Phase 4: Monitoring & Maintenance
-- Create comprehensive monitoring views
CREATE OR REPLACE VIEW public.integration_health_summary AS
SELECT 
  provider,
  status,
  last_synced,
  request_count,
  remaining_requests,
  is_rate_limited,
  CASE 
    WHEN last_synced > NOW() - INTERVAL '1 hour' THEN 'healthy'
    WHEN last_synced > NOW() - INTERVAL '6 hours' THEN 'warning'
    ELSE 'critical'
  END as health_status
FROM integration_health;

-- Create performance monitoring view
CREATE OR REPLACE VIEW public.performance_summary AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  query_type,
  table_name,
  COUNT(*) as query_count,
  AVG(execution_time_ms) as avg_execution_time,
  MAX(execution_time_ms) as max_execution_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_execution_time
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), query_type, table_name
ORDER BY hour DESC;

-- Create maintenance function for scheduled cleanup
CREATE OR REPLACE FUNCTION public.scheduled_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Run cleanup
  PERFORM cleanup_old_logs();
  
  -- Update statistics
  ANALYZE;
  
  -- Log maintenance completion
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('scheduled_maintenance', 0, 'system');
END;
$function$;

-- Set up proper grants for monitoring
GRANT SELECT ON public.integration_health_summary TO authenticated;
GRANT SELECT ON public.performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_health() TO authenticated;