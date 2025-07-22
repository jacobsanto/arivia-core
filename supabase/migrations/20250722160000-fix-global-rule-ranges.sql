
-- Fix the stay_length_range values for the 3 global cleaning rule templates

-- Update SHORT STAY to have correct range [1, 3]
UPDATE cleaning_rules 
SET 
  stay_length_range = ARRAY[1, 3],
  min_nights = 1,
  max_nights = 3
WHERE rule_name = 'SHORT STAY' AND is_global = true;

-- Update MEDIUM STAY to have correct range [4, 7]  
UPDATE cleaning_rules 
SET 
  stay_length_range = ARRAY[4, 7],
  min_nights = 4,
  max_nights = 7
WHERE rule_name = 'MEDIUM STAY' AND is_global = true;

-- Update EXTENDED STAY to have correct range [8, 999]
UPDATE cleaning_rules 
SET 
  stay_length_range = ARRAY[8, 999],
  min_nights = 8,
  max_nights = 999
WHERE rule_name = 'EXTENDED STAY' AND is_global = true;
