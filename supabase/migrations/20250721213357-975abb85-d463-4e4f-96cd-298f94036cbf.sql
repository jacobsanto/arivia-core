-- Fix the trigger function that was causing the error
DROP FUNCTION IF EXISTS public.extract_booking_financial_data() CASCADE;
CREATE OR REPLACE FUNCTION public.extract_booking_financial_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Extract guest email from raw_data (guesty_bookings doesn't have amount_paid field)
  NEW.guest_email := COALESCE(NEW.guest_email, NEW.raw_data->'guest'->>'email');
  
  RETURN NEW;
END;
$function$;

-- Now create the sample data again
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

-- Generate sample financial data
SELECT public.generate_sample_financial_data();