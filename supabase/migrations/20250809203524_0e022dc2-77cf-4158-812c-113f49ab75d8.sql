-- Harden RLS: add TO authenticated to prevent anonymous access for key tables
-- Note: We only modify policies for authenticated access; service_role policies are left intact

-- properties
DROP POLICY IF EXISTS "Properties are viewable by staff" ON public.properties;
CREATE POLICY "Properties are viewable by staff"
ON public.properties
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff','maintenance_staff'])
);

DROP POLICY IF EXISTS "Property managers can manage properties" ON public.properties;
CREATE POLICY "Property managers can manage properties"
ON public.properties
FOR ALL
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- guesty_listings
DROP POLICY IF EXISTS guesty_listings_read_access ON public.guesty_listings;
CREATE POLICY guesty_listings_read_access
ON public.guesty_listings
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- guesty_bookings
DROP POLICY IF EXISTS guesty_bookings_admin_delete ON public.guesty_bookings;
CREATE POLICY guesty_bookings_admin_delete
ON public.guesty_bookings
FOR DELETE
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS guesty_bookings_admin_update ON public.guesty_bookings;
CREATE POLICY guesty_bookings_admin_update
ON public.guesty_bookings
FOR UPDATE
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS guesty_bookings_admin_write ON public.guesty_bookings;
CREATE POLICY guesty_bookings_admin_write
ON public.guesty_bookings
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS guesty_bookings_read_access ON public.guesty_bookings;
CREATE POLICY guesty_bookings_read_access
ON public.guesty_bookings
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- housekeeping_tasks
DROP POLICY IF EXISTS housekeeping_tasks_staff_read ON public.housekeeping_tasks;
CREATE POLICY housekeeping_tasks_staff_read
ON public.housekeeping_tasks
FOR SELECT
TO authenticated
USING (
  (get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff']))
  OR (assigned_to::text = auth.uid()::text)
);

-- maintenance_tasks
DROP POLICY IF EXISTS "Admins can delete maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Admins can delete maintenance tasks"
ON public.maintenance_tasks
FOR DELETE
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS "Managers can create maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Managers can create maintenance tasks"
ON public.maintenance_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Staff can update assigned tasks" ON public.maintenance_tasks;
CREATE POLICY "Staff can update assigned tasks"
ON public.maintenance_tasks
FOR UPDATE
TO authenticated
USING (
  (get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])) OR (assigned_to = auth.uid())
);

DROP POLICY IF EXISTS "Staff can view maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Staff can view maintenance tasks"
ON public.maintenance_tasks
FOR SELECT
TO authenticated
USING (
  (get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','maintenance_staff'])) OR (assigned_to = auth.uid())
);

-- inventory_items
DROP POLICY IF EXISTS "Managers can manage inventory items" ON public.inventory_items;
CREATE POLICY "Managers can manage inventory items"
ON public.inventory_items
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager'])
);

DROP POLICY IF EXISTS "Staff can view inventory items" ON public.inventory_items;
CREATE POLICY "Staff can view inventory items"
ON public.inventory_items
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'])
);

-- inventory_stock
DROP POLICY IF EXISTS "Managers can delete stock records" ON public.inventory_stock;
CREATE POLICY "Managers can delete stock records"
ON public.inventory_stock
FOR DELETE
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager'])
);

DROP POLICY IF EXISTS "Staff can modify stock levels" ON public.inventory_stock;
CREATE POLICY "Staff can modify stock levels"
ON public.inventory_stock
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'])
);

DROP POLICY IF EXISTS "Staff can update stock levels" ON public.inventory_stock;
CREATE POLICY "Staff can update stock levels"
ON public.inventory_stock
FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff']) AND (last_updated_by = auth.uid())
);

DROP POLICY IF EXISTS "Staff can view inventory stock" ON public.inventory_stock;
CREATE POLICY "Staff can view inventory stock"
ON public.inventory_stock
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'])
);

-- reports
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.reports;
CREATE POLICY "Users can delete their own reports"
ON public.reports
FOR DELETE
TO authenticated
USING (
  auth.uid() = created_by
);

DROP POLICY IF EXISTS "Users can insert their own reports" ON public.reports;
CREATE POLICY "Users can insert their own reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
CREATE POLICY "Users can update their own reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by
);

DROP POLICY IF EXISTS "Users can view reports" ON public.reports;
CREATE POLICY "Users can view reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by
);

