-- Create system permissions table for super admins to modify default permissions
CREATE TABLE public.system_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  allowed_roles TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  modified_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.system_permissions ENABLE ROW LEVEL SECURITY;

-- Only superadmins can manage system permissions
CREATE POLICY "Only superadmins can manage system permissions"
ON public.system_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_system_permissions_updated_at
  BEFORE UPDATE ON public.system_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permissions from code into database
INSERT INTO public.system_permissions (permission_key, title, description, allowed_roles) VALUES
('manage_properties', 'Property Management', 'Create and manage property listings', ARRAY['superadmin', 'administrator', 'property_manager']),
('manage_bookings', 'Booking Management', 'Handle reservations and guest information', ARRAY['superadmin', 'administrator', 'property_manager', 'concierge']),
('view_damage_reports', 'View Damage Reports', 'Access and view damage reports', ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge']),
('manage_damage_reports', 'Manage Damage Reports', 'Create and update damage reports', ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff']),
('manage_housekeeping', 'Housekeeping Management', 'Assign and track housekeeping tasks', ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']),
('manage_maintenance', 'Maintenance Management', 'Create and assign maintenance tasks', ARRAY['superadmin', 'administrator', 'property_manager', 'maintenance_staff']),
('manage_inventory', 'Inventory Management', 'Track and manage inventory items', ARRAY['superadmin', 'administrator', 'property_manager', 'inventory_manager']),
('view_reports', 'View Reports', 'Access reporting dashboards', ARRAY['superadmin', 'administrator', 'property_manager']),
('manage_vendors', 'Vendor Management', 'Create and manage vendor information', ARRAY['superadmin', 'administrator', 'inventory_manager']),
('create_orders', 'Create Orders', 'Create purchase orders', ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager']),
('approve_orders', 'Approve Orders', 'Review and approve purchase orders', ARRAY['superadmin', 'administrator', 'property_manager']),
('finalize_orders', 'Finalize Orders', 'Final approval and sending of purchase orders', ARRAY['superadmin', 'administrator']),
('viewProperties', 'View Properties', 'View property listings and details', ARRAY['superadmin', 'administrator', 'property_manager', 'concierge']),
('manageProperties', 'Manage Properties', 'Create, edit, and delete property listings', ARRAY['superadmin', 'administrator', 'property_manager']),
('viewAllTasks', 'View All Tasks', 'View all tasks across properties', ARRAY['superadmin', 'administrator', 'property_manager']),
('viewAssignedTasks', 'View Assigned Tasks', 'View tasks assigned to you', ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff']),
('assignTasks', 'Assign Tasks', 'Assign tasks to staff members', ARRAY['superadmin', 'administrator', 'property_manager']),
('viewInventory', 'View Inventory', 'View inventory across properties', ARRAY['superadmin', 'administrator', 'property_manager', 'inventory_manager']),
('manageInventory', 'Manage Inventory', 'Add, edit, and remove inventory items', ARRAY['superadmin', 'administrator', 'property_manager', 'inventory_manager']),
('approveTransfers', 'Approve Transfers', 'Approve inventory transfer requests', ARRAY['superadmin', 'administrator', 'property_manager']),
('viewUsers', 'View Users', 'View user accounts', ARRAY['superadmin', 'administrator']),
('manageUsers', 'Manage Users', 'Create, edit, and deactivate user accounts', ARRAY['superadmin', 'administrator']),
('manageSettings', 'Manage Settings', 'Modify system settings and configurations', ARRAY['superadmin', 'administrator']),
('viewReports', 'View Reports', 'Access system reports and analytics', ARRAY['superadmin', 'administrator', 'property_manager']);