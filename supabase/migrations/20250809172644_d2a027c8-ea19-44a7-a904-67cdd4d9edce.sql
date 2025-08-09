-- Security hardening: add explicit is_authenticated() to key policies using role checks

-- api_logs SELECT must require authentication explicitly
DROP POLICY IF EXISTS "Admins can view API logs" ON public.api_logs;
CREATE POLICY "Admins can view API logs"
ON public.api_logs
FOR SELECT
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator'));

-- inventory_items policies
DROP POLICY IF EXISTS "Managers can manage inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can view inventory items" ON public.inventory_items;

CREATE POLICY "Managers can manage inventory items"
ON public.inventory_items
FOR ALL
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','inventory_manager'))
WITH CHECK (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','inventory_manager'));

CREATE POLICY "Staff can view inventory items"
ON public.inventory_items
FOR SELECT
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'));

-- inventory_stock policies
DROP POLICY IF EXISTS "Managers can delete stock records" ON public.inventory_stock;
DROP POLICY IF EXISTS "Staff can modify stock levels" ON public.inventory_stock;
DROP POLICY IF EXISTS "Staff can view inventory stock" ON public.inventory_stock;
DROP POLICY IF EXISTS "Staff can update stock levels" ON public.inventory_stock;

CREATE POLICY "Managers can delete stock records"
ON public.inventory_stock
FOR DELETE
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','inventory_manager'));

CREATE POLICY "Staff can modify stock levels"
ON public.inventory_stock
FOR UPDATE
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'));

CREATE POLICY "Staff can update stock levels"
ON public.inventory_stock
FOR INSERT
WITH CHECK (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager','housekeeping_staff') AND last_updated_by = auth.uid());

CREATE POLICY "Staff can view inventory stock"
ON public.inventory_stock
FOR SELECT
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'));

-- maintenance_tasks policies
DROP POLICY IF EXISTS "Admins can delete maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Managers can create maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Staff can update assigned tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Staff can view maintenance tasks" ON public.maintenance_tasks;

CREATE POLICY "Admins can delete maintenance tasks"
ON public.maintenance_tasks
FOR DELETE
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator'));

CREATE POLICY "Managers can create maintenance tasks"
ON public.maintenance_tasks
FOR INSERT
WITH CHECK (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager'));

CREATE POLICY "Staff can update assigned tasks"
ON public.maintenance_tasks
FOR UPDATE
USING (public.is_authenticated() AND (public.get_current_user_role() IN ('superadmin','administrator','property_manager') OR assigned_to = auth.uid()));

CREATE POLICY "Staff can view maintenance tasks"
ON public.maintenance_tasks
FOR SELECT
USING (public.is_authenticated() AND (public.get_current_user_role() IN ('superadmin','administrator','property_manager','maintenance_staff') OR assigned_to = auth.uid()));

-- order_items policies
DROP POLICY IF EXISTS "Staff can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Staff can view order items" ON public.order_items;

CREATE POLICY "Staff can manage order items"
ON public.order_items
FOR ALL
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager'))
WITH CHECK (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager'));

CREATE POLICY "Staff can view order items"
ON public.order_items
FOR SELECT
USING (public.is_authenticated() AND public.get_current_user_role() IN ('superadmin','administrator','property_manager','inventory_manager'));

-- damage_report_media SELECT should require authentication
DROP POLICY IF EXISTS "Users can view damage report media" ON public.damage_report_media;
CREATE POLICY "Users can view damage report media"
ON public.damage_report_media
FOR SELECT
USING (
  public.is_authenticated() AND (
    EXISTS (
      SELECT 1 FROM public.damage_reports dr
      WHERE dr.id = damage_report_media.report_id
      AND (
        dr.reported_by = auth.uid()
        OR dr.assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'property_manager')
        )
      )
    )
  )
);