-- permissions
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.permissions;
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (
  true
);

-- api_logs (view only for admins)
DROP POLICY IF EXISTS "Admins can view API logs" ON public.api_logs;
CREATE POLICY "Admins can view API logs"
ON public.api_logs
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
);

-- query_performance_log (view only for superadmin)
DROP POLICY IF EXISTS query_performance_superadmin_access ON public.query_performance_log;
CREATE POLICY query_performance_superadmin_access
ON public.query_performance_log
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = 'superadmin'
);

-- system_settings
DROP POLICY IF EXISTS system_settings_admin_restricted ON public.system_settings;
CREATE POLICY system_settings_admin_restricted
ON public.system_settings
FOR ALL
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
)
WITH CHECK (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

-- settings_audit_log
DROP POLICY IF EXISTS settings_audit_superadmin_only ON public.settings_audit_log;
CREATE POLICY settings_audit_superadmin_only
ON public.settings_audit_log
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = 'superadmin'
);

-- tenant_branding
DROP POLICY IF EXISTS "Tenant admins can modify branding" ON public.tenant_branding;
CREATE POLICY "Tenant admins can modify branding"
ON public.tenant_branding
FOR ALL
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['tenant_admin','superadmin'])
)
WITH CHECK (
  get_user_role_safe() = ANY (ARRAY['tenant_admin','superadmin'])
);

DROP POLICY IF EXISTS "Users can view their tenant branding" ON public.tenant_branding;
CREATE POLICY "Users can view their tenant branding"
ON public.tenant_branding
FOR SELECT
TO authenticated
USING (true);

-- tasks
DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;
CREATE POLICY "Managers can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = created_by) AND (tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = ANY (ARRAY['tenant_admin','property_manager']) AND ur.is_active = true
  ))
);

DROP POLICY IF EXISTS "Task updates based on role" ON public.tasks;
CREATE POLICY "Task updates based on role"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  (tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true
  )) AND (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.tenant_id = tasks.tenant_id 
        AND ur.role = ANY (ARRAY['tenant_admin','property_manager']) AND ur.is_active = true
    ) OR (assigned_to = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view tasks in their tenant" ON public.tasks;
CREATE POLICY "Users can view tasks in their tenant"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true
  )
);

-- task_comments
DROP POLICY IF EXISTS "Users can create comments" ON public.task_comments;
CREATE POLICY "Users can create comments"
ON public.task_comments
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND (tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true
  ))
);

DROP POLICY IF EXISTS "Users can create task comments" ON public.task_comments;
CREATE POLICY "Users can create task comments"
ON public.task_comments
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND (get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff','maintenance_staff']))
);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;
CREATE POLICY "Users can update their own comments"
ON public.task_comments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can view comments in their tenant" ON public.task_comments;
CREATE POLICY "Users can view comments in their tenant"
ON public.task_comments
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true
  )
);

DROP POLICY IF EXISTS "Users can view task comments" ON public.task_comments;
CREATE POLICY "Users can view task comments"
ON public.task_comments
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff','maintenance_staff'])
);

-- cleaning_service_definitions
DROP POLICY IF EXISTS "Managers can manage cleaning definitions" ON public.cleaning_service_definitions;
CREATE POLICY "Managers can manage cleaning definitions"
ON public.cleaning_service_definitions
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Staff can view cleaning definitions" ON public.cleaning_service_definitions;
CREATE POLICY "Staff can view cleaning definitions"
ON public.cleaning_service_definitions
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- cleaning_rules
DROP POLICY IF EXISTS "Admins can manage cleaning rules" ON public.cleaning_rules;
CREATE POLICY "Admins can manage cleaning rules"
ON public.cleaning_rules
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Staff can view cleaning rules" ON public.cleaning_rules;
CREATE POLICY "Staff can view cleaning rules"
ON public.cleaning_rules
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- cleaning_schedules
DROP POLICY IF EXISTS "Admins can manage cleaning schedules" ON public.cleaning_schedules;
CREATE POLICY "Admins can manage cleaning schedules"
ON public.cleaning_schedules
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Staff can view cleaning schedules" ON public.cleaning_schedules;
CREATE POLICY "Staff can view cleaning schedules"
ON public.cleaning_schedules
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- rule_actions
DROP POLICY IF EXISTS "Admins can manage rule actions" ON public.rule_actions;
CREATE POLICY "Admins can manage rule actions"
ON public.rule_actions
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Staff can view rule actions" ON public.rule_actions;
CREATE POLICY "Staff can view rule actions"
ON public.rule_actions
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- rule_conditions
DROP POLICY IF EXISTS "Admins can manage rule conditions" ON public.rule_conditions;
CREATE POLICY "Admins can manage rule conditions"
ON public.rule_conditions
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Staff can view rule conditions" ON public.rule_conditions;
CREATE POLICY "Staff can view rule conditions"
ON public.rule_conditions
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- rule_test_results
DROP POLICY IF EXISTS "Admins can manage rule test results" ON public.rule_test_results;
CREATE POLICY "Admins can manage rule test results"
ON public.rule_test_results
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- checklist_templates
DROP POLICY IF EXISTS "Super admins can manage checklist templates" ON public.checklist_templates;
CREATE POLICY "Super admins can manage checklist templates"
ON public.checklist_templates
FOR ALL
TO authenticated
USING (
  get_user_role_safe() = 'superadmin'
)
WITH CHECK (
  get_user_role_safe() = 'superadmin'
);

