-- First create a default global config for template rules
INSERT INTO property_cleaning_configs (
  id,
  listing_id,
  config_name,
  is_active
) 
SELECT 
  gen_random_uuid(),
  'GLOBAL_TEMPLATE',
  'Global Rule Templates',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM property_cleaning_configs 
  WHERE listing_id = 'GLOBAL_TEMPLATE'
);

-- Now insert the 3 standard global cleaning rule templates
WITH global_config AS (
  SELECT id FROM property_cleaning_configs WHERE listing_id = 'GLOBAL_TEMPLATE' LIMIT 1
)
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
  global_config.id,
  1,
  3,
  'Standard cleaning rule for short stays (1-3 nights)'
FROM global_config
WHERE NOT EXISTS (
  SELECT 1 FROM cleaning_rules 
  WHERE rule_name = 'SHORT STAY' AND is_global = true
);

WITH global_config AS (
  SELECT id FROM property_cleaning_configs WHERE listing_id = 'GLOBAL_TEMPLATE' LIMIT 1
)
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
  global_config.id,
  4,
  7,
  'Enhanced cleaning rule for medium stays (4-7 nights)'
FROM global_config
WHERE NOT EXISTS (
  SELECT 1 FROM cleaning_rules 
  WHERE rule_name = 'MEDIUM STAY' AND is_global = true
);

WITH global_config AS (
  SELECT id FROM property_cleaning_configs WHERE listing_id = 'GLOBAL_TEMPLATE' LIMIT 1
)
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
  global_config.id,
  8,
  999,
  'Comprehensive cleaning rule for extended stays (8+ nights)'
FROM global_config
WHERE NOT EXISTS (
  SELECT 1 FROM cleaning_rules 
  WHERE rule_name = 'EXTENDED STAY' AND is_global = true
);

-- Remove any duplicate or similar global rules that aren't the 3 standard ones
UPDATE cleaning_rules 
SET is_active = false 
WHERE is_global = true 
  AND rule_name NOT IN ('SHORT STAY', 'MEDIUM STAY', 'EXTENDED STAY');