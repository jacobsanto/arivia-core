-- Fix critical issues to enable task generation

-- 1. Fix booking status synchronization - update all null status bookings to 'confirmed'
UPDATE guesty_bookings 
SET status = 'confirmed' 
WHERE status IS NULL OR status = '';

-- 2. Fix cleaning rules stay_length_range values
UPDATE cleaning_rules 
SET stay_length_range = ARRAY[1, 3]
WHERE rule_name ILIKE '%short%' OR min_nights <= 3;

UPDATE cleaning_rules 
SET stay_length_range = ARRAY[4, 7]  
WHERE rule_name ILIKE '%medium%' OR (min_nights >= 4 AND max_nights <= 7);

UPDATE cleaning_rules 
SET stay_length_range = ARRAY[8, 999]
WHERE rule_name ILIKE '%extended%' OR min_nights >= 8;

-- 3. Create missing cleaning_schedules for existing cleaning rules
-- Get cleaning rule IDs first and create appropriate schedules

-- For Short Stay rules (1-3 nights) - Pre-arrival and post-departure cleaning
INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'pre_arrival',
  -1,
  'Standard Cleaning',
  'Pre-arrival standard cleaning and preparation',
  'high',
  120,
  false
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[1, 3]
ON CONFLICT DO NOTHING;

INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'post_departure',
  0,
  'Standard Cleaning',
  'Post-departure standard cleaning',
  'high',
  90,
  false
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[1, 3]
ON CONFLICT DO NOTHING;

-- For Medium Stay rules (4-7 nights) - Pre-arrival, mid-stay, and post-departure
INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'pre_arrival',
  -1,
  'Standard Cleaning',
  'Pre-arrival standard cleaning and preparation',
  'high',
  120,
  false
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[4, 7]
ON CONFLICT DO NOTHING;

INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'during_stay',
  3,
  'Full Cleaning',
  'Mid-stay full cleaning service',
  'normal',
  180,
  true
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[4, 7]
ON CONFLICT DO NOTHING;

INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'post_departure',
  0,
  'Standard Cleaning',
  'Post-departure standard cleaning',
  'high',
  90,
  false
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[4, 7]
ON CONFLICT DO NOTHING;

-- For Extended Stay rules (8+ nights) - Pre-arrival, multiple mid-stays, and post-departure
INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'pre_arrival',
  -1,
  'Standard Cleaning',
  'Pre-arrival standard cleaning and preparation',
  'high',
  120,
  false
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[8, 999]
ON CONFLICT DO NOTHING;

INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'during_stay',
  3,
  'Full Cleaning',
  'First mid-stay full cleaning service',
  'normal',
  180,
  true
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[8, 999]
ON CONFLICT DO NOTHING;

INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'during_stay',
  7,
  'Linen & Towel Change',
  'Weekly linen and towel refresh',
  'normal',
  60,
  true
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[8, 999]
ON CONFLICT DO NOTHING;

INSERT INTO cleaning_schedules (rule_id, timing_type, offset_days, task_type, schedule_description, priority, estimated_duration, requires_guest_coordination)
SELECT 
  id,
  'post_departure',
  0,
  'Standard Cleaning',
  'Post-departure standard cleaning',
  'high',
  90,
  false
FROM cleaning_rules 
WHERE stay_length_range = ARRAY[8, 999]
ON CONFLICT DO NOTHING;

-- 4. Trigger task generation for existing confirmed bookings
-- This will use the new configuration to generate tasks for existing bookings
DO $$
DECLARE
  booking_record RECORD;
BEGIN
  FOR booking_record IN 
    SELECT * FROM guesty_bookings 
    WHERE status = 'confirmed' 
    AND check_out >= CURRENT_DATE
  LOOP
    PERFORM generate_cleaning_tasks_from_config(booking_record);
  END LOOP;
END $$;