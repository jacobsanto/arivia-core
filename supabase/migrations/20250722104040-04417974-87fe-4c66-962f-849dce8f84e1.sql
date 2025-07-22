
-- Add global cleaning templates table
CREATE TABLE public.cleaning_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Add rule conditions for complex logic
CREATE TABLE public.rule_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES cleaning_rules(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- 'guest_count', 'checkout_time', 'next_booking', 'stay_duration', 'property_type'
  operator TEXT NOT NULL, -- 'equals', 'greater_than', 'less_than', 'between', 'contains'
  value JSONB NOT NULL,
  logical_operator TEXT DEFAULT 'AND', -- 'AND', 'OR'
  condition_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add rule actions for multiple actions per rule
CREATE TABLE public.rule_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES cleaning_rules(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'create_task', 'add_fee', 'send_notification', 'assign_staff'
  action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add configuration assignments for bulk operations
CREATE TABLE public.configuration_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES cleaning_templates(id) ON DELETE CASCADE,
  config_id UUID REFERENCES property_cleaning_configs(id) ON DELETE CASCADE,
  listing_id TEXT REFERENCES guesty_listings(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, listing_id)
);

-- Add rule testing results
CREATE TABLE public.rule_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES cleaning_rules(id) ON DELETE CASCADE,
  test_booking_data JSONB NOT NULL,
  test_result JSONB NOT NULL,
  tested_by UUID REFERENCES auth.users(id),
  tested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE cleaning_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cleaning templates
CREATE POLICY "Admins can manage cleaning templates" 
  ON cleaning_templates FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view cleaning templates" 
  ON cleaning_templates FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS Policies for rule conditions
CREATE POLICY "Admins can manage rule conditions" 
  ON rule_conditions FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view rule conditions" 
  ON rule_conditions FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS Policies for rule actions
CREATE POLICY "Admins can manage rule actions" 
  ON rule_actions FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view rule actions" 
  ON rule_actions FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS Policies for configuration assignments
CREATE POLICY "Admins can manage configuration assignments" 
  ON configuration_assignments FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view configuration assignments" 
  ON configuration_assignments FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS Policies for rule test results
CREATE POLICY "Admins can manage rule test results" 
  ON rule_test_results FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

-- Add indexes for performance
CREATE INDEX idx_rule_conditions_rule_id ON rule_conditions(rule_id);
CREATE INDEX idx_rule_actions_rule_id ON rule_actions(rule_id);
CREATE INDEX idx_configuration_assignments_template_id ON configuration_assignments(template_id);
CREATE INDEX idx_configuration_assignments_listing_id ON configuration_assignments(listing_id);

-- Add updated_at triggers
CREATE TRIGGER update_cleaning_templates_updated_at 
  BEFORE UPDATE ON cleaning_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing cleaning_rules table to support advanced features
ALTER TABLE cleaning_rules ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES cleaning_templates(id) ON DELETE SET NULL;
ALTER TABLE cleaning_rules ADD COLUMN IF NOT EXISTS rule_version INTEGER DEFAULT 1;
ALTER TABLE cleaning_rules ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Create function to evaluate rule conditions
CREATE OR REPLACE FUNCTION public.evaluate_rule_conditions(rule_uuid uuid, booking_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  condition_record RECORD;
  result BOOLEAN := true;
  temp_result BOOLEAN;
BEGIN
  -- Get all conditions for this rule ordered by condition_order
  FOR condition_record IN 
    SELECT * FROM rule_conditions 
    WHERE rule_id = rule_uuid 
    ORDER BY condition_order
  LOOP
    -- Evaluate each condition based on type and operator
    CASE condition_record.condition_type
      WHEN 'stay_duration' THEN
        CASE condition_record.operator
          WHEN 'equals' THEN
            temp_result := (booking_data->>'stay_duration')::integer = (condition_record.value->>'value')::integer;
          WHEN 'greater_than' THEN
            temp_result := (booking_data->>'stay_duration')::integer > (condition_record.value->>'value')::integer;
          WHEN 'less_than' THEN
            temp_result := (booking_data->>'stay_duration')::integer < (condition_record.value->>'value')::integer;
          WHEN 'between' THEN
            temp_result := (booking_data->>'stay_duration')::integer BETWEEN 
              (condition_record.value->>'min')::integer AND (condition_record.value->>'max')::integer;
          ELSE
            temp_result := false;
        END CASE;
      WHEN 'guest_count' THEN
        CASE condition_record.operator
          WHEN 'equals' THEN
            temp_result := (booking_data->>'guest_count')::integer = (condition_record.value->>'value')::integer;
          WHEN 'greater_than' THEN
            temp_result := (booking_data->>'guest_count')::integer > (condition_record.value->>'value')::integer;
          WHEN 'less_than' THEN
            temp_result := (booking_data->>'guest_count')::integer < (condition_record.value->>'value')::integer;
          ELSE
            temp_result := false;
        END CASE;
      ELSE
        temp_result := true; -- Default to true for unknown condition types
    END CASE;
    
    -- Apply logical operator
    IF condition_record.logical_operator = 'AND' THEN
      result := result AND temp_result;
    ELSIF condition_record.logical_operator = 'OR' THEN
      result := result OR temp_result;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;
