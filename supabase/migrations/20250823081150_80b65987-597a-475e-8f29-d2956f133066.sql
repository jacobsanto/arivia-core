-- Create missing core tables for the Arivia Villas app

-- 1. Create system_permissions table
CREATE TABLE public.system_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_key TEXT NOT NULL UNIQUE,
  permission_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for system_permissions
ALTER TABLE public.system_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for system_permissions
CREATE POLICY "Authenticated users can view permissions" 
ON public.system_permissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage permissions" 
ON public.system_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- 2. Create housekeeping_tasks table
CREATE TABLE public.housekeeping_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT,
  booking_id TEXT,
  task_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  checklist JSONB DEFAULT '[]'::jsonb,
  additional_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for housekeeping_tasks
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for housekeeping_tasks
CREATE POLICY "View housekeeping tasks (staff/managers/admins)" 
ON public.housekeeping_tasks 
FOR SELECT 
USING (
  (assigned_to = auth.uid()) OR 
  has_role(auth.uid(), 'housekeeping_staff'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Create housekeeping tasks (managers/admins)" 
ON public.housekeeping_tasks 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Update housekeeping tasks (assigned/managers/admins)" 
ON public.housekeeping_tasks 
FOR UPDATE 
USING (
  (assigned_to = auth.uid()) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- 3. Create maintenance_tasks table
CREATE TABLE public.maintenance_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_id UUID REFERENCES public.properties(id),
  task_type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for maintenance_tasks
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_tasks
CREATE POLICY "View maintenance tasks (staff/managers/admins)" 
ON public.maintenance_tasks 
FOR SELECT 
USING (
  (assigned_to = auth.uid()) OR 
  (created_by = auth.uid()) OR
  has_role(auth.uid(), 'maintenance_staff'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Create maintenance tasks (staff/managers/admins)" 
ON public.maintenance_tasks 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND (
    has_role(auth.uid(), 'maintenance_staff'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  )
);

CREATE POLICY "Update maintenance tasks (assigned/creator/managers/admins)" 
ON public.maintenance_tasks 
FOR UPDATE 
USING (
  (assigned_to = auth.uid()) OR
  (created_by = auth.uid()) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- 4. Create guesty_listings table for property sync
CREATE TABLE public.guesty_listings (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT,
  description TEXT,
  address TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  max_guests INTEGER DEFAULT 1,
  property_type TEXT,
  listing_url TEXT,
  calendar_last_synced TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for guesty_listings
ALTER TABLE public.guesty_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for guesty_listings
CREATE POLICY "View guesty listings (authenticated)" 
ON public.guesty_listings 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_deleted = false);

CREATE POLICY "Manage guesty listings (admins)" 
ON public.guesty_listings 
FOR ALL 
USING (has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_system_permissions_updated_at
BEFORE UPDATE ON public.system_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_housekeeping_tasks_updated_at
BEFORE UPDATE ON public.housekeeping_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at
BEFORE UPDATE ON public.maintenance_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guesty_listings_updated_at
BEFORE UPDATE ON public.guesty_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system permissions
INSERT INTO public.system_permissions (permission_key, permission_name, description, category) VALUES
('viewDashboard', 'View Dashboard', 'Access to main dashboard', 'dashboard'),
('viewTasks', 'View Tasks', 'View tasks and assignments', 'tasks'),
('createTasks', 'Create Tasks', 'Create new tasks', 'tasks'),
('editTasks', 'Edit Tasks', 'Modify existing tasks', 'tasks'),
('deleteTasks', 'Delete Tasks', 'Remove tasks', 'tasks'),
('viewInventory', 'View Inventory', 'Access inventory management', 'inventory'),
('manageInventory', 'Manage Inventory', 'Create, edit, delete inventory items', 'inventory'),
('viewReports', 'View Reports', 'Access analytics and reports', 'reports'),
('manageUsers', 'Manage Users', 'Create, edit, delete user accounts', 'users'),
('viewFinancials', 'View Financials', 'Access financial data', 'finance'),
('manageProperties', 'Manage Properties', 'Create, edit, delete properties', 'properties'),
('systemAdmin', 'System Administration', 'Full system administration access', 'system');

-- Insert some sample Guesty listings for development
INSERT INTO public.guesty_listings (id, title, description, address, bedrooms, bathrooms, max_guests, property_type) VALUES
('guesty-villa-1', 'Villa Paradise', 'Luxury villa with sea view', 'Santorini, Greece', 3, 2, 6, 'villa'),
('guesty-villa-2', 'Villa Sunset', 'Modern villa with pool', 'Mykonos, Greece', 4, 3, 8, 'villa'),
('guesty-villa-3', 'Villa Dreams', 'Cozy villa in traditional style', 'Crete, Greece', 2, 1, 4, 'villa');