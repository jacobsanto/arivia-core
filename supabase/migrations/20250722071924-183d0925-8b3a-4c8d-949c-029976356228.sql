
-- Phase 1: Fix Authentication Security Functions
-- Update get_user_role_safe to return NULL for anonymous users
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE 
    WHEN user_id IS NULL THEN NULL
    ELSE role 
  END
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- Update get_current_user_role to require authentication
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN NULL
    ELSE role 
  END
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Create new is_authenticated helper function
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Phase 2: Fix Database Function Security - Add proper search_path to all functions
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

-- Update all other critical functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
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
    'revenue_this_month', 0
  ) INTO result
  FROM guesty_listings
  WHERE is_deleted = false;
  
  RETURN result;
END;
$$;

-- Phase 3: Fix RLS Policies - Update all policies to require authentication first

-- Fix audit_logs policies
DROP POLICY IF EXISTS "audit_logs_admin_access" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_access" ON public.audit_logs
  FOR ALL USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Fix bookings policies
DROP POLICY IF EXISTS "Property managers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property managers can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property managers can view relevant bookings" ON public.bookings;

CREATE POLICY "Property managers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Property managers can update bookings" ON public.bookings
  FOR UPDATE USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Property managers can view relevant bookings" ON public.bookings
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- Fix chat_channels policies
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.chat_channels;
DROP POLICY IF EXISTS "Users can view chat channels" ON public.chat_channels;

CREATE POLICY "Authenticated users can create channels" ON public.chat_channels
  FOR INSERT WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Users can view chat channels" ON public.chat_channels
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IS NOT NULL
  );

-- Fix direct_messages policies
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;

CREATE POLICY "Users can send direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    is_authenticated() AND sender_id = auth.uid()
  );

CREATE POLICY "Users can view their direct messages" ON public.direct_messages
  FOR SELECT USING (
    is_authenticated() AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

-- Fix guesty_bookings policies
DROP POLICY IF EXISTS "guesty_bookings_read_access" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_admin_write" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_admin_update" ON public.guesty_bookings;
DROP POLICY IF EXISTS "guesty_bookings_admin_delete" ON public.guesty_bookings;

CREATE POLICY "guesty_bookings_read_access" ON public.guesty_bookings
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff')
  );

CREATE POLICY "guesty_bookings_admin_write" ON public.guesty_bookings
  FOR INSERT WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "guesty_bookings_admin_update" ON public.guesty_bookings
  FOR UPDATE USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "guesty_bookings_admin_delete" ON public.guesty_bookings
  FOR DELETE USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Fix guesty_listings policies
DROP POLICY IF EXISTS "guesty_listings_read_access" ON public.guesty_listings;

CREATE POLICY "guesty_listings_read_access" ON public.guesty_listings
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff')
  );

-- Fix housekeeping_tasks policies
DROP POLICY IF EXISTS "housekeeping_tasks_staff_read" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "housekeeping_tasks_staff_update" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "housekeeping_tasks_manager_insert" ON public.housekeeping_tasks;

CREATE POLICY "housekeeping_tasks_staff_read" ON public.housekeeping_tasks
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff')
  );

CREATE POLICY "housekeeping_tasks_staff_update" ON public.housekeeping_tasks
  FOR UPDATE USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff')
  );

CREATE POLICY "housekeeping_tasks_manager_insert" ON public.housekeeping_tasks
  FOR INSERT WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- Fix integration_health policies
DROP POLICY IF EXISTS "Allow staff to view integration health" ON public.integration_health;

CREATE POLICY "Allow staff to view integration health" ON public.integration_health
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- Fix properties policies
DROP POLICY IF EXISTS "Properties are viewable by staff" ON public.properties;
DROP POLICY IF EXISTS "Property managers can manage properties" ON public.properties;

CREATE POLICY "Properties are viewable by staff" ON public.properties
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff')
  );

CREATE POLICY "Property managers can manage properties" ON public.properties
  FOR ALL USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  )
  WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator', 'property_manager')
  );

-- Fix system_permissions policies
DROP POLICY IF EXISTS "Only superadmins can manage system permissions" ON public.system_permissions;

CREATE POLICY "Only superadmins can manage system permissions" ON public.system_permissions
  FOR ALL USING (
    is_authenticated() AND get_user_role_safe() = 'superadmin'
  );

-- Add authentication requirements to query_performance_log policies
DROP POLICY IF EXISTS "query_performance_log_admin_select" ON public.query_performance_log;

CREATE POLICY "query_performance_log_admin_select" ON public.query_performance_log
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

-- Fix security_events policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'security_events') THEN
    DROP POLICY IF EXISTS "security_events_admin_access" ON public.security_events;
    
    CREATE POLICY "security_events_admin_access" ON public.security_events
      FOR ALL USING (
        is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
      )
      WITH CHECK (
        is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
      );
  END IF;
END
$$;

-- Fix user_activity_log policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activity_log') THEN
    DROP POLICY IF EXISTS "user_activity_admin_access" ON public.user_activity_log;
    
    CREATE POLICY "user_activity_admin_access" ON public.user_activity_log
      FOR ALL USING (
        is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
      )
      WITH CHECK (
        is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
      );
  END IF;
END
$$;

-- Security audit log entry
INSERT INTO audit_logs (table_name, action, user_id, created_at)
VALUES ('security_fixes', 'PHASE_1_2_3_COMPLETE', auth.uid(), NOW());
