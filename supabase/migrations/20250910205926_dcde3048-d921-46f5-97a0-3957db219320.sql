-- Create seed data for test users and core functionality with valid role names

-- First, ensure we have test users in profiles table
INSERT INTO public.profiles (user_id, name, email, role, phone, avatar) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@ariviavillas.com', 'administrator', '+30-210-555-0101', '/placeholder.svg'),
  ('00000000-0000-0000-0000-000000000002', 'Property Manager', 'manager@ariviavillas.com', 'property_manager', '+30-210-555-0102', '/placeholder.svg'),
  ('00000000-0000-0000-0000-000000000003', 'Guest User', 'guest@ariviavillas.com', 'guest', '+30-210-555-0103', '/placeholder.svg'),
  ('00000000-0000-0000-0000-000000000004', 'Housekeeping Staff', 'housekeeping@ariviavillas.com', 'housekeeping_staff', '+30-210-555-0104', '/placeholder.svg'),
  ('00000000-0000-0000-0000-000000000005', 'Maintenance Staff', 'maintenance@ariviavillas.com', 'maintenance_staff', '+30-210-555-0105', '/placeholder.svg'),
  ('00000000-0000-0000-0000-000000000006', 'Housekeeping Staff 2', 'housekeeper2@ariviavillas.com', 'housekeeping_staff', '+30-210-555-0106', '/placeholder.svg'),
  ('00000000-0000-0000-0000-000000000007', 'Super Admin', 'superadmin@ariviavillas.com', 'superadmin', '+30-210-555-0107', '/placeholder.svg')
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  updated_at = now();

-- Create default chat channels
INSERT INTO public.chat_channels (id, name, description, topic, type, created_by, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'general', 'General team discussions', 'Welcome to Arivia Core! Use this channel for general team discussions.', 'public', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000002', 'maintenance-sos', 'Emergency maintenance issues', 'For urgent maintenance issues that need immediate attention', 'public', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000003', 'housekeeping', 'Daily housekeeping coordination', 'Daily coordination for housekeeping tasks and schedules', 'public', '00000000-0000-0000-0000-000000000004', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  topic = EXCLUDED.topic,
  updated_at = now();

-- Add all users to general channel
INSERT INTO public.channel_members (channel_id, user_id, role)
SELECT '00000000-0000-0000-0000-000000000001', user_id, 'member'
FROM public.profiles
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007'
)
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Add relevant users to maintenance channel
INSERT INTO public.channel_members (channel_id, user_id, role)
SELECT '00000000-0000-0000-0000-000000000002', user_id, 'member'
FROM public.profiles
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000005'
)
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Add relevant users to housekeeping channel  
INSERT INTO public.channel_members (channel_id, user_id, role)
SELECT '00000000-0000-0000-0000-000000000003', user_id, 'member'
FROM public.profiles
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000006'
)
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Create some sample properties if none exist
INSERT INTO public.properties (id, name, address, property_type, num_bedrooms, num_bathrooms, status, description)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Villa Caldera', 'Santorini, Greece', 'villa', 3, 2, 'active', 'Luxury villa with stunning caldera views'),
  ('00000000-0000-0000-0000-000000000002', 'Villa Azure', 'Mykonos, Greece', 'villa', 4, 3, 'active', 'Modern villa with private pool and sea views'),
  ('00000000-0000-0000-0000-000000000003', 'Villa Sunset', 'Crete, Greece', 'villa', 2, 1, 'active', 'Intimate villa perfect for romantic getaways')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  property_type = EXCLUDED.property_type,
  updated_at = now();

-- Create sample inventory categories
INSERT INTO public.inventory_categories (id, name, description)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Linens', 'Towels, bed sheets, pillowcases'),
  ('00000000-0000-0000-0000-000000000002', 'Toiletries', 'Bathroom supplies and amenities'),
  ('00000000-0000-0000-0000-000000000003', 'Cleaning Supplies', 'Cleaning products and equipment'),
  ('00000000-0000-0000-0000-000000000004', 'Maintenance', 'Tools and maintenance supplies')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Create sample inventory items
INSERT INTO public.inventory_items (name, sku, category_id, quantity, min_quantity, target_quantity, unit_cost, unit, vendor, location, notes)
VALUES 
  ('Bath Towels', 'TOW-001', '00000000-0000-0000-0000-000000000001', 25, 15, 30, 18.50, 'Each', 'Villa Supplies Co', 'Main Storage', 'White cotton towels'),
  ('Toilet Paper', 'TOI-001', '00000000-0000-0000-0000-000000000002', 8, 12, 20, 2.25, 'Roll', 'Bulk Supplies Ltd', 'Main Storage', 'Double ply'),
  ('Pool Chemicals', 'POOL-001', '00000000-0000-0000-0000-000000000004', 5, 8, 15, 45.00, 'Container', 'Pool Pro Services', 'Pool Storage', 'Chlorine tablets'),
  ('Bed Sheets', 'BED-001', '00000000-0000-0000-0000-000000000001', 20, 10, 25, 35.00, 'Set', 'Villa Supplies Co', 'Main Storage', 'King size white sheets')
ON CONFLICT (sku) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  min_quantity = EXCLUDED.min_quantity,
  updated_at = now();

-- Enable realtime for critical tables
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.direct_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.housekeeping_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.maintenance_tasks REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.housekeeping_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_tasks;