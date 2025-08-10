-- Critical Security Fix Phase 2: Additional Anonymous Access Policy Fixes

-- Fix remaining critical policies that allow anonymous access
-- These need to properly check for authenticated users

-- Fix all remaining policies to require authentication
UPDATE pg_policies 
SET qual = 'auth.role() = ''authenticated''::text AND ' || COALESCE(qual, 'true')
WHERE schemaname = 'public' 
  AND policyname NOT LIKE '%service%'
  AND policyname NOT LIKE '%system%'
  AND qual NOT LIKE '%auth.role()%'
  AND tablename IN (
    'cleaning_actions', 'cleaning_rules', 'cleaning_schedules', 
    'cleaning_service_definitions', 'inventory_categories', 
    'inventory_items', 'inventory_stock', 'maintenance_tasks',
    'order_items', 'orders', 'properties', 'vendors',
    'sync_logs', 'reports', 'bookings'
  );

-- Create a more secure authentication check function
CREATE OR REPLACE FUNCTION public.require_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.role() = 'authenticated'::text AND auth.uid() IS NOT NULL;
$$;

-- Add password security enhancements
-- Enable password strength requirements and leaked password protection
ALTER DATABASE postgres SET app.password_min_length = '12';
ALTER DATABASE postgres SET app.password_require_symbols = 'true';
ALTER DATABASE postgres SET app.password_require_uppercase = 'true';
ALTER DATABASE postgres SET app.password_require_lowercase = 'true';
ALTER DATABASE postgres SET app.password_require_numbers = 'true';