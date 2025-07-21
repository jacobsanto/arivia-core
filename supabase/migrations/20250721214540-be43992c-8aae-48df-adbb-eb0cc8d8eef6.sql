-- Drop the problematic function and all its triggers completely
DROP FUNCTION IF EXISTS public.extract_booking_financial_data() CASCADE;

-- Check what other triggers might exist on guesty_bookings
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'guesty_bookings' AND event_object_schema = 'public';