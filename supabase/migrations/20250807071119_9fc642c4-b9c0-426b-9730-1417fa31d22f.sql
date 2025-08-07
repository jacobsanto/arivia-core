-- Add unique constraint on vendor name first
ALTER TABLE vendors ADD CONSTRAINT vendors_name_unique UNIQUE (name);

-- Insert initial vendor data for production using category IDs
WITH category_mapping AS (
  SELECT 
    'Office Supplies Co.' as vendor_name,
    ARRAY(SELECT id FROM inventory_categories WHERE name IN ('Kitchen Supplies', 'Linens & Towels')) as category_ids
  UNION ALL
  SELECT 
    'Cleaning Solutions Inc.' as vendor_name,
    ARRAY(SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies') as category_ids
  UNION ALL
  SELECT 
    'Hospitality Essentials' as vendor_name,
    ARRAY(SELECT id FROM inventory_categories WHERE name IN ('Amenities', 'Linens & Towels')) as category_ids
  UNION ALL
  SELECT 
    'Kitchen Pro Supplies' as vendor_name,
    ARRAY(SELECT id FROM inventory_categories WHERE name = 'Kitchen Supplies') as category_ids
  UNION ALL
  SELECT 
    'Maintenance Solutions' as vendor_name,
    ARRAY(SELECT id FROM inventory_categories WHERE name = 'Maintenance Tools') as category_ids
)
INSERT INTO vendors (name, contact_person, email, phone, categories) 
SELECT 
  cm.vendor_name,
  CASE cm.vendor_name
    WHEN 'Office Supplies Co.' THEN 'John Smith'
    WHEN 'Cleaning Solutions Inc.' THEN 'Maria Garcia'
    WHEN 'Hospitality Essentials' THEN 'David Chen'
    WHEN 'Kitchen Pro Supplies' THEN 'Sarah Johnson'
    WHEN 'Maintenance Solutions' THEN 'Mike Wilson'
  END as contact_person,
  CASE cm.vendor_name
    WHEN 'Office Supplies Co.' THEN 'john@officesupplies.com'
    WHEN 'Cleaning Solutions Inc.' THEN 'maria@cleaningsolutions.com'
    WHEN 'Hospitality Essentials' THEN 'david@hospitalityessentials.com'
    WHEN 'Kitchen Pro Supplies' THEN 'sarah@kitchenpro.com'
    WHEN 'Maintenance Solutions' THEN 'mike@maintenancesolutions.com'
  END as email,
  CASE cm.vendor_name
    WHEN 'Office Supplies Co.' THEN '+1-555-0101'
    WHEN 'Cleaning Solutions Inc.' THEN '+1-555-0102'
    WHEN 'Hospitality Essentials' THEN '+1-555-0103'
    WHEN 'Kitchen Pro Supplies' THEN '+1-555-0104'
    WHEN 'Maintenance Solutions' THEN '+1-555-0105'
  END as phone,
  cm.category_ids
FROM category_mapping cm
ON CONFLICT (name) DO NOTHING;