-- Create role_permissions table to store which roles have which permissions
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Superadmins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can view role permissions" 
ON public.role_permissions 
FOR SELECT 
USING (has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default role permissions
-- Superadmin gets all permissions
INSERT INTO public.role_permissions (role, permission_key, granted) 
SELECT 'superadmin'::app_role, permission_key, true 
FROM public.system_permissions 
WHERE is_active = true;

-- Administrator gets most permissions (excluding systemAdmin)
INSERT INTO public.role_permissions (role, permission_key, granted) 
SELECT 'administrator'::app_role, permission_key, true 
FROM public.system_permissions 
WHERE is_active = true AND permission_key != 'systemAdmin';

-- Property Manager gets task and property management permissions
INSERT INTO public.role_permissions (role, permission_key, granted) VALUES
('property_manager'::app_role, 'viewDashboard', true),
('property_manager'::app_role, 'viewTasks', true),
('property_manager'::app_role, 'createTasks', true),
('property_manager'::app_role, 'editTasks', true),
('property_manager'::app_role, 'viewInventory', true),
('property_manager'::app_role, 'manageInventory', true),
('property_manager'::app_role, 'viewReports', true),
('property_manager'::app_role, 'manageProperties', true);

-- Housekeeping Staff gets basic task permissions
INSERT INTO public.role_permissions (role, permission_key, granted) VALUES
('housekeeping_staff'::app_role, 'viewDashboard', true),
('housekeeping_staff'::app_role, 'viewTasks', true),
('housekeeping_staff'::app_role, 'editTasks', true),
('housekeeping_staff'::app_role, 'viewInventory', true);

-- Maintenance Staff gets similar permissions to housekeeping
INSERT INTO public.role_permissions (role, permission_key, granted) VALUES
('maintenance_staff'::app_role, 'viewDashboard', true),
('maintenance_staff'::app_role, 'viewTasks', true),
('maintenance_staff'::app_role, 'editTasks', true),
('maintenance_staff'::app_role, 'viewInventory', true);

-- Guest gets minimal permissions
INSERT INTO public.role_permissions (role, permission_key, granted) VALUES
('guest'::app_role, 'viewDashboard', true);