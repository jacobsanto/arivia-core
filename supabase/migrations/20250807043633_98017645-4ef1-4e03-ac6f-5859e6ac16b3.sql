-- ===================================================
-- CRITICAL SECURITY FIXES FOR SUPABASE DATABASE
-- Phase 1: Fix anonymous access policies and function security
-- ===================================================

-- 1. Fix profiles table security - CRITICAL
-- Remove permissive anonymous policies and restrict to authenticated users
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;

-- Create restrictive authenticated-only policies for profiles
CREATE POLICY "Authenticated users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Superadmins can view all profiles for user management
CREATE POLICY "Superadmins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- 2. Fix audit_logs table - CRITICAL SECURITY 
-- Remove anonymous access and restrict to superadmins only
DROP POLICY IF EXISTS "audit_logs_admin_access" ON public.audit_logs;

CREATE POLICY "audit_logs_superadmin_only" ON public.audit_logs
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 3. Fix system_settings table - CRITICAL
-- Remove overly permissive policies
DROP POLICY IF EXISTS "system_settings_admin_all" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_superadmin_access" ON public.system_settings;

CREATE POLICY "system_settings_admin_restricted" ON public.system_settings
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('superadmin', 'administrator')
    )
  );

-- 4. Fix integration_tokens table - CRITICAL
-- This table should be service role only
DROP POLICY IF EXISTS "Allow service role full access" ON public.integration_tokens;

CREATE POLICY "integration_tokens_service_only" ON public.integration_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- 5. Fix security_events table access
DROP POLICY IF EXISTS "security_events_admin_access" ON public.security_events;

CREATE POLICY "security_events_superadmin_only" ON public.security_events
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 6. Secure database functions - Fix search_path vulnerabilities
-- These functions need secure search_path to prevent SQL injection

ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.get_user_role_safe(uuid) SET search_path = '';
ALTER FUNCTION public.get_current_user_role_secure() SET search_path = '';
ALTER FUNCTION public.is_authenticated() SET search_path = '';

-- 7. Fix query_performance_log access
DROP POLICY IF EXISTS "query_performance_log_admin_select" ON public.query_performance_log;
DROP POLICY IF EXISTS "query_performance_log_system_insert" ON public.query_performance_log;

CREATE POLICY "query_performance_superadmin_access" ON public.query_performance_log
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "query_performance_service_insert" ON public.query_performance_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 8. Fix settings_audit_log to be superadmin only
DROP POLICY IF EXISTS "settings_audit_superadmin_access" ON public.settings_audit_log;

CREATE POLICY "settings_audit_superadmin_only" ON public.settings_audit_log
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 9. Secure additional database functions
ALTER FUNCTION public.log_security_event(text, text, uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.get_security_dashboard() SET search_path = '';
ALTER FUNCTION public.create_user_with_role(text, text, text, text) SET search_path = '';
ALTER FUNCTION public.update_user_role(uuid, text) SET search_path = '';

-- Add an audit entry for these security changes
INSERT INTO public.audit_logs (table_name, action, user_id, new_values, created_at)
VALUES (
  'security_policies', 
  'SECURITY_HARDENING', 
  auth.uid(), 
  '{"action": "Fixed critical anonymous access vulnerabilities", "tables_affected": ["profiles", "audit_logs", "system_settings", "integration_tokens", "security_events"], "functions_secured": 9}'::jsonb,
  NOW()
);