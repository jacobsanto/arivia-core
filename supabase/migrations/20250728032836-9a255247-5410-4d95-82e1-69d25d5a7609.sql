-- Fix existing rules with default actions and ensure proper assignments

-- First, let's update the empty actions_by_day with proper default actions for existing rules
UPDATE cleaning_rules 
SET actions_by_day = CASE 
  WHEN rule_name LIKE '%Short%' THEN 
    '{"1": ["standard_cleaning", "change_sheets"]}'::jsonb
  WHEN rule_name LIKE '%Medium%' THEN 
    '{"1": ["standard_cleaning", "change_sheets"], "3": ["towel_refresh"], "7": ["full_cleaning"]}'::jsonb
  WHEN rule_name LIKE '%Extended%' THEN 
    '{"1": ["standard_cleaning", "change_sheets"], "3": ["towel_refresh"], "7": ["full_cleaning", "deep_cleaning"]}'::jsonb
  ELSE 
    '{"1": ["standard_cleaning"]}'::jsonb
END
WHERE actions_by_day = '{}'::jsonb OR actions_by_day IS NULL;

-- Create missing rule assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS rule_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES cleaning_rules(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rule_assignments
ALTER TABLE rule_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rule_assignments
CREATE POLICY "Admins can manage rule assignments" ON rule_assignments
FOR ALL USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view rule assignments" ON rule_assignments
FOR SELECT USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- Ensure all global rules are assigned to all properties
WITH global_rules AS (
  SELECT id FROM cleaning_rules WHERE is_global = true AND is_active = true
),
all_properties AS (
  SELECT id FROM guesty_listings WHERE is_deleted = false
)
INSERT INTO rule_assignments (rule_id, property_id, assigned_by)
SELECT gr.id, ap.id, NULL
FROM global_rules gr
CROSS JOIN all_properties ap
WHERE NOT EXISTS (
  SELECT 1 FROM rule_assignments ra 
  WHERE ra.rule_id = gr.id AND ra.property_id = ap.id
);

-- Add updated_at trigger for rule_assignments
CREATE TRIGGER update_rule_assignments_updated_at
  BEFORE UPDATE ON rule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Populate missing actions if the table is empty
INSERT INTO cleaning_actions (action_name, display_name, description, category, estimated_duration, is_active)
SELECT * FROM (VALUES
  ('standard_cleaning', 'Standard Cleaning', 'Basic cleaning including vacuum, dust, and bathroom cleaning', 'cleaning', 90, true),
  ('full_cleaning', 'Full Cleaning', 'Comprehensive cleaning including deep cleaning of all areas', 'cleaning', 180, true),
  ('deep_cleaning', 'Deep Cleaning', 'Intensive cleaning for extended stays and special requirements', 'cleaning', 240, true),
  ('change_sheets', 'Change Bed Sheets', 'Replace all bed linens with fresh sheets', 'linen', 30, true),
  ('towel_refresh', 'Towel Refresh', 'Replace all towels with fresh ones', 'linen', 20, true),
  ('bathroom_deep_clean', 'Bathroom Deep Clean', 'Thorough cleaning and sanitization of all bathroom fixtures', 'cleaning', 45, true),
  ('kitchen_deep_clean', 'Kitchen Deep Clean', 'Complete kitchen cleaning including appliances and surfaces', 'cleaning', 60, true),
  ('window_cleaning', 'Window Cleaning', 'Clean all windows inside and outside where accessible', 'cleaning', 30, true),
  ('inventory_check', 'Inventory Check', 'Check and restock amenities and supplies', 'inspection', 15, true),
  ('damage_inspection', 'Damage Inspection', 'Inspect property for any damage or maintenance needs', 'inspection', 20, true)
) AS new_actions(action_name, display_name, description, category, estimated_duration, is_active)
WHERE NOT EXISTS (SELECT 1 FROM cleaning_actions WHERE cleaning_actions.action_name = new_actions.action_name);