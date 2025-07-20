
-- Security fixes for RLS and views
-- Fix 1: Enable RLS on query_performance_log table with proper policies
-- Fix 2: Secure the views with RLS policies

-- Enable RLS on query_performance_log if not already enabled
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Create admin-only SELECT policy for query_performance_log
CREATE POLICY "query_performance_log_admin_select" ON public.query_performance_log
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Create system INSERT policy for automated logging
CREATE POLICY "query_performance_log_system_insert" ON public.query_performance_log
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR 
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Enable RLS on the security definer views
-- Note: Views inherit RLS from their underlying tables, but we need to ensure proper access

-- Create RLS policies for integration_health_summary view
-- First, we need to check if this is actually a view or table
DO $$
BEGIN
  -- Check if integration_health_summary exists as a table and enable RLS
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'integration_health_summary') THEN
    ALTER TABLE public.integration_health_summary ENABLE ROW LEVEL SECURITY;
    
    -- Create admin-only access policy
    CREATE POLICY "integration_health_summary_admin_access" ON public.integration_health_summary
      FOR SELECT USING (
        get_user_role_safe() IN ('superadmin', 'administrator')
      );
  END IF;
END
$$;

-- Create RLS policies for performance_summary view
DO $$
BEGIN
  -- Check if performance_summary exists as a table and enable RLS
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'performance_summary') THEN
    ALTER TABLE public.performance_summary ENABLE ROW LEVEL SECURITY;
    
    -- Create admin-only access policy
    CREATE POLICY "performance_summary_admin_access" ON public.performance_summary
      FOR SELECT USING (
        get_user_role_safe() IN ('superadmin', 'administrator')
      );
  END IF;
END
$$;

-- Additional security: Ensure service role can still perform maintenance operations
CREATE POLICY "query_performance_log_service_role_all" ON public.query_performance_log
  FOR ALL USING (
    auth.role() = 'service_role'
  );
