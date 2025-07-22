
-- First, let's redesign the cleaning_rules table to be simpler and more focused
DROP TABLE IF EXISTS rule_conditions CASCADE;
DROP TABLE IF EXISTS rule_actions CASCADE;
DROP TABLE IF EXISTS cleaning_schedules CASCADE;

-- Redesign cleaning_rules table with the new simplified structure
ALTER TABLE cleaning_rules 
DROP COLUMN IF EXISTS rule_description,
DROP COLUMN IF EXISTS min_nights,
DROP COLUMN IF EXISTS max_nights,
DROP COLUMN IF EXISTS config_id,
DROP COLUMN IF EXISTS rule_version,
DROP COLUMN IF EXISTS is_template,
DROP COLUMN IF EXISTS template_id;

-- Add new columns for the rule-based system
ALTER TABLE cleaning_rules 
ADD COLUMN stay_length_range integer[] DEFAULT ARRAY[1, 999],
ADD COLUMN actions_by_day jsonb DEFAULT '{}',
ADD COLUMN is_global boolean DEFAULT true,
ADD COLUMN assignable_properties text[] DEFAULT '{}';

-- Create rule_assignments table for many-to-many relationship between rules and properties
CREATE TABLE IF NOT EXISTS rule_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id uuid REFERENCES cleaning_rules(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  UNIQUE(rule_id, property_id)
);

-- Modify housekeeping_tasks to support the new system
ALTER TABLE housekeeping_tasks
ADD COLUMN IF NOT EXISTS default_actions jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS additional_actions jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS source_rule_id uuid REFERENCES cleaning_rules(id),
ADD COLUMN IF NOT EXISTS task_day_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]';

-- Create cleaning_actions catalog table
CREATE TABLE IF NOT EXISTS cleaning_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  estimated_duration integer DEFAULT 60, -- minutes
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert predefined cleaning actions
INSERT INTO cleaning_actions (action_name, display_name, description, estimated_duration, category) VALUES
('standard_cleaning', 'Standard Cleaning', 'Basic cleaning routine including dusting, vacuuming, and bathroom cleaning', 90, 'cleaning'),
('full_cleaning', 'Full Cleaning', 'Comprehensive deep cleaning of all areas', 180, 'cleaning'),
('deep_cleaning', 'Deep Cleaning', 'Intensive cleaning with special attention to detail', 240, 'cleaning'),
('change_sheets', 'Change Bed Sheets', 'Replace all bed linens with fresh ones', 30, 'linen'),
('towel_refresh', 'Towel Refresh', 'Replace all towels with clean ones', 20, 'linen'),
('linen_change', 'Complete Linen Change', 'Replace all bed sheets, pillowcases, and towels', 45, 'linen'),
('kitchen_deep_clean', 'Kitchen Deep Clean', 'Thorough cleaning of kitchen appliances and surfaces', 60, 'kitchen'),
('bathroom_deep_clean', 'Bathroom Deep Clean', 'Intensive bathroom cleaning including tiles and fixtures', 45, 'bathroom'),
('balcony_cleaning', 'Balcony/Terrace Cleaning', 'Clean outdoor spaces including furniture', 30, 'outdoor'),
('pool_maintenance', 'Pool Area Maintenance', 'Clean and maintain pool area', 45, 'outdoor'),
('appliance_check', 'Appliance Check', 'Inspect and clean all appliances', 30, 'maintenance'),
('inventory_restock', 'Inventory Restock', 'Check and replenish supplies', 20, 'supplies');

-- Add RLS policies for new tables
ALTER TABLE rule_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for rule_assignments
CREATE POLICY "Admins can manage rule assignments" ON rule_assignments
  FOR ALL USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view rule assignments" ON rule_assignments
  FOR SELECT USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS policies for cleaning_actions
CREATE POLICY "Admins can manage cleaning actions" ON cleaning_actions
  FOR ALL USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view cleaning actions" ON cleaning_actions
  FOR SELECT USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- Update the housekeeping task generation function
CREATE OR REPLACE FUNCTION generate_rule_based_cleaning_tasks(booking_record guesty_bookings)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE 
  stay_duration INTEGER;
  applicable_rule RECORD;
  day_number INTEGER;
  day_actions jsonb;
  current_date DATE;
BEGIN
  -- Only proceed if booking status is confirmed
  IF booking_record.status != 'confirmed' THEN
    RETURN;
  END IF;

  -- Calculate stay duration in days
  stay_duration := DATE(booking_record.check_out) - DATE(booking_record.check_in);
  
  -- Find applicable rule for this property and stay duration
  SELECT cr.* INTO applicable_rule
  FROM cleaning_rules cr
  JOIN rule_assignments ra ON cr.id = ra.rule_id
  WHERE ra.property_id = booking_record.listing_id
    AND ra.is_active = true
    AND cr.is_active = true
    AND stay_duration >= (cr.stay_length_range)[1]
    AND stay_duration <= (cr.stay_length_range)[2]
  ORDER BY (cr.stay_length_range)[2] - (cr.stay_length_range)[1] ASC -- Most specific range first
  LIMIT 1;
  
  -- If no specific rule found, try global rules
  IF NOT FOUND THEN
    SELECT cr.* INTO applicable_rule
    FROM cleaning_rules cr
    WHERE cr.is_global = true
      AND cr.is_active = true
      AND stay_duration >= (cr.stay_length_range)[1]
      AND stay_duration <= (cr.stay_length_range)[2]
    ORDER BY (cr.stay_length_range)[2] - (cr.stay_length_range)[1] ASC
    LIMIT 1;
  END IF;
  
  -- If we found an applicable rule, generate tasks
  IF FOUND THEN
    -- Generate tasks for each day based on the rule's actions_by_day
    FOR day_number IN 1..stay_duration LOOP
      current_date := booking_record.check_in + (day_number - 1);
      day_actions := applicable_rule.actions_by_day->day_number::text;
      
      -- Only create task if there are actions defined for this day
      IF day_actions IS NOT NULL AND jsonb_array_length(day_actions) > 0 THEN
        -- Check if task already exists to avoid duplicates
        IF NOT EXISTS (
          SELECT 1 FROM housekeeping_tasks 
          WHERE booking_id = booking_record.id 
            AND due_date = current_date
            AND task_day_number = day_number
        ) THEN
          INSERT INTO housekeeping_tasks (
            listing_id,
            booking_id,
            due_date,
            task_type,
            description,
            status,
            default_actions,
            additional_actions,
            source_rule_id,
            task_day_number
          ) VALUES (
            booking_record.listing_id,
            booking_record.id,
            current_date,
            'Rule-Based Cleaning',
            'Day ' || day_number || ' of ' || stay_duration || '-night stay - Generated by rule: ' || applicable_rule.rule_name,
            'pending',
            day_actions,
            '[]'::jsonb,
            applicable_rule.id,
            day_number
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
END;
$$;

-- Create trigger to use the new function
DROP TRIGGER IF EXISTS trigger_generate_cleaning_tasks ON guesty_bookings;
CREATE TRIGGER trigger_generate_rule_based_cleaning_tasks
  AFTER INSERT OR UPDATE ON guesty_bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_rule_based_cleaning_tasks(NEW);
