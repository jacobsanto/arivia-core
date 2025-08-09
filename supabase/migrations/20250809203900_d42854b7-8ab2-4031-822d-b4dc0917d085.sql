-- Phase 1: Restrict remaining policies to authenticated users without changing behavior
-- We only alter policy role lists to `TO authenticated`, preserving USING / WITH CHECK logic

-- audit_logs
ALTER POLICY audit_logs_superadmin_only ON public.audit_logs TO authenticated;

-- bookings (preserve existing logic)
ALTER POLICY "Admins can delete bookings" ON public.bookings TO authenticated;
ALTER POLICY "Property managers can update bookings" ON public.bookings TO authenticated;
ALTER POLICY "Property managers can view relevant bookings" ON public.bookings TO authenticated;

-- chat_messages
ALTER POLICY "Allow admins to manage all messages" ON public.chat_messages TO authenticated;
ALTER POLICY "Allow users to delete their own messages" ON public.chat_messages TO authenticated;
ALTER POLICY "Allow users to read messages from accessible channels" ON public.chat_messages TO authenticated;
ALTER POLICY "Allow users to update their own messages" ON public.chat_messages TO authenticated;

-- cleaning_actions
ALTER POLICY "Admins can manage cleaning actions" ON public.cleaning_actions TO authenticated;
ALTER POLICY "Staff can view cleaning actions" ON public.cleaning_actions TO authenticated;

-- cleaning_templates
ALTER POLICY "Admins can manage cleaning templates" ON public.cleaning_templates TO authenticated;
ALTER POLICY "Staff can view cleaning templates" ON public.cleaning_templates TO authenticated;

-- configuration_assignments
ALTER POLICY "Admins can manage configuration assignments" ON public.configuration_assignments TO authenticated;
ALTER POLICY "Staff can view configuration assignments" ON public.configuration_assignments TO authenticated;

-- damage_report_media
ALTER POLICY "Users can view damage report media" ON public.damage_report_media TO authenticated;

-- damage_reports
ALTER POLICY "Admin and assigned users can update damage reports" ON public.damage_reports TO authenticated;
ALTER POLICY "Users can view damage reports they created or are assigned to" ON public.damage_reports TO authenticated;

-- external_integrations
ALTER POLICY "Admins can manage all integrations" ON public.external_integrations TO authenticated;
ALTER POLICY "Staff can view integrations" ON public.external_integrations TO authenticated;

-- guesty_api_usage (already updated for SELECT - safe to ensure)
ALTER POLICY "Admins can view API usage" ON public.guesty_api_usage TO authenticated;

-- integration_health (already updated - ensure)
ALTER POLICY "Allow staff to view integration health" ON public.integration_health TO authenticated;

-- inventory_categories (already updated - ensure)
ALTER POLICY "Managers can manage inventory categories" ON public.inventory_categories TO authenticated;
ALTER POLICY "Staff can view inventory categories" ON public.inventory_categories TO authenticated;

-- inventory_usage
ALTER POLICY "Managers can delete inventory usage" ON public.inventory_usage TO authenticated;
ALTER POLICY "Managers can modify inventory usage" ON public.inventory_usage TO authenticated;
ALTER POLICY "Managers can update inventory usage" ON public.inventory_usage TO authenticated;
ALTER POLICY "Staff can view inventory usage" ON public.inventory_usage TO authenticated;

-- orders
ALTER POLICY "Admins can delete orders" ON public.orders TO authenticated;
ALTER POLICY "Managers can update orders" ON public.orders TO authenticated;
ALTER POLICY "Staff can view orders" ON public.orders TO authenticated;

-- permissions (already updated - ensure)
ALTER POLICY "Admins can manage permissions" ON public.permissions TO authenticated;
ALTER POLICY "Authenticated users can view permissions" ON public.permissions TO authenticated;

-- profiles (sensitive - restrict to authenticated only)
ALTER POLICY "Authenticated users view own profile" ON public.profiles TO authenticated;
ALTER POLICY authenticated_users_can_view_basic_profiles ON public.profiles TO authenticated;
ALTER POLICY profiles_select_admin_safe ON public.profiles TO authenticated;
ALTER POLICY profiles_select_own ON public.profiles TO authenticated;
ALTER POLICY profiles_update_admin_safe ON public.profiles TO authenticated;
ALTER POLICY profiles_update_own ON public.profiles TO authenticated;
ALTER POLICY users_can_update_own_profile ON public.profiles TO authenticated;
ALTER POLICY users_can_view_own_profile ON public.profiles TO authenticated;

-- property_cleaning_configs
ALTER POLICY "Admins can delete property cleaning configs" ON public.property_cleaning_configs TO authenticated;
ALTER POLICY "Admins can update property cleaning configs" ON public.property_cleaning_configs TO authenticated;
ALTER POLICY "Admins can view property cleaning configs" ON public.property_cleaning_configs TO authenticated;
ALTER POLICY "Staff can view property cleaning configs" ON public.property_cleaning_configs TO authenticated;

-- query_performance_log (ensure)
ALTER POLICY query_performance_superadmin_access ON public.query_performance_log TO authenticated;

-- reports (ensure)
ALTER POLICY "Users can delete their own reports" ON public.reports TO authenticated;
ALTER POLICY "Users can insert their own reports" ON public.reports TO authenticated;
ALTER POLICY "Users can update their own reports" ON public.reports TO authenticated;
ALTER POLICY "Users can view reports" ON public.reports TO authenticated;

-- role_permissions
ALTER POLICY "Admins can manage role permissions" ON public.role_permissions TO authenticated;
ALTER POLICY "Users can view role permissions in their tenant" ON public.role_permissions TO authenticated;

-- roles
ALTER POLICY "Admins can manage roles" ON public.roles TO authenticated;
ALTER POLICY "Users can view roles in their tenant" ON public.roles TO authenticated;

-- rule_actions (ensure)
ALTER POLICY "Admins can manage rule actions" ON public.rule_actions TO authenticated;
ALTER POLICY "Staff can view rule actions" ON public.rule_actions TO authenticated;

-- rule_assignments
ALTER POLICY "Admins can manage rule assignments" ON public.rule_assignments TO authenticated;
ALTER POLICY "Staff can view rule assignments" ON public.rule_assignments TO authenticated;

-- rule_conditions (ensure)
ALTER POLICY "Admins can manage rule conditions" ON public.rule_conditions TO authenticated;
ALTER POLICY "Staff can view rule conditions" ON public.rule_conditions TO authenticated;

-- rule_test_results (ensure)
ALTER POLICY "Admins can manage rule test results" ON public.rule_test_results TO authenticated;

-- security_events
ALTER POLICY security_events_superadmin_only ON public.security_events TO authenticated;

-- settings_audit_log (ensure)
ALTER POLICY settings_audit_superadmin_only ON public.settings_audit_log TO authenticated;

-- settings_backups
ALTER POLICY settings_backups_superadmin_access ON public.settings_backups TO authenticated;

-- sync_logs
ALTER POLICY "Admins can manage sync logs" ON public.sync_logs TO authenticated;
ALTER POLICY "Admins can view sync logs" ON public.sync_logs TO authenticated;

-- system_permissions
ALTER POLICY system_permissions_superadmin_only ON public.system_permissions TO authenticated;

-- system_settings (ensure)
ALTER POLICY system_settings_admin_restricted ON public.system_settings TO authenticated;

-- task_attachments
ALTER POLICY "Users can view task attachments" ON public.task_attachments TO authenticated;

-- task_templates
ALTER POLICY "Managers can manage templates" ON public.task_templates TO authenticated;
ALTER POLICY "Users can view templates in their tenant" ON public.task_templates TO authenticated;

-- tasks (ensure)
ALTER POLICY "Managers can create tasks" ON public.tasks TO authenticated;
ALTER POLICY "Task updates based on role" ON public.tasks TO authenticated;
ALTER POLICY "Users can view tasks in their tenant" ON public.tasks TO authenticated;

-- tenant_branding (ensure)
ALTER POLICY "Tenant admins can modify branding" ON public.tenant_branding TO authenticated;
ALTER POLICY "Users can view their tenant branding" ON public.tenant_branding TO authenticated;

-- user_activity_log
ALTER POLICY user_activity_admin_access ON public.user_activity_log TO authenticated;

-- user_roles
ALTER POLICY "Admins can manage user roles" ON public.user_roles TO authenticated;
ALTER POLICY "Users can view roles in their tenant" ON public.user_roles TO authenticated;
ALTER POLICY "Users can view their own roles" ON public.user_roles TO authenticated;

-- user_settings
ALTER POLICY "Users can manage their own settings" ON public.user_settings TO authenticated;
ALTER POLICY "Users can view their own settings" ON public.user_settings TO authenticated;

-- vendors
ALTER POLICY "Managers can manage vendors" ON public.vendors TO authenticated;
ALTER POLICY "Staff can view vendors" ON public.vendors TO authenticated;

-- webhook_endpoints
ALTER POLICY "Admins can manage webhook endpoints" ON public.webhook_endpoints TO authenticated;

-- webhook_health
ALTER POLICY "Admins can view webhook health" ON public.webhook_health TO authenticated;
