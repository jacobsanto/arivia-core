-- Disable only the specific user triggers that are causing issues
DROP TRIGGER IF EXISTS create_housekeeping_tasks_trigger ON guesty_bookings;
DROP TRIGGER IF EXISTS create_housekeeping_tasks_on_booking ON guesty_bookings;
DROP TRIGGER IF EXISTS trigger_handle_new_booking ON guesty_bookings;
DROP TRIGGER IF EXISTS trigger_housekeeping_tasks_on_insert ON guesty_bookings;
DROP TRIGGER IF EXISTS trigger_housekeeping_tasks_on_update ON guesty_bookings;
DROP TRIGGER IF EXISTS update_housekeeping_tasks_trigger ON guesty_bookings;

-- Now insert the data
INSERT INTO guesty_listings (id, title, status, property_type, thumbnail_url, highres_url, sync_status, raw_data, address) VALUES
  ('listing_001', 'Luxury Villa Santorini', 'listed', 'villa', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'active', '{"bedrooms": 4, "bathrooms": 3, "maxGuests": 8}', '{"city": "Santorini", "country": "Greece"}'),
  ('listing_002', 'Modern Apartment Athens', 'listed', 'apartment', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'active', '{"bedrooms": 2, "bathrooms": 2, "maxGuests": 4}', '{"city": "Athens", "country": "Greece"}'),
  ('listing_003', 'Beachfront Villa Mykonos', 'listed', 'villa', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'active', '{"bedrooms": 3, "bathrooms": 2, "maxGuests": 6}', '{"city": "Mykonos", "country": "Greece"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guesty_bookings (id, listing_id, check_in, check_out, status, guest_name, guest_email, raw_data) VALUES
  ('booking_001', 'listing_001', '2024-02-15', '2024-02-20', 'confirmed', 'John Smith', 'john.smith@email.com', '{"guestsCount": 6, "money": {"totalPrice": 2400, "netAmount": 2160, "channelFee": 240, "currency": "EUR"}, "guests": {"adults": 4, "children": 2, "infants": 0}}'),
  ('booking_002', 'listing_002', '2024-02-10', '2024-02-17', 'confirmed', 'Maria Garcia', 'maria.garcia@email.com', '{"guestsCount": 3, "money": {"totalPrice": 1050, "netAmount": 945, "channelFee": 105, "currency": "EUR"}, "guests": {"adults": 2, "children": 1, "infants": 0}}'),
  ('booking_003', 'listing_003', '2024-03-01', '2024-03-08', 'confirmed', 'David Johnson', 'david.johnson@email.com', '{"guestsCount": 4, "money": {"totalPrice": 1680, "netAmount": 1512, "channelFee": 168, "currency": "EUR"}, "guests": {"adults": 4, "children": 0, "infants": 0}}'),
  ('booking_004', 'listing_001', '2024-03-15', '2024-03-25', 'confirmed', 'Sophie Wilson', 'sophie.wilson@email.com', '{"guestsCount": 8, "money": {"totalPrice": 4200, "netAmount": 3780, "channelFee": 420, "currency": "EUR"}, "guests": {"adults": 6, "children": 2, "infants": 0}}'),
  ('booking_005', 'listing_002', '2024-04-01', '2024-04-05', 'confirmed', 'Michael Brown', 'michael.brown@email.com', '{"guestsCount": 2, "money": {"totalPrice": 800, "netAmount": 720, "channelFee": 80, "currency": "EUR"}, "guests": {"adults": 2, "children": 0, "infants": 0}}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO financial_reports (
  booking_id, listing_id, amount_paid, currency, channel_fee, check_in, check_out,
  revenue, month, property, profit, expenses, margin, category
) VALUES
  ('booking_001', 'listing_001', 2160, 'EUR', 240, '2024-02-15', '2024-02-20', 2160, '2024-02', 'listing_001', 1920, 240, '88.89%', 'revenue'),
  ('booking_002', 'listing_002', 945, 'EUR', 105, '2024-02-10', '2024-02-17', 945, '2024-02', 'listing_002', 840, 105, '88.89%', 'revenue'),
  ('booking_003', 'listing_003', 1512, 'EUR', 168, '2024-03-01', '2024-03-08', 1512, '2024-03', 'listing_003', 1344, 168, '88.89%', 'revenue'),
  ('booking_004', 'listing_001', 3780, 'EUR', 420, '2024-03-15', '2024-03-25', 3780, '2024-03', 'listing_001', 3360, 420, '88.89%', 'revenue'),
  ('booking_005', 'listing_002', 720, 'EUR', 80, '2024-04-01', '2024-04-05', 720, '2024-04', 'listing_002', 640, 80, '88.89%', 'revenue')
ON CONFLICT (booking_id) DO NOTHING;

INSERT INTO housekeeping_tasks (listing_id, booking_id, due_date, task_type, description, status) VALUES
  ('listing_001', 'booking_001', '2024-02-14', 'Standard Cleaning', 'Pre-arrival preparation for 6 guests (5 nights)', 'pending'),
  ('listing_001', 'booking_001', '2024-02-20', 'Standard Cleaning', 'Post-checkout cleanup after 6 guests (5-night stay)', 'pending'),
  ('listing_002', 'booking_002', '2024-02-09', 'Standard Cleaning', 'Pre-arrival preparation for 3 guests (7 nights)', 'pending'),
  ('listing_002', 'booking_002', '2024-02-17', 'Standard Cleaning', 'Post-checkout cleanup after 3 guests (7-night stay)', 'pending'),
  ('listing_003', 'booking_003', '2024-02-29', 'Standard Cleaning', 'Pre-arrival preparation for 4 guests (7 nights)', 'pending'),
  ('listing_003', 'booking_003', '2024-03-08', 'Standard Cleaning', 'Post-checkout cleanup after 4 guests (7-night stay)', 'pending'),
  ('listing_001', 'booking_004', '2024-03-14', 'Standard Cleaning', 'Pre-arrival preparation for 8 guests (10 nights)', 'pending'),
  ('listing_001', 'booking_004', '2024-03-25', 'Standard Cleaning', 'Post-checkout cleanup after 8 guests (10-night stay)', 'pending'),
  ('listing_002', 'booking_005', '2024-03-31', 'Standard Cleaning', 'Pre-arrival preparation for 2 guests (4 nights)', 'pending'),
  ('listing_002', 'booking_005', '2024-04-05', 'Standard Cleaning', 'Post-checkout cleanup after 2 guests (4-night stay)', 'pending')
ON CONFLICT DO NOTHING;