-- Final simple data insertion without trigger interference
-- Drop the problematic function completely
DROP FUNCTION IF EXISTS public.handle_booking_financials() CASCADE;

-- Simple data insertion
INSERT INTO guesty_listings (id, title, status, property_type, sync_status) VALUES
  ('listing_001', 'Luxury Villa Santorini', 'listed', 'villa', 'active'),
  ('listing_002', 'Modern Apartment Athens', 'listed', 'apartment', 'active'),
  ('listing_003', 'Beachfront Villa Mykonos', 'listed', 'villa', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guesty_bookings (id, listing_id, check_in, check_out, status, guest_name) VALUES
  ('booking_001', 'listing_001', '2024-02-15', '2024-02-20', 'confirmed', 'John Smith'),
  ('booking_002', 'listing_002', '2024-02-10', '2024-02-17', 'confirmed', 'Maria Garcia'),
  ('booking_003', 'listing_003', '2024-03-01', '2024-03-08', 'confirmed', 'David Johnson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO financial_reports (booking_id, listing_id, revenue, expenses, profit, month, property, category) VALUES
  ('booking_001', 'listing_001', 2160, 240, 1920, '2024-02', 'listing_001', 'revenue'),
  ('booking_002', 'listing_002', 945, 105, 840, '2024-02', 'listing_002', 'revenue'),
  ('booking_003', 'listing_003', 1512, 168, 1344, '2024-03', 'listing_003', 'revenue')
ON CONFLICT (booking_id) DO NOTHING;

INSERT INTO housekeeping_tasks (listing_id, booking_id, due_date, task_type, status) VALUES
  ('listing_001', 'booking_001', '2024-02-20', 'Standard Cleaning', 'pending'),
  ('listing_002', 'booking_002', '2024-02-17', 'Standard Cleaning', 'pending'),
  ('listing_003', 'booking_003', '2024-03-08', 'Standard Cleaning', 'pending')
ON CONFLICT DO NOTHING;