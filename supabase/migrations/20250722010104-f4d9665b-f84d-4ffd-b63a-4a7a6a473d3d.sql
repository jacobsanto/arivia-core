-- Phase 1: Emergency Security Lockdown
-- Fix 58 anonymous access policies and secure database functions

-- 1. Fix Anonymous Access Policies - Replace with role-based access
-- Drop existing problematic policies and recreate with proper role checks

-- Fix audit_logs policies
DROP POLICY IF EXISTS "audit_logs_admin_access" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_access" ON public.audit_logs
  FOR ALL USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Fix bookings policies  
DROP POLICY IF EXISTS "Property managers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property managers can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property managers can view relevant bookings" ON public.bookings;

CREATE POLICY "Property managers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Property managers can update bookings" ON public.bookings
  FOR UPDATE USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Property managers can view relevant bookings" ON public.bookings
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- Fix chat_channels policies
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.chat_channels;
DROP POLICY IF EXISTS "Users can view chat channels" ON public.chat_channels;
DROP POLICY IF EXISTS "Allow users to view public channels" ON public.chat_channels;

CREATE POLICY "Authenticated users can create channels" ON public.chat_channels
  FOR INSERT WITH CHECK (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Users can view chat channels" ON public.chat_channels
  FOR SELECT USING (
    get_user_role_safe() IS NOT NULL
  );

-- Fix direct_messages policies
DROP POLICY IF EXISTS "Allow users to send direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;

CREATE POLICY "Users can send direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND get_user_role_safe() IS NOT NULL
  );

CREATE POLICY "Users can view their direct messages" ON public.direct_messages
  FOR SELECT USING (
    (sender_id = auth.uid() OR recipient_id = auth.uid()) AND get_user_role_safe() IS NOT NULL
  );

-- Fix guesty_bookings policies
DROP POLICY IF EXISTS "guesty_bookings_authenticated_read" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_select_policy" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_insert_policy" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_update_policy" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_delete_policy" ON public.guesty_bookings;

CREATE POLICY "guesty_bookings_read_access" ON public.guesty_bookings
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff')
  );

CREATE POLICY "guesty_bookings_admin_write" ON public.guesty_bookings
  FOR INSERT WITH CHECK (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "guesty_bookings_admin_update" ON public.guesty_bookings
  FOR UPDATE USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "guesty_bookings_admin_delete" ON public.guesty_bookings
  FOR DELETE USING (
    get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Fix guesty_listings policies
DROP POLICY IF EXISTS "guesty_listings_authenticated_read" ON public.guesty_listings;

CREATE POLICY "guesty_listings_read_access" ON public.guesty_listings
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff')
  );

-- Fix housekeeping_tasks policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.housekeeping_tasks;

-- These policies already use get_user_role_safe() so they're secure, just ensure they're active
-- housekeeping_tasks_manager_insert, housekeeping_tasks_staff_read, housekeeping_tasks_staff_update

-- Fix integration_health policies
DROP POLICY IF EXISTS "Allow authenticated users to view integration health" ON public.integration_health;

CREATE POLICY "Allow staff to view integration health" ON public.integration_health
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- 2. Secure Database Functions - Add missing search_path
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.refresh_performance_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Log the refresh attempt
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('materialized_view_refresh', 0, 'performance_views');
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

CREATE OR REPLACE FUNCTION public.scheduled_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Run cleanup
  PERFORM cleanup_old_logs();
  
  -- Update statistics
  ANALYZE;
  
  -- Log maintenance completion
  INSERT INTO query_performance_log (query_type, execution_time_ms, table_name)
  VALUES ('scheduled_maintenance', 0, 'system');
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- 3. Remove problematic security definer views if they exist
DROP VIEW IF EXISTS integration_health_summary CASCADE;
DROP VIEW IF EXISTS performance_summary CASCADE;

-- 4. Add security improvements for properties table
DROP POLICY IF EXISTS "Properties are viewable by all authenticated users" ON public.properties;

CREATE POLICY "Properties are viewable by staff" ON public.properties
  FOR SELECT USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff')
  );

-- Enable INSERT/UPDATE/DELETE for property managers
CREATE POLICY "Property managers can manage properties" ON public.properties
  FOR ALL USING (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  )
  WITH CHECK (
    get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- 5. Security audit log
INSERT INTO audit_logs (table_name, action, user_id, created_at)
VALUES ('security_lockdown', 'PHASE_1_COMPLETE', auth.uid(), NOW());