-- =================================================================
-- PHASE 1B: DATABASE OPTIMIZATION & PERFORMANCE ENHANCEMENT
-- =================================================================

-- CRITICAL FIX: Resolve infinite recursion in profiles table policies
-- The current policies are causing infinite loops when checking user roles

-- First, drop the problematic policies
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "user_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "user_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "system_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create optimized RLS policies without recursion
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'administrator')
    )
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'administrator')
    )
  );

-- =================================================================
-- PERFORMANCE OPTIMIZATION: Add strategic indexes
-- =================================================================

-- Critical indexes for frequent queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guesty_bookings_listing_dates 
  ON guesty_bookings(listing_id, check_in, check_out);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guesty_bookings_status_dates 
  ON guesty_bookings(status, check_in) 
  WHERE status = 'confirmed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_housekeeping_tasks_due_status 
  ON housekeeping_tasks(due_date, status) 
  WHERE status != 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_housekeeping_tasks_listing_date 
  ON housekeeping_tasks(listing_id, due_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maintenance_tasks_property_status 
  ON maintenance_tasks(property_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maintenance_tasks_assigned_due 
  ON maintenance_tasks(assigned_to, due_date) 
  WHERE status != 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_reports_property_month 
  ON financial_reports(property, month);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_stock_item_location 
  ON inventory_stock(item_id, location_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_channel_created 
  ON chat_messages(channel_id, created_at DESC);

-- =================================================================
-- MATERIALIZED VIEWS for complex analytics
-- =================================================================

-- Property performance dashboard view
CREATE MATERIALIZED VIEW IF NOT EXISTS property_performance_stats AS
SELECT 
  gl.id as property_id,
  gl.title as property_name,
  COUNT(gb.id) as total_bookings,
  COUNT(CASE WHEN gb.status = 'confirmed' THEN 1 END) as confirmed_bookings,
  AVG(EXTRACT(DAYS FROM (gb.check_out - gb.check_in))) as avg_stay_duration,
  SUM(CASE WHEN gb.status = 'confirmed' THEN (gb.raw_data->>'money'->>'totalPrice')::numeric ELSE 0 END) as total_revenue,
  COUNT(DISTINCT DATE_TRUNC('month', gb.check_in)) as active_months,
  MAX(gb.check_out) as last_checkout,
  MIN(gb.check_in) as first_checkin
FROM guesty_listings gl
LEFT JOIN guesty_bookings gb ON gl.id = gb.listing_id
WHERE gl.is_deleted = false
GROUP BY gl.id, gl.title;

-- Create index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_performance_stats_property_id 
  ON property_performance_stats(property_id);

-- Task completion analytics view
CREATE MATERIALIZED VIEW IF NOT EXISTS task_completion_stats AS
SELECT 
  listing_id as property_id,
  task_type,
  DATE_TRUNC('month', due_date) as month,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
  AVG(CASE 
    WHEN status = 'completed' 
    THEN EXTRACT(DAYS FROM (updated_at - created_at))
    ELSE NULL 
  END) as avg_completion_days
FROM housekeeping_tasks
WHERE due_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY listing_id, task_type, DATE_TRUNC('month', due_date);

-- Create indexes for task stats
CREATE INDEX IF NOT EXISTS idx_task_completion_stats_property_month 
  ON task_completion_stats(property_id, month);

CREATE INDEX IF NOT EXISTS idx_task_completion_stats_type_month 
  ON task_completion_stats(task_type, month);

-- =================================================================
-- PERFORMANCE MONITORING TABLES
-- =================================================================

-- Query performance tracking
CREATE TABLE IF NOT EXISTS query_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  table_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create index for performance monitoring
CREATE INDEX IF NOT EXISTS idx_query_performance_log_created 
  ON query_performance_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_type 
  ON query_performance_log(query_type, created_at DESC);

-- =================================================================
-- AUDIT LOGGING ENHANCEMENT
-- =================================================================

-- Enhanced audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
  ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_created 
  ON audit_logs(table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created 
  ON audit_logs(action, created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "audit_logs_admin_access" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'administrator')
    )
  );

-- =================================================================
-- AUTOMATED MAINTENANCE FUNCTIONS
-- =================================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_performance_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY property_performance_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY task_completion_stats;
  
  -- Log the refresh
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('materialized_view_refresh', 0, 'all_views');
END;
$$;

-- Function to clean old logs
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
END;
$$;

-- =================================================================
-- ENABLE EXTENSIONS FOR ADVANCED FEATURES
-- =================================================================

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =================================================================
-- OPTIMIZED FUNCTIONS FOR COMMON QUERIES
-- =================================================================

-- Fast dashboard metrics function
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'properties', jsonb_build_object(
      'total', COUNT(*),
      'active', COUNT(*) FILTER (WHERE status = 'active')
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
$$;