-- =================================================================
-- PHASE 1B: DATABASE OPTIMIZATION - Part 2
-- Performance Indexes and Optimization Functions
-- =================================================================

-- Create performance indexes (without CONCURRENTLY to avoid transaction issues)
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
  SUM(CASE WHEN gb.status = 'confirmed' THEN 
    COALESCE((gb.raw_data->>'money'->>'totalPrice')::numeric, 0) 
    ELSE 0 END) as total_revenue,
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