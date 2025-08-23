-- Check if cleaning-related tables need to be created
-- First, let's see what cleaning tables might be missing

-- Table for cleaning actions (used in the hooks)
CREATE TABLE IF NOT EXISTS public.cleaning_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER NOT NULL DEFAULT 60,
  category TEXT NOT NULL DEFAULT 'cleaning',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for cleaning templates
CREATE TABLE IF NOT EXISTS public.cleaning_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for property cleaning configurations
CREATE TABLE IF NOT EXISTS public.property_cleaning_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  config_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(listing_id, config_name)
);

-- Table for rule conditions (advanced cleaning system)
CREATE TABLE IF NOT EXISTS public.rule_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  condition_type TEXT NOT NULL,
  operator TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  logical_operator TEXT DEFAULT 'AND',
  condition_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for rule actions (advanced cleaning system)
CREATE TABLE IF NOT EXISTS public.rule_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for rule assignments
CREATE TABLE IF NOT EXISTS public.rule_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  property_id UUID NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(rule_id, property_id)
);

-- Table for configuration assignments
CREATE TABLE IF NOT EXISTS public.configuration_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID,
  config_id UUID,
  listing_id TEXT NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, listing_id)
);

-- Table for rule test results
CREATE TABLE IF NOT EXISTS public.rule_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  test_booking_data JSONB NOT NULL,
  test_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.cleaning_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_cleaning_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cleaning_actions
CREATE POLICY "Staff can view cleaning actions" ON public.cleaning_actions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage cleaning actions" ON public.cleaning_actions
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for cleaning_templates
CREATE POLICY "Staff can view cleaning templates" ON public.cleaning_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage cleaning templates" ON public.cleaning_templates
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for property_cleaning_configs
CREATE POLICY "Staff can view cleaning configs" ON public.property_cleaning_configs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage cleaning configs" ON public.property_cleaning_configs
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for rule_conditions
CREATE POLICY "Staff can view rule conditions" ON public.rule_conditions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage rule conditions" ON public.rule_conditions
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for rule_actions
CREATE POLICY "Staff can view rule actions" ON public.rule_actions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage rule actions" ON public.rule_actions
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for rule_assignments
CREATE POLICY "Staff can view rule assignments" ON public.rule_assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage rule assignments" ON public.rule_assignments
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for configuration_assignments
CREATE POLICY "Staff can view configuration assignments" ON public.configuration_assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage configuration assignments" ON public.configuration_assignments
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for rule_test_results
CREATE POLICY "Staff can view rule test results" ON public.rule_test_results
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage rule test results" ON public.rule_test_results
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Add some sample cleaning actions
INSERT INTO public.cleaning_actions (action_name, display_name, description, estimated_duration, category) VALUES
  ('standard_cleaning', 'Standard Cleaning', 'Basic cleaning tasks including vacuuming, mopping, and surface cleaning', 90, 'cleaning'),
  ('full_cleaning', 'Full Cleaning', 'Comprehensive cleaning including all rooms and detailed attention', 180, 'cleaning'),
  ('deep_cleaning', 'Deep Cleaning', 'Intensive cleaning including baseboards, windows, and detailed scrubbing', 240, 'cleaning'),
  ('change_sheets', 'Change Bed Sheets', 'Replace and clean all bedding materials', 30, 'linen'),
  ('towel_refresh', 'Towel Refresh', 'Replace towels and bathroom linens', 20, 'linen'),
  ('bathroom_deep_clean', 'Bathroom Deep Clean', 'Detailed bathroom cleaning including tiles and fixtures', 60, 'cleaning'),
  ('kitchen_appliances', 'Kitchen Appliances', 'Clean inside and outside of all kitchen appliances', 45, 'cleaning'),
  ('inventory_check', 'Inventory Check', 'Check and restock amenities and supplies', 30, 'restocking'),
  ('damage_inspection', 'Damage Inspection', 'Check for any damages or maintenance needs', 20, 'inspection')
ON CONFLICT (action_name) DO NOTHING;

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_cleaning_actions_updated_at
    BEFORE UPDATE ON public.cleaning_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cleaning_templates_updated_at
    BEFORE UPDATE ON public.cleaning_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_cleaning_configs_updated_at
    BEFORE UPDATE ON public.property_cleaning_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();