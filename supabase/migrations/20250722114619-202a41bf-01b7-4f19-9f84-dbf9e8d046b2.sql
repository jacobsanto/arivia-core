
-- Create cleaning_actions table
CREATE TABLE IF NOT EXISTS public.cleaning_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER DEFAULT 60,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rule_assignments table
CREATE TABLE IF NOT EXISTS public.rule_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.cleaning_rules(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(rule_id, property_id)
);

-- Add missing columns to cleaning_rules table
ALTER TABLE public.cleaning_rules 
ADD COLUMN IF NOT EXISTS stay_length_range INTEGER[] DEFAULT ARRAY[1, 999],
ADD COLUMN IF NOT EXISTS actions_by_day JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS assignable_properties TEXT[] DEFAULT '{}';

-- Add missing columns to housekeeping_tasks table  
ALTER TABLE public.housekeeping_tasks 
ADD COLUMN IF NOT EXISTS default_actions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS additional_actions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS source_rule_id UUID REFERENCES public.cleaning_rules(id),
ADD COLUMN IF NOT EXISTS task_day_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable RLS on new tables
ALTER TABLE public.cleaning_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for cleaning_actions
CREATE POLICY "Admins can manage cleaning actions" ON public.cleaning_actions
  FOR ALL USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view cleaning actions" ON public.cleaning_actions
  FOR SELECT USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- RLS policies for rule_assignments
CREATE POLICY "Admins can manage rule assignments" ON public.rule_assignments
  FOR ALL USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view rule assignments" ON public.rule_assignments
  FOR SELECT USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

-- Add triggers for updated_at
CREATE TRIGGER update_cleaning_actions_updated_at
  BEFORE UPDATE ON public.cleaning_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rule_assignments_updated_at
  BEFORE UPDATE ON public.rule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default cleaning actions
INSERT INTO public.cleaning_actions (action_name, display_name, description, estimated_duration, category) VALUES
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
('inventory_restock', 'Inventory Restock', 'Check and replenish supplies', 20, 'supplies')
ON CONFLICT (action_name) DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rule_assignments_rule_id ON public.rule_assignments(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_assignments_property_id ON public.rule_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_source_rule ON public.housekeeping_tasks(source_rule_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_actions_category ON public.cleaning_actions(category);
