-- Insert initial vendor data for production
INSERT INTO vendors (name, contact_person, email, phone, categories) VALUES 
  ('Office Supplies Co.', 'John Smith', 'john@officesupplies.com', '+1-555-0101', ARRAY['Office Supplies', 'Paper Products', 'Kitchen Supplies', 'Linens & Towels']),
  ('Cleaning Solutions Inc.', 'Maria Garcia', 'maria@cleaningsolutions.com', '+1-555-0102', ARRAY['Cleaning Supplies']),
  ('Hospitality Essentials', 'David Chen', 'david@hospitalityessentials.com', '+1-555-0103', ARRAY['Amenities', 'Linens & Towels']),
  ('Kitchen Pro Supplies', 'Sarah Johnson', 'sarah@kitchenpro.com', '+1-555-0104', ARRAY['Kitchen Supplies']),
  ('Maintenance Solutions', 'Mike Wilson', 'mike@maintenancesolutions.com', '+1-555-0105', ARRAY['Maintenance Tools'])
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
  AND ic.name = ANY(v.categories)
)
ON CONFLICT (vendor_id, item_id) DO NOTHING;