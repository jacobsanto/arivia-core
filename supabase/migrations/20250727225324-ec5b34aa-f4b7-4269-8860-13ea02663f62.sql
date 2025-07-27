-- Seed checklist templates with the data from the frontend
INSERT INTO checklist_templates (id, title, description, task_type, items, created_by, is_active) VALUES 
(
  gen_random_uuid(),
  'Villa Standard Cleaning',
  'Comprehensive cleaning checklist for villa properties',
  'Housekeeping',
  '[
    {"id": 1, "title": "Strip and remake all beds with fresh linens", "completed": false},
    {"id": 2, "title": "Vacuum and mop all floors", "completed": false},
    {"id": 3, "title": "Clean and disinfect all bathrooms", "completed": false},
    {"id": 4, "title": "Clean kitchen and appliances", "completed": false},
    {"id": 5, "title": "Dust all surfaces and furniture", "completed": false},
    {"id": 6, "title": "Empty all trash bins", "completed": false},
    {"id": 7, "title": "Check and restock amenities", "completed": false},
    {"id": 8, "title": "Clean windows and mirrors", "completed": false}
  ]'::jsonb,
  (SELECT id FROM profiles WHERE role = 'superadmin' LIMIT 1),
  true
),
(
  gen_random_uuid(),
  'Pool Maintenance',
  'Weekly pool maintenance and cleaning procedures',
  'Maintenance',
  '[
    {"id": 1, "title": "Test and balance water chemistry", "completed": false},
    {"id": 2, "title": "Skim surface debris", "completed": false},
    {"id": 3, "title": "Vacuum pool floor", "completed": false},
    {"id": 4, "title": "Clean pool filters", "completed": false},
    {"id": 5, "title": "Check pool equipment functionality", "completed": false},
    {"id": 6, "title": "Clean pool deck area", "completed": false}
  ]'::jsonb,
  (SELECT id FROM profiles WHERE role = 'superadmin' LIMIT 1),
  true
),
(
  gen_random_uuid(),
  'Welcome Package Setup',
  'Checklist for preparing welcome amenities for guests',
  'Welcome',
  '[
    {"id": 1, "title": "Stock welcome basket with local treats", "completed": false},
    {"id": 2, "title": "Place welcome note and property guide", "completed": false},
    {"id": 3, "title": "Ensure Wi-Fi credentials are displayed", "completed": false},
    {"id": 4, "title": "Check emergency contact information", "completed": false},
    {"id": 5, "title": "Verify all appliances are working", "completed": false},
    {"id": 6, "title": "Set optimal room temperature", "completed": false}
  ]'::jsonb,
  (SELECT id FROM profiles WHERE role = 'superadmin' LIMIT 1),
  true
);

-- Insert inventory categories
INSERT INTO inventory_categories (id, name, description) VALUES 
(gen_random_uuid(), 'Cleaning Supplies', 'General cleaning and maintenance supplies'),
(gen_random_uuid(), 'Linens & Towels', 'Bedding, towels, and fabric items'),
(gen_random_uuid(), 'Amenities', 'Guest amenities and welcome items'),
(gen_random_uuid(), 'Kitchen Supplies', 'Kitchen and dining essentials'),
(gen_random_uuid(), 'Maintenance Tools', 'Tools and equipment for property maintenance')
ON CONFLICT (name) DO NOTHING;

-- Insert sample inventory items
WITH categories AS (
  SELECT id, name FROM inventory_categories
)
INSERT INTO inventory_items (name, description, category_id, unit, min_quantity, item_code) 
SELECT * FROM (VALUES 
  ('All-Purpose Cleaner', 'Multi-surface cleaning solution', (SELECT id FROM categories WHERE name = 'Cleaning Supplies'), 'bottles', 5, 'APC001'),
  ('Toilet Paper', 'Premium toilet tissue rolls', (SELECT id FROM categories WHERE name = 'Cleaning Supplies'), 'rolls', 20, 'TP001'),
  ('Bath Towels', 'Luxury cotton bath towels', (SELECT id FROM categories WHERE name = 'Linens & Towels'), 'pieces', 15, 'BT001'),
  ('Bed Sheets', 'High-quality cotton bed sheets', (SELECT id FROM categories WHERE name = 'Linens & Towels'), 'sets', 10, 'BS001'),
  ('Welcome Cookies', 'Local artisan cookies for guests', (SELECT id FROM categories WHERE name = 'Amenities'), 'packages', 8, 'WC001'),
  ('Coffee Capsules', 'Premium coffee pods', (SELECT id FROM categories WHERE name = 'Kitchen Supplies'), 'boxes', 12, 'CC001'),
  ('Vacuum Bags', 'Replacement bags for vacuum cleaners', (SELECT id FROM categories WHERE name = 'Maintenance Tools'), 'packages', 3, 'VB001')
) AS v(name, description, category_id, unit, min_quantity, item_code)
ON CONFLICT (name) DO NOTHING;