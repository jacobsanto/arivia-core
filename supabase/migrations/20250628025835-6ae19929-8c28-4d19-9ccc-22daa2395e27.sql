
-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, key)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for roles
CREATE POLICY "Users can view roles in their tenant" ON public.roles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (true);

-- Create RLS policies for permissions
CREATE POLICY "Users can view permissions in their tenant" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (true);

-- Create RLS policies for role_permissions
CREATE POLICY "Users can view role permissions in their tenant" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (true);

-- Insert default roles
INSERT INTO public.roles (tenant_id, name, description) VALUES
  (gen_random_uuid(), 'superadmin', 'Super Administrator with all permissions'),
  (gen_random_uuid(), 'tenant_admin', 'Tenant Administrator'),
  (gen_random_uuid(), 'property_manager', 'Property Manager'),
  (gen_random_uuid(), 'housekeeping_staff', 'Housekeeping Staff'),
  (gen_random_uuid(), 'maintenance_staff', 'Maintenance Staff'),
  (gen_random_uuid(), 'inventory_manager', 'Inventory Manager'),
  (gen_random_uuid(), 'concierge', 'Concierge')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.permissions (tenant_id, key, label, category) VALUES
  (gen_random_uuid(), 'viewDashboard', 'View Dashboard', 'dashboard'),
  (gen_random_uuid(), 'viewProperties', 'View Properties', 'properties'),
  (gen_random_uuid(), 'manageProperties', 'Manage Properties', 'properties'),
  (gen_random_uuid(), 'viewAllTasks', 'View All Tasks', 'tasks'),
  (gen_random_uuid(), 'viewAssignedTasks', 'View Assigned Tasks', 'tasks'),
  (gen_random_uuid(), 'assignTasks', 'Assign Tasks', 'tasks'),
  (gen_random_uuid(), 'viewInventory', 'View Inventory', 'inventory'),
  (gen_random_uuid(), 'manageInventory', 'Manage Inventory', 'inventory'),
  (gen_random_uuid(), 'approveTransfers', 'Approve Transfers', 'inventory'),
  (gen_random_uuid(), 'viewUsers', 'View Users', 'users'),
  (gen_random_uuid(), 'manageUsers', 'Manage Users', 'users'),
  (gen_random_uuid(), 'viewReports', 'View Reports', 'reports'),
  (gen_random_uuid(), 'viewChat', 'View Chat', 'chat'),
  (gen_random_uuid(), 'view_damage_reports', 'View Damage Reports', 'reports')
ON CONFLICT (tenant_id, key) DO NOTHING;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
