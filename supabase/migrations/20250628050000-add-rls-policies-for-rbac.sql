
-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own roles
CREATE POLICY "Users read their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own roles (for self-assignment scenarios)
CREATE POLICY "Users can insert their own roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can manage all user roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('superadmin', 'tenant_admin')
    )
  );

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view roles
CREATE POLICY "All authenticated users can view roles" ON public.roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only admins can manage roles
CREATE POLICY "Only admins can manage roles" ON public.roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('superadmin', 'tenant_admin')
    )
  );

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read permissions
CREATE POLICY "All authenticated users can read permissions" ON public.permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only superadmins can manage permissions
CREATE POLICY "Only superadmins can manage permissions" ON public.permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Enable RLS on role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view role-permission mappings
CREATE POLICY "All authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only admins can manage role-permission mappings
CREATE POLICY "Only admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('superadmin', 'tenant_admin')
    )
  );

-- Create a security definer function to get current user role to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update existing policies to use the security definer function
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.roles;
CREATE POLICY "Only admins can manage roles" ON public.roles
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'tenant_admin'));

DROP POLICY IF EXISTS "Only superadmins can manage permissions" ON public.permissions;
CREATE POLICY "Only superadmins can manage permissions" ON public.permissions
  FOR ALL USING (public.get_current_user_role() = 'superadmin');

DROP POLICY IF EXISTS "Only admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Only admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'tenant_admin'));

DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'tenant_admin'));
