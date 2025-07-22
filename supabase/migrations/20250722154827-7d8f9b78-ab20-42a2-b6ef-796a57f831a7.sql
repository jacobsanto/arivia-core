-- Insert the 3 standard global cleaning rule templates if they don't already exist

-- SHORT STAY (1-3 nights)
INSERT INTO cleaning_rules (
  rule_name,
  stay_length_range,
  actions_by_day,
  is_global,
  assignable_properties,
  is_active,
  config_id,
  min_nights,
  max_nights,
  rule_description
) 
SELECT 
  'SHORT STAY',
  ARRAY[1, 3],
  jsonb_build_object(
    '1', ARRAY['check_in_preparation', 'standard_cleaning']
  ),
  true,
  '{}',
  true,
  gen_random_uuid(),
  1,
  3,
  'Standard cleaning rule for short stays (1-3 nights)'
WHERE NOT EXISTS (
  SELECT 1 FROM cleaning_rules 
  WHERE rule_name = 'SHORT STAY' AND is_global = true
);

-- MEDIUM STAY (4-7 nights)
INSERT INTO cleaning_rules (
  rule_name,
  stay_length_range,
  actions_by_day,
  is_global,
  assignable_properties,
  is_active,
  config_id,
  min_nights,
  max_nights,
  rule_description
) 
SELECT 
  'MEDIUM STAY',
  ARRAY[4, 7],
  jsonb_build_object(
    '1', ARRAY['check_in_preparation', 'standard_cleaning'],
    '3', ARRAY['mid_stay_maintenance', 'linen_change'],
    '5', ARRAY['deep_cleaning', 'inventory_check']
  ),
  true,
  '{}',
  true,
  gen_random_uuid(),
  4,
  7,
  'Enhanced cleaning rule for medium stays (4-7 nights)'
WHERE NOT EXISTS (
  SELECT 1 FROM cleaning_rules 
  WHERE rule_name = 'MEDIUM STAY' AND is_global = true
);

-- EXTENDED STAY (8+ nights)
INSERT INTO cleaning_rules (
  rule_name,
  stay_length_range,
  actions_by_day,
  is_global,
  assignable_properties,
  is_active,
  config_id,
  min_nights,
  max_nights,
  rule_description
) 
SELECT 
  'EXTENDED STAY',
  ARRAY[8, 999],
  jsonb_build_object(
    '1', ARRAY['check_in_preparation', 'standard_cleaning'],
    '3', ARRAY['mid_stay_maintenance', 'linen_change'],
    '5', ARRAY['deep_cleaning', 'inventory_check'],
    '7', ARRAY['full_maintenance', 'guest_coordination']
  ),
  true,
  '{}',
  true,
  gen_random_uuid(),
  8,
  999,
  'Comprehensive cleaning rule for extended stays (8+ nights)'
WHERE NOT EXISTS (
  SELECT 1 FROM cleaning_rules 
  WHERE rule_name = 'EXTENDED STAY' AND is_global = true
);

-- Remove any duplicate or similar global rules that aren't the 3 standard ones
UPDATE cleaning_rules 
SET is_active = false 
WHERE is_global = true 
  AND rule_name NOT IN ('SHORT STAY', 'MEDIUM STAY', 'EXTENDED STAY');