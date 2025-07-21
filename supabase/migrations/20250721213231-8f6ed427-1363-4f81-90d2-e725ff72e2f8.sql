-- Phase 1: Create sample data for testing and fix security issues

-- First, let's create some sample listings and bookings for testing
INSERT INTO guesty_listings (id, title, status, property_type, thumbnail_url, highres_url, sync_status, raw_data, address) VALUES
  ('listing_001', 'Luxury Villa Santorini', 'listed', 'villa', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'active', '{"bedrooms": 4, "bathrooms": 3, "maxGuests": 8}', '{"city": "Santorini", "country": "Greece"}'),
  ('listing_002', 'Modern Apartment Athens', 'listed', 'apartment', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'active', '{"bedrooms": 2, "bathrooms": 2, "maxGuests": 4}', '{"city": "Athens", "country": "Greece"}'),
  ('listing_003', 'Beachfront Villa Mykonos', 'listed', 'villa', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'active', '{"bedrooms": 3, "bathrooms": 2, "maxGuests": 6}', '{"city": "Mykonos", "country": "Greece"}')
ON CONFLICT (id) DO NOTHING;

-- Create sample bookings with realistic data
INSERT INTO guesty_bookings (id, listing_id, check_in, check_out, status, guest_name, guest_email, raw_data) VALUES
  ('booking_001', 'listing_001', '2024-02-15', '2024-02-20', 'confirmed', 'John Smith', 'john.smith@email.com', '{"guestsCount": 6, "money": {"totalPrice": 2400, "netAmount": 2160, "channelFee": 240, "currency": "EUR"}, "guests": {"adults": 4, "children": 2, "infants": 0}}'),
  ('booking_002', 'listing_002', '2024-02-10', '2024-02-17', 'confirmed', 'Maria Garcia', 'maria.garcia@email.com', '{"guestsCount": 3, "money": {"totalPrice": 1050, "netAmount": 945, "channelFee": 105, "currency": "EUR"}, "guests": {"adults": 2, "children": 1, "infants": 0}}'),
  ('booking_003', 'listing_003', '2024-03-01', '2024-03-08', 'confirmed', 'David Johnson', 'david.johnson@email.com', '{"guestsCount": 4, "money": {"totalPrice": 1680, "netAmount": 1512, "channelFee": 168, "currency": "EUR"}, "guests": {"adults": 4, "children": 0, "infants": 0}}'),
  ('booking_004', 'listing_001', '2024-03-15', '2024-03-25', 'confirmed', 'Sophie Wilson', 'sophie.wilson@email.com', '{"guestsCount": 8, "money": {"totalPrice": 4200, "netAmount": 3780, "channelFee": 420, "currency": "EUR"}, "guests": {"adults": 6, "children": 2, "infants": 0}}'),
  ('booking_005', 'listing_002', '2024-04-01', '2024-04-05', 'confirmed', 'Michael Brown', 'michael.brown@email.com', '{"guestsCount": 2, "money": {"totalPrice": 800, "netAmount": 720, "channelFee": 80, "currency": "EUR"}, "guests": {"adults": 2, "children": 0, "infants": 0}}')
ON CONFLICT (id) DO NOTHING;

-- Fix security definer functions by setting proper search_path
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

DROP FUNCTION IF EXISTS public.get_user_role_safe(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

-- Update all existing functions to have proper search_path
DROP FUNCTION IF EXISTS public.get_dashboard_metrics();
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Update get_system_health function
DROP FUNCTION IF EXISTS public.get_system_health();
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

-- Add indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_housekeeping_tasks_due_date_status ON housekeeping_tasks(due_date, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guesty_bookings_check_in_status ON guesty_bookings(check_in, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_reports_month ON financial_reports(month);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_performance_log_created_at ON query_performance_log(created_at);

-- Create a function to generate sample financial reports
CREATE OR REPLACE FUNCTION public.generate_sample_financial_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  booking_rec RECORD;
BEGIN
  -- Generate financial reports for all confirmed bookings
  FOR booking_rec IN 
    SELECT id, listing_id, check_in, check_out, raw_data
    FROM guesty_bookings 
    WHERE status = 'confirmed'
  LOOP
    INSERT INTO financial_reports (
      booking_id,
      listing_id,
      amount_paid,
      currency,
      channel_fee,
      check_in,
      check_out,
      revenue,
      month,
      property,
      profit,
      expenses,
      margin,
      category
    ) VALUES (
      booking_rec.id,
      booking_rec.listing_id,
      COALESCE((booking_rec.raw_data->>'money'->>'netAmount')::numeric, 0),
      COALESCE(booking_rec.raw_data->>'money'->>'currency', 'EUR'),
      COALESCE((booking_rec.raw_data->>'money'->>'channelFee')::numeric, 0),
      booking_rec.check_in,
      booking_rec.check_out,
      COALESCE((booking_rec.raw_data->>'money'->>'netAmount')::numeric, 0),
      to_char(booking_rec.check_in, 'YYYY-MM'),
      booking_rec.listing_id,
      COALESCE((booking_rec.raw_data->>'money'->>'netAmount')::numeric, 0) - COALESCE((booking_rec.raw_data->>'money'->>'channelFee')::numeric, 0),
      COALESCE((booking_rec.raw_data->>'money'->>'channelFee')::numeric, 0),
      CASE 
        WHEN COALESCE((booking_rec.raw_data->>'money'->>'netAmount')::numeric, 0) > 0 
        THEN round(((COALESCE((booking_rec.raw_data->>'money'->>'netAmount')::numeric, 0) - COALESCE((booking_rec.raw_data->>'money'->>'channelFee')::numeric, 0)) / 
             COALESCE((booking_rec.raw_data->>'money'->>'netAmount')::numeric, 1) * 100)::numeric, 2)::text || '%'
        ELSE '0%'
      END,
      'revenue'
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END LOOP;
END;
$function$;

-- Execute the function to generate financial data
SELECT public.generate_sample_financial_data();