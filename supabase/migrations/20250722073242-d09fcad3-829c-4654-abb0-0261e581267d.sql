
-- Phase 1: Database Schema Updates for Property Assignment System

-- 1. Add assigned_users field to properties table
ALTER TABLE public.properties 
ADD COLUMN assigned_users UUID[] DEFAULT '{}';

-- 2. Create custom_roles table for dynamic role management
CREATE TABLE public.custom_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create user_property_assignments table for better query performance and audit trail
CREATE TABLE public.user_property_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  UNIQUE(user_id, property_id)
);

-- 4. Update profiles table to support extended roles
ALTER TABLE public.profiles 
ADD COLUMN custom_role_id UUID REFERENCES public.custom_roles(id),
ADD COLUMN role_permissions JSONB DEFAULT '{}';

-- 5. Insert default custom roles
INSERT INTO public.custom_roles (name, display_name, description, permissions) VALUES
('superadmin', 'Super Admin', 'Full system access', '{"all": true}'),
('administrator', 'Administrator', 'System administration', '{"properties": ["read", "write", "delete"], "users": ["read", "write"]}'),
('property_manager', 'Property Manager', 'Property management', '{"properties": ["read", "write"], "bookings": ["read", "write"]}'),
('housekeeper', 'Housekeeper', 'Housekeeping services', '{"properties": ["read"], "tasks": ["read", "write"]}'),
('manager', 'Manager', 'General management', '{"properties": ["read", "write"], "staff": ["read"]}'),
('maintenance_staff', 'Maintenance Staff', 'Property maintenance', '{"properties": ["read"], "maintenance": ["read", "write"]}'),
('pool_service', 'Pool Service', 'Pool maintenance', '{"properties": ["read"], "pool_maintenance": ["read", "write"]}'),
('external_partner', 'External Partner', 'External service provider', '{"properties": ["read"], "services": ["read", "write"]}'),
('inventory_manager', 'Inventory Manager', 'Inventory management', '{"properties": ["read"], "inventory": ["read", "write"]}'),
('concierge', 'Concierge', 'Guest services', '{"properties": ["read"], "guests": ["read", "write"]});

-- 6. Enable RLS on new tables
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_assignments ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for custom_roles
CREATE POLICY "Superadmins can manage custom roles" ON public.custom_roles
  FOR ALL USING (
    is_authenticated() AND get_user_role_safe() = 'superadmin'
  )
  WITH CHECK (
    is_authenticated() AND get_user_role_safe() = 'superadmin'
  );

CREATE POLICY "Users can view active custom roles" ON public.custom_roles
  FOR SELECT USING (
    is_authenticated() AND is_active = true
  );

-- 8. Create RLS policies for user_property_assignments
CREATE POLICY "Admins can manage all property assignments" ON public.user_property_assignments
  FOR ALL USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  )
  WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "Property managers can manage assignments for their properties" ON public.user_property_assignments
  FOR ALL USING (
    is_authenticated() AND (
      get_user_role_safe() IN ('superadmin', 'administrator') OR
      EXISTS (
        SELECT 1 FROM public.properties p 
        WHERE p.id = property_id AND auth.uid() = ANY(p.assigned_users)
      )
    )
  );

CREATE POLICY "Users can view their own assignments" ON public.user_property_assignments
  FOR SELECT USING (
    is_authenticated() AND user_id = auth.uid()
  );

-- 9. Update properties RLS policies for assignment-based access
DROP POLICY IF EXISTS "Properties are viewable by staff" ON public.properties;
DROP POLICY IF EXISTS "Property managers can manage properties" ON public.properties;

CREATE POLICY "Admins can view all properties" ON public.properties
  FOR SELECT USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "Users can view assigned properties" ON public.properties
  FOR SELECT USING (
    is_authenticated() AND (
      get_user_role_safe() IN ('superadmin', 'administrator') OR
      auth.uid() = ANY(assigned_users) OR
      EXISTS (
        SELECT 1 FROM public.user_property_assignments upa 
        WHERE upa.property_id = id AND upa.user_id = auth.uid() AND upa.is_active = true
      )
    )
  );

CREATE POLICY "Admins can manage all properties" ON public.properties
  FOR ALL USING (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  )
  WITH CHECK (
    is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')
  );

CREATE POLICY "Property managers can update assigned properties" ON public.properties
  FOR UPDATE USING (
    is_authenticated() AND (
      get_user_role_safe() IN ('superadmin', 'administrator') OR
      (get_user_role_safe() = 'property_manager' AND auth.uid() = ANY(assigned_users))
    )
  );

-- 10. Create indexes for better performance
CREATE INDEX idx_properties_assigned_users ON public.properties USING GIN(assigned_users);
CREATE INDEX idx_user_property_assignments_user_id ON public.user_property_assignments(user_id);
CREATE INDEX idx_user_property_assignments_property_id ON public.user_property_assignments(property_id);
CREATE INDEX idx_user_property_assignments_active ON public.user_property_assignments(is_active);

-- 11. Create functions for property assignment management
CREATE OR REPLACE FUNCTION public.assign_users_to_property(
  property_id UUID,
  user_ids UUID[],
  assigned_by_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSONB;
  user_id UUID;
BEGIN
  -- Check permissions
  IF NOT (is_authenticated() AND get_user_role_safe() IN ('superadmin', 'administrator')) THEN
    RAISE EXCEPTION 'Permission denied: Only admins can assign users to properties';
  END IF;

  -- Update properties table with assigned users
  UPDATE public.properties 
  SET assigned_users = user_ids, updated_at = now()
  WHERE id = property_id;

  -- Deactivate existing assignments
  UPDATE public.user_property_assignments 
  SET is_active = false 
  WHERE property_id = assign_users_to_property.property_id;

  -- Insert new assignments
  FOREACH user_id IN ARRAY user_ids
  LOOP
    INSERT INTO public.user_property_assignments (user_id, property_id, assigned_by, assigned_at, is_active)
    VALUES (user_id, property_id, assigned_by_id, now(), true)
    ON CONFLICT (user_id, property_id) 
    DO UPDATE SET is_active = true, assigned_by = assigned_by_id, assigned_at = now();
  END LOOP;

  result := jsonb_build_object(
    'success', true,
    'property_id', property_id,
    'assigned_users', user_ids,
    'assigned_by', assigned_by_id
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_assigned_properties(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  property_id UUID,
  property_name TEXT,
  property_address TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Users can only see their own assignments unless they're admin
  IF NOT (is_authenticated() AND (auth.uid() = user_id OR get_user_role_safe() IN ('superadmin', 'administrator'))) THEN
    RAISE EXCEPTION 'Permission denied: Cannot view other users assignments';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.address,
    upa.assigned_at,
    upa.assigned_by
  FROM public.properties p
  JOIN public.user_property_assignments upa ON p.id = upa.property_id
  WHERE upa.user_id = get_user_assigned_properties.user_id 
    AND upa.is_active = true
  ORDER BY upa.assigned_at DESC;
END;
$$;

-- 12. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_roles_updated_at 
  BEFORE UPDATE ON public.custom_roles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Log the migration
INSERT INTO audit_logs (table_name, action, user_id, created_at)
VALUES ('property_assignment_system', 'SCHEMA_MIGRATION_COMPLETE', auth.uid(), NOW());
