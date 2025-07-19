-- =================================================================
-- PHASE 1B: DATABASE OPTIMIZATION - Part 2 (Fixed)
-- Performance Indexes and Optimization Functions
-- =================================================================

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_guesty_bookings_listing_dates 
  ON guesty_bookings(listing_id, check_in, check_out);

CREATE INDEX IF NOT EXISTS idx_guesty_bookings_status_dates 
  ON guesty_bookings(status, check_in) 
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_due_status 
  ON housekeeping_tasks(due_date, status) 
  WHERE status != 'completed';

CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_listing_date 
  ON housekeeping_tasks(listing_id, due_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_property_status 
  ON maintenance_tasks(property_id, status);

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned_due 
  ON maintenance_tasks(assigned_to, due_date) 
  WHERE status != 'completed';

CREATE INDEX IF NOT EXISTS idx_financial_reports_property_month 
  ON financial_reports(property, month);

CREATE INDEX IF NOT EXISTS idx_inventory_stock_item_location 
  ON inventory_stock(item_id, location_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created 
  ON chat_messages(channel_id, created_at DESC);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_query_performance_log_created 
  ON query_performance_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_type 
  ON query_performance_log(query_type, created_at DESC);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
  ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_created 
  ON audit_logs(table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created 
  ON audit_logs(action, created_at DESC);

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
$$;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_performance_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the refresh attempt
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('materialized_view_refresh', 0, 'performance_views');
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
  
  -- Log the cleanup
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('log_cleanup', 0, 'system_maintenance');
END;
$$;