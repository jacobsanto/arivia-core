-- Phase 1 Security Hardening (batch 3): add TO authenticated to key policies to eliminate anon access warnings

-- PROPERTIES
DROP POLICY IF EXISTS "Properties are viewable by staff" ON public.properties;
CREATE POLICY "Properties are viewable by staff"
ON public.properties
FOR SELECT
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff','maintenance_staff'])
);

DROP POLICY IF EXISTS "Property managers can manage properties" ON public.properties;
CREATE POLICY "Property managers can manage properties"
ON public.properties
FOR ALL
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- GUESTY LISTINGS
DROP POLICY IF EXISTS guesty_listings_read_access ON public.guesty_listings;
CREATE POLICY guesty_listings_read_access
ON public.guesty_listings
FOR SELECT
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

DROP POLICY IF EXISTS guesty_listings_service_role_all ON public.guesty_listings;
CREATE POLICY guesty_listings_service_role_all
ON public.guesty_listings
FOR ALL
TO authenticated
USING (
  (auth.role() = 'service_role') OR (is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator']))
)
WITH CHECK (
  (auth.role() = 'service_role') OR (is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator']))
);

-- GUESTY BOOKINGS
DROP POLICY IF EXISTS guesty_bookings_read_access ON public.guesty_bookings;
CREATE POLICY guesty_bookings_read_access
ON public.guesty_bookings
FOR SELECT
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

DROP POLICY IF EXISTS guesty_bookings_admin_update ON public.guesty_bookings;
CREATE POLICY guesty_bookings_admin_update
ON public.guesty_bookings
FOR UPDATE
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS guesty_bookings_admin_delete ON public.guesty_bookings;
CREATE POLICY guesty_bookings_admin_delete
ON public.guesty_bookings
FOR DELETE
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS guesty_bookings_admin_write ON public.guesty_bookings;
CREATE POLICY guesty_bookings_admin_write
ON public.guesty_bookings
FOR INSERT
TO authenticated
WITH CHECK (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

-- HOUSEKEEPING TASKS
DROP POLICY IF EXISTS housekeeping_tasks_staff_read ON public.housekeeping_tasks;
CREATE POLICY housekeeping_tasks_staff_read
ON public.housekeeping_tasks
FOR SELECT
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

DROP POLICY IF EXISTS housekeeping_tasks_staff_update ON public.housekeeping_tasks;
CREATE POLICY housekeeping_tasks_staff_update
ON public.housekeeping_tasks
FOR UPDATE
TO authenticated
USING (
  is_authenticated() AND (
    get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
    OR assigned_to = auth.uid()
  )
);

-- INTEGRATION HEALTH
DROP POLICY IF EXISTS "Allow staff to view integration health" ON public.integration_health;
CREATE POLICY "Allow staff to view integration health"
ON public.integration_health
FOR SELECT
TO authenticated
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS integration_health_service_and_admin ON public.integration_health;
CREATE POLICY integration_health_service_and_admin
ON public.integration_health
FOR ALL
TO authenticated
USING (
  (auth.role() = 'service_role') OR (is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator']))
)
WITH CHECK (
  (auth.role() = 'service_role') OR (is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator']))
);
