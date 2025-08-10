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

-- Create vendor_items junction table to link vendors with inventory items
CREATE TABLE IF NOT EXISTS vendor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  unit_price DECIMAL(10,2),
  minimum_order_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id, item_id)
);

-- Enable RLS on vendor_items
ALTER TABLE vendor_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor_items
CREATE POLICY "Staff can view vendor items" ON vendor_items FOR SELECT 
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager', 'inventory_manager']));

CREATE POLICY "Managers can manage vendor items" ON vendor_items FOR ALL 
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'inventory_manager']));

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_items_updated_at
  BEFORE UPDATE ON vendor_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample vendor-item relationships
INSERT INTO vendor_items (vendor_id, item_id, unit_price, minimum_order_quantity, lead_time_days)
SELECT 
  v.id as vendor_id,
  i.id as item_id,
  ROUND((RANDOM() * 50 + 5)::numeric, 2) as unit_price,
  CASE WHEN RANDOM() > 0.5 THEN 1 ELSE 5 END as minimum_order_quantity,
  ROUND(RANDOM() * 14 + 3) as lead_time_days
FROM vendors v
CROSS JOIN inventory_items i
WHERE EXISTS (
  SELECT 1 FROM inventory_categories ic 
  WHERE ic.id = i.category_id 
  AND ic.id = ANY(v.categories)
)
ON CONFLICT (vendor_id, item_id) DO NOTHING;