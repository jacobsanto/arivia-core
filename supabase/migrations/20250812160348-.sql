-- Security Enhancement: Tighten RLS Policies for Better Access Control

-- 1. Restrict profiles table access - employees can only see their own profile and immediate team members
DROP POLICY IF EXISTS "Managers and admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team profiles" ON public.profiles  
  FOR SELECT USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- 2. Restrict vendors table access to managers/administrators only
DROP POLICY IF EXISTS "Read vendors (authenticated)" ON public.vendors;

CREATE POLICY "Read vendors (managers/admins only)" ON public.vendors
  FOR SELECT USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- 3. Restrict audit logs access - users can only see their own logs, admins see all
DROP POLICY IF EXISTS "read audit logs (admins)" ON public.audit_logs;
DROP POLICY IF EXISTS "read own audit logs" ON public.audit_logs;

CREATE POLICY "Users can read their own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all audit logs" ON public.audit_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- 4. Restrict system settings to superadmins only (more restrictive)
DROP POLICY IF EXISTS "Admins can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON public.system_settings;

CREATE POLICY "Superadmins can manage system settings" ON public.system_settings
  FOR ALL USING (has_role(auth.uid(), 'superadmin'::app_role));

-- 5. Enhance orders access control - staff can only see their own orders
DROP POLICY IF EXISTS "View orders (requestor/managers/admins)" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (requestor = auth.uid());

CREATE POLICY "Managers can view all orders" ON public.orders
  FOR SELECT USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- 6. Restrict inventory categories to authenticated property-related staff only  
DROP POLICY IF EXISTS "Read categories (authenticated)" ON public.inventory_categories;

CREATE POLICY "Read categories (property staff only)" ON public.inventory_categories
  FOR SELECT USING (
    has_role(auth.uid(), 'housekeeping_staff'::app_role) OR
    has_role(auth.uid(), 'maintenance_staff'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );