-- Critical Security Fix Phase 2: Proper RLS Policy Updates (Fixed Approach)

-- Create enhanced authentication check function
CREATE OR REPLACE FUNCTION public.require_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.role() = 'authenticated'::text AND auth.uid() IS NOT NULL;
$$;

-- Fix cleaning_actions policies
DROP POLICY IF EXISTS "Admins can manage cleaning actions" ON public.cleaning_actions;
DROP POLICY IF EXISTS "Staff can view cleaning actions" ON public.cleaning_actions;

CREATE POLICY "Admins can manage cleaning actions" ON public.cleaning_actions
FOR ALL USING (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text])
);

CREATE POLICY "Staff can view cleaning actions" ON public.cleaning_actions
FOR SELECT USING (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text, 'housekeeping_staff'::text])
);

-- Fix inventory policies
DROP POLICY IF EXISTS "Managers can manage inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Staff can view inventory categories" ON public.inventory_categories;

CREATE POLICY "Managers can manage inventory categories" ON public.inventory_categories
FOR ALL USING (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'inventory_manager'::text])
)
WITH CHECK (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'inventory_manager'::text])
);

CREATE POLICY "Staff can view inventory categories" ON public.inventory_categories
FOR SELECT USING (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text, 'inventory_manager'::text, 'housekeeping_staff'::text])
);

-- Fix properties policies
DROP POLICY IF EXISTS "Properties are viewable by staff" ON public.properties;
DROP POLICY IF EXISTS "Property managers can manage properties" ON public.properties;

CREATE POLICY "Properties are viewable by staff" ON public.properties
FOR SELECT USING (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text, 'housekeeping_staff'::text, 'maintenance_staff'::text])
);

CREATE POLICY "Property managers can manage properties" ON public.properties
FOR ALL USING (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text])
)
WITH CHECK (
  auth.role() = 'authenticated'::text AND
  get_current_user_role() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text])
);

-- Fix bookings policies
DROP POLICY IF EXISTS "Property managers can view relevant bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property managers can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property managers can create bookings" ON public.bookings;

CREATE POLICY "Property managers can view relevant bookings" ON public.bookings
FOR SELECT USING (
  auth.role() = 'authenticated'::text AND
  get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text])
);

CREATE POLICY "Property managers can update bookings" ON public.bookings
FOR UPDATE USING (
  auth.role() = 'authenticated'::text AND
  get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text])
);

CREATE POLICY "Property managers can create bookings" ON public.bookings
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'::text AND
  get_user_role_safe() = ANY (ARRAY['superadmin'::text, 'administrator'::text, 'property_manager'::text])
);