DROP POLICY IF EXISTS authenticated_users_view_active_templates ON public.checklist_templates;
CREATE POLICY authenticated_users_view_active_templates
ON public.checklist_templates
FOR SELECT
TO authenticated
USING (
  is_active = true
);

-- direct_messages
DROP POLICY IF EXISTS "Allow admins to manage all direct messages" ON public.direct_messages;
CREATE POLICY "Allow admins to manage all direct messages"
ON public.direct_messages
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Allow users to delete their own direct messages" ON public.direct_messages;
CREATE POLICY "Allow users to delete their own direct messages"
ON public.direct_messages
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
);

DROP POLICY IF EXISTS "Allow users to read their direct messages" ON public.direct_messages;
CREATE POLICY "Allow users to read their direct messages"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  (sender_id = auth.uid()) OR (recipient_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
CREATE POLICY "Users can send direct messages"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update their sent messages" ON public.direct_messages;
CREATE POLICY "Users can update their sent messages"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (
  sender_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;
CREATE POLICY "Users can view their direct messages"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  (sender_id = auth.uid()) OR (recipient_id = auth.uid())
);

-- chat_channels
DROP POLICY IF EXISTS "Admins can delete channels" ON public.chat_channels;
CREATE POLICY "Admins can delete channels"
ON public.chat_channels
FOR DELETE
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS "Admins can update channels" ON public.chat_channels;
CREATE POLICY "Admins can update channels"
ON public.chat_channels
FOR UPDATE
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS "Allow users to view channels they have access to" ON public.chat_channels;
CREATE POLICY "Allow users to view channels they have access to"
ON public.chat_channels
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin' OR chat_channels.property_id = ANY (p.secondary_roles))
  )
);

DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.chat_channels;
CREATE POLICY "Authenticated users can create channels"
ON public.chat_channels
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

DROP POLICY IF EXISTS "Users can view chat channels" ON public.chat_channels;
CREATE POLICY "Users can view chat channels"
ON public.chat_channels
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() IS NOT NULL
);

-- inventory_categories
DROP POLICY IF EXISTS "Managers can manage inventory categories" ON public.inventory_categories;
CREATE POLICY "Managers can manage inventory categories"
ON public.inventory_categories
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager'])
);

DROP POLICY IF EXISTS "Staff can view inventory categories" ON public.inventory_categories;
CREATE POLICY "Staff can view inventory categories"
ON public.inventory_categories
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff'])
);

-- order_items
DROP POLICY IF EXISTS "Staff can manage order items" ON public.order_items;
CREATE POLICY "Staff can manage order items"
ON public.order_items
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager'])
);

DROP POLICY IF EXISTS "Staff can view order items" ON public.order_items;
CREATE POLICY "Staff can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','inventory_manager'])
);

-- integration_health (view for staff)
DROP POLICY IF EXISTS "Allow staff to view integration health" ON public.integration_health;
CREATE POLICY "Allow staff to view integration health"
ON public.integration_health
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- guesty_api_usage (admins view)
DROP POLICY IF EXISTS "Admins can view API usage" ON public.guesty_api_usage;
CREATE POLICY "Admins can view API usage"
ON public.guesty_api_usage
FOR SELECT
TO authenticated
USING (
  get_user_role_safe() = ANY (ARRAY['superadmin','administrator'])
);
