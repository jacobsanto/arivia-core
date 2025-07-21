
-- Remove all financial-related tables and data
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS occupancy_reports CASCADE;

-- Remove financial triggers and functions
DROP FUNCTION IF EXISTS public.handle_booking_financials() CASCADE;

-- Create property-specific cleaning configurations
CREATE TABLE public.property_cleaning_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES guesty_listings(id) ON DELETE CASCADE,
  config_name TEXT NOT NULL DEFAULT 'Default Cleaning Config',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(listing_id, config_name)
);

-- Create cleaning rules for different stay durations
CREATE TABLE public.cleaning_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES property_cleaning_configs(id) ON DELETE CASCADE,
  min_nights INTEGER NOT NULL DEFAULT 1,
  max_nights INTEGER NOT NULL DEFAULT 999,
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cleaning schedules within rules
CREATE TABLE public.cleaning_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES cleaning_rules(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  timing_type TEXT NOT NULL CHECK (timing_type IN ('pre_arrival', 'during_stay', 'post_departure', 'custom_offset')),
  offset_days INTEGER DEFAULT 0,
  schedule_description TEXT,
  requires_guest_coordination BOOLEAN DEFAULT false,
  estimated_duration INTEGER DEFAULT 60, -- minutes
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE property_cleaning_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cleaning configurations
CREATE POLICY "Admins can manage property cleaning configs" 
  ON property_cleaning_configs FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view property cleaning configs" 
  ON property_cleaning_configs FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS Policies for cleaning rules
CREATE POLICY "Admins can manage cleaning rules" 
  ON cleaning_rules FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view cleaning rules" 
  ON cleaning_rules FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS Policies for cleaning schedules
CREATE POLICY "Admins can manage cleaning schedules" 
  ON cleaning_schedules FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view cleaning schedules" 
  ON cleaning_schedules FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- Insert default cleaning configurations for existing properties
INSERT INTO property_cleaning_configs (listing_id, config_name, created_by)
SELECT id, 'Default Configuration', NULL
FROM guesty_listings
WHERE NOT EXISTS (
  SELECT 1 FROM property_cleaning_configs WHERE listing_id = guesty_listings.id
);

-- Insert default cleaning rules
WITH config_ids AS (
  SELECT id as config_id FROM property_cleaning_configs
)
INSERT INTO cleaning_rules (config_id, min_nights, max_nights, rule_name, rule_description)
SELECT 
  config_id,
  1, 3,
  'Short Stay (1-3 nights)',
  'Basic cleaning for short stays'
FROM config_ids
UNION ALL
SELECT 
  config_id,
  4, 7,
  'Medium Stay (4-7 nights)',
  'Enhanced cleaning with mid-stay service'
FROM config_ids
UNION ALL
SELECT 
  config_id,
  8, 999,
  'Extended Stay (8+ nights)',
  'Comprehensive cleaning with multiple services'
FROM config_ids;

-- Insert default cleaning schedules
WITH rule_data AS (
  SELECT 
    r.id as rule_id,
    r.rule_name,
    r.min_nights,
    r.max_nights
  FROM cleaning_rules r
)
INSERT INTO cleaning_schedules (rule_id, task_type, timing_type, offset_days, schedule_description, requires_guest_coordination)
SELECT 
  rule_id,
  'Standard Cleaning',
  'pre_arrival',
  -1,
  'Pre-arrival cleaning and preparation',
  false
FROM rule_data
UNION ALL
SELECT 
  rule_id,
  'Standard Cleaning',
  'post_departure',
  0,
  'Post-departure cleaning and reset',
  false
FROM rule_data
UNION ALL
-- Add mid-stay cleaning for medium stays
SELECT 
  rule_id,
  'Full Cleaning',
  'during_stay',
  3,
  'Mid-stay full cleaning service',
  true
FROM rule_data
WHERE min_nights = 4 AND max_nights = 7
UNION ALL
-- Add linen change for medium stays
SELECT 
  rule_id,
  'Linen & Towel Change',
  'during_stay',
  5,
  'Fresh linen and towel replacement',
  true
FROM rule_data
WHERE min_nights = 4 AND max_nights = 7
UNION ALL
-- Add multiple services for extended stays
SELECT 
  rule_id,
  'Full Cleaning',
  'during_stay',
  3,
  'First mid-stay cleaning',
  true
FROM rule_data
WHERE min_nights = 8
UNION ALL
SELECT 
  rule_id,
  'Linen & Towel Change',
  'during_stay',
  6,
  'Mid-stay linen refresh',
  true
FROM rule_data
WHERE min_nights = 8
UNION ALL
SELECT 
  rule_id,
  'Full Cleaning',
  'during_stay',
  10,
  'Second mid-stay cleaning',
  true
FROM rule_data
WHERE min_nights = 8;

-- Create improved housekeeping task generation function
CREATE OR REPLACE FUNCTION public.generate_cleaning_tasks_from_config(booking_record guesty_bookings)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE 
  stay_duration INTEGER;
  config_record RECORD;
  rule_record RECORD;
  schedule_record RECORD;
  task_date DATE;
BEGIN
  -- Only proceed if booking status is confirmed
  IF booking_record.status != 'confirmed' THEN
    RETURN;
  END IF;

  -- Calculate stay duration in days
  stay_duration := DATE(booking_record.check_out) - DATE(booking_record.check_in);
  
  -- Get the active cleaning configuration for this property
  SELECT * INTO config_record
  FROM property_cleaning_configs 
  WHERE listing_id = booking_record.listing_id 
    AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- No configuration found, skip task generation
    RETURN;
  END IF;
  
  -- Find the appropriate cleaning rule for this stay duration
  SELECT * INTO rule_record
  FROM cleaning_rules
  WHERE config_id = config_record.id
    AND is_active = true
    AND stay_duration >= min_nights 
    AND stay_duration <= max_nights
  ORDER BY min_nights DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- No rule found, skip task generation
    RETURN;
  END IF;
  
  -- Generate tasks based on the cleaning schedules for this rule
  FOR schedule_record IN 
    SELECT * FROM cleaning_schedules 
    WHERE rule_id = rule_record.id 
      AND is_active = true
    ORDER BY timing_type, offset_days
  LOOP
    -- Calculate task date based on timing type
    CASE schedule_record.timing_type
      WHEN 'pre_arrival' THEN
        task_date := booking_record.check_in + schedule_record.offset_days;
      WHEN 'post_departure' THEN
        task_date := booking_record.check_out + schedule_record.offset_days;
      WHEN 'during_stay' THEN
        task_date := booking_record.check_in + schedule_record.offset_days;
      WHEN 'custom_offset' THEN
        task_date := booking_record.check_in + schedule_record.offset_days;
      ELSE
        task_date := booking_record.check_out; -- fallback
    END CASE;
    
    -- Insert the housekeeping task if it doesn't already exist
    INSERT INTO housekeeping_tasks (
      listing_id,
      booking_id,
      due_date,
      task_type,
      description,
      status
    ) 
    SELECT 
      booking_record.listing_id,
      booking_record.id,
      task_date,
      schedule_record.task_type,
      schedule_record.schedule_description || 
        CASE WHEN schedule_record.requires_guest_coordination 
          THEN ' (coordinate with guest)' 
          ELSE '' 
        END,
      'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM housekeeping_tasks 
      WHERE booking_id = booking_record.id 
        AND task_type = schedule_record.task_type
        AND due_date = task_date
    );
  END LOOP;
END;
$$;

-- Create new trigger for the improved function
CREATE OR REPLACE FUNCTION public.trigger_generate_cleaning_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Generate tasks for the new/updated booking using the new configuration system
  PERFORM public.generate_cleaning_tasks_from_config(NEW);
  RETURN NEW;
END;
$$;

-- Add trigger for new bookings
DROP TRIGGER IF EXISTS trigger_booking_cleaning_tasks ON guesty_bookings;
CREATE TRIGGER trigger_booking_cleaning_tasks
  AFTER INSERT OR UPDATE ON guesty_bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_cleaning_tasks();

-- Add update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_cleaning_configs_updated_at 
  BEFORE UPDATE ON property_cleaning_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cleaning_rules_updated_at 
  BEFORE UPDATE ON cleaning_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
