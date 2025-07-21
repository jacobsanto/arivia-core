-- Fix the JSON access in the trigger function
DROP FUNCTION IF EXISTS public.handle_booking_financials() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_booking_financials()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Extract financial data from the booking's raw_data
  INSERT INTO public.financial_reports (
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
  )
  VALUES (
    NEW.id,
    NEW.listing_id,
    COALESCE((NEW.raw_data->'money'->>'netAmount')::numeric, 0),
    COALESCE(NEW.raw_data->'money'->>'currency', 'EUR'),
    COALESCE((NEW.raw_data->'money'->>'channelFee')::numeric, 0),
    NEW.check_in,
    NEW.check_out,
    COALESCE((NEW.raw_data->'money'->>'netAmount')::numeric, 0),
    to_char(NEW.check_in, 'YYYY-MM'),
    NEW.listing_id,
    COALESCE((NEW.raw_data->'money'->>'netAmount')::numeric, 0) - COALESCE((NEW.raw_data->'money'->>'channelFee')::numeric, 0),
    COALESCE((NEW.raw_data->'money'->>'channelFee')::numeric, 0),
    CASE 
      WHEN COALESCE((NEW.raw_data->'money'->>'netAmount')::numeric, 0) > 0 
      THEN round(((COALESCE((NEW.raw_data->'money'->>'netAmount')::numeric, 0) - COALESCE((NEW.raw_data->'money'->>'channelFee')::numeric, 0)) / 
           COALESCE((NEW.raw_data->'money'->>'netAmount')::numeric, 1) * 100)::numeric, 2)::text || '%'
      ELSE '0%'
    END,
    'revenue'
  )
  ON CONFLICT (booking_id) 
  DO UPDATE SET
    amount_paid = EXCLUDED.amount_paid,
    currency = EXCLUDED.currency,
    channel_fee = EXCLUDED.channel_fee,
    check_in = EXCLUDED.check_in,
    check_out = EXCLUDED.check_out,
    revenue = EXCLUDED.revenue,
    profit = EXCLUDED.profit,
    expenses = EXCLUDED.expenses,
    margin = EXCLUDED.margin,
    updated_at = now();

  RETURN NEW;
END;
$function$;

-- Update the generate_sample_financial_data function to fix JSON access
DROP FUNCTION IF EXISTS public.generate_sample_financial_data();
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
      COALESCE((booking_rec.raw_data->'money'->>'netAmount')::numeric, 0),
      COALESCE(booking_rec.raw_data->'money'->>'currency', 'EUR'),
      COALESCE((booking_rec.raw_data->'money'->>'channelFee')::numeric, 0),
      booking_rec.check_in,
      booking_rec.check_out,
      COALESCE((booking_rec.raw_data->'money'->>'netAmount')::numeric, 0),
      to_char(booking_rec.check_in, 'YYYY-MM'),
      booking_rec.listing_id,
      COALESCE((booking_rec.raw_data->'money'->>'netAmount')::numeric, 0) - COALESCE((booking_rec.raw_data->'money'->>'channelFee')::numeric, 0),
      COALESCE((booking_rec.raw_data->'money'->>'channelFee')::numeric, 0),
      CASE 
        WHEN COALESCE((booking_rec.raw_data->'money'->>'netAmount')::numeric, 0) > 0 
        THEN round(((COALESCE((booking_rec.raw_data->'money'->>'netAmount')::numeric, 0) - COALESCE((booking_rec.raw_data->'money'->>'channelFee')::numeric, 0)) / 
             COALESCE((booking_rec.raw_data->'money'->>'netAmount')::numeric, 1) * 100)::numeric, 2)::text || '%'
        ELSE '0%'
      END,
      'revenue'
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END LOOP;
END;
$function$;

-- Now insert the sample data
INSERT INTO guesty_listings (id, title, status, property_type, thumbnail_url, highres_url, sync_status, raw_data, address) VALUES
  ('listing_001', 'Luxury Villa Santorini', 'listed', 'villa', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'active', '{"bedrooms": 4, "bathrooms": 3, "maxGuests": 8}', '{"city": "Santorini", "country": "Greece"}'),
  ('listing_002', 'Modern Apartment Athens', 'listed', 'apartment', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'active', '{"bedrooms": 2, "bathrooms": 2, "maxGuests": 4}', '{"city": "Athens", "country": "Greece"}'),
  ('listing_003', 'Beachfront Villa Mykonos', 'listed', 'villa', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'active', '{"bedrooms": 3, "bathrooms": 2, "maxGuests": 6}', '{"city": "Mykonos", "country": "Greece"}')
ON CONFLICT (id) DO NOTHING;

-- Insert bookings - this will trigger automatic financial report generation
INSERT INTO guesty_bookings (id, listing_id, check_in, check_out, status, guest_name, guest_email, raw_data) VALUES
  ('booking_001', 'listing_001', '2024-02-15', '2024-02-20', 'confirmed', 'John Smith', 'john.smith@email.com', '{"guestsCount": 6, "money": {"totalPrice": 2400, "netAmount": 2160, "channelFee": 240, "currency": "EUR"}, "guests": {"adults": 4, "children": 2, "infants": 0}}'),
  ('booking_002', 'listing_002', '2024-02-10', '2024-02-17', 'confirmed', 'Maria Garcia', 'maria.garcia@email.com', '{"guestsCount": 3, "money": {"totalPrice": 1050, "netAmount": 945, "channelFee": 105, "currency": "EUR"}, "guests": {"adults": 2, "children": 1, "infants": 0}}'),
  ('booking_003', 'listing_003', '2024-03-01', '2024-03-08', 'confirmed', 'David Johnson', 'david.johnson@email.com', '{"guestsCount": 4, "money": {"totalPrice": 1680, "netAmount": 1512, "channelFee": 168, "currency": "EUR"}, "guests": {"adults": 4, "children": 0, "infants": 0}}'),
  ('booking_004', 'listing_001', '2024-03-15', '2024-03-25', 'confirmed', 'Sophie Wilson', 'sophie.wilson@email.com', '{"guestsCount": 8, "money": {"totalPrice": 4200, "netAmount": 3780, "channelFee": 420, "currency": "EUR"}, "guests": {"adults": 6, "children": 2, "infants": 0}}'),
  ('booking_005', 'listing_002', '2024-04-01', '2024-04-05', 'confirmed', 'Michael Brown', 'michael.brown@email.com', '{"guestsCount": 2, "money": {"totalPrice": 800, "netAmount": 720, "channelFee": 80, "currency": "EUR"}, "guests": {"adults": 2, "children": 0, "infants": 0}}')
ON CONFLICT (id) DO NOTHING;

-- Generate financial data manually since the bookings already exist
SELECT public.generate_sample_financial_data();