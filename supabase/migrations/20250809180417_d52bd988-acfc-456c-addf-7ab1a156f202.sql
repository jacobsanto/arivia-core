BEGIN;

-- Helper to safely set policy roles only if the policy exists
CREATE OR REPLACE FUNCTION public._set_policy_roles(
  _schemaname text,
  _tablename text,
  _policyname text,
  _roles text[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = _schemaname
      AND tablename  = _tablename
      AND policyname = _policyname
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO %s',
      _policyname,
      _schemaname,
      _tablename,
      array_to_string(ARRAY(SELECT quote_ident(r) FROM unnest(_roles) r), ', ')
    );
  END IF;
END;
$$;

-- api_logs
SELECT public._set_policy_roles('public','api_logs','Admins can view API logs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','api_logs','System can create API logs', ARRAY['service_role']);

-- audit_logs
SELECT public._set_policy_roles('public','audit_logs','audit_logs_superadmin_only', ARRAY['authenticated']);

-- chat_channels
SELECT public._set_policy_roles('public','chat_channels','Admins can delete channels', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_channels','Admins can update channels', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_channels','Allow users to view channels they have access to', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_channels','Authenticated users can create channels', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_channels','Users can view chat channels', ARRAY['authenticated']);

-- chat_messages
SELECT public._set_policy_roles('public','chat_messages','Allow admins to manage all messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_messages','Allow users to delete their own messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_messages','Allow users to read messages from accessible channels', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','chat_messages','Allow users to update their own messages', ARRAY['authenticated']);

-- checklist_templates
SELECT public._set_policy_roles('public','checklist_templates','Super admins can manage checklist templates', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','checklist_templates','authenticated_users_view_active_templates', ARRAY['authenticated']);

-- cleaning_rules
SELECT public._set_policy_roles('public','cleaning_rules','Admins can manage cleaning rules', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','cleaning_rules','Staff can view cleaning rules', ARRAY['authenticated']);

-- cleaning_schedules
SELECT public._set_policy_roles('public','cleaning_schedules','Admins can manage cleaning schedules', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','cleaning_schedules','Staff can view cleaning schedules', ARRAY['authenticated']);

-- cleaning_service_definitions
SELECT public._set_policy_roles('public','cleaning_service_definitions','Managers can manage cleaning definitions', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','cleaning_service_definitions','Staff can view cleaning definitions', ARRAY['authenticated']);

-- configuration_assignments
SELECT public._set_policy_roles('public','configuration_assignments','Admins can manage configuration assignments', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','configuration_assignments','Staff can view configuration assignments', ARRAY['authenticated']);

-- damage_report_media
SELECT public._set_policy_roles('public','damage_report_media','Users can view damage report media', ARRAY['authenticated']);

-- damage_reports
SELECT public._set_policy_roles('public','damage_reports','Admin and assigned users can update damage reports', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','damage_reports','Users can view damage reports they created or are assigned to', ARRAY['authenticated']);

-- direct_messages
SELECT public._set_policy_roles('public','direct_messages','Allow admins to manage all direct messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','direct_messages','Allow users to delete their own direct messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','direct_messages','Allow users to read their direct messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','direct_messages','Users can send direct messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','direct_messages','Users can update their sent messages', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','direct_messages','Users can view their direct messages', ARRAY['authenticated']);

-- external_integrations
SELECT public._set_policy_roles('public','external_integrations','Admins can manage all integrations', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','external_integrations','Staff can view integrations', ARRAY['authenticated']);

-- guesty_api_usage
SELECT public._set_policy_roles('public','guesty_api_usage','Admins can view API usage', ARRAY['authenticated']);

-- guesty_bookings
SELECT public._set_policy_roles('public','guesty_bookings','guesty_bookings_admin_delete', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','guesty_bookings','guesty_bookings_admin_update', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','guesty_bookings','guesty_bookings_admin_write', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','guesty_bookings','guesty_bookings_read_access', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','guesty_bookings','guesty_bookings_service_role_all', ARRAY['service_role']);

-- guesty_listings
SELECT public._set_policy_roles('public','guesty_listings','guesty_listings_read_access', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','guesty_listings','guesty_listings_service_role_all', ARRAY['service_role']);

-- housekeeping_tasks
SELECT public._set_policy_roles('public','housekeeping_tasks','housekeeping_tasks_staff_read', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','housekeeping_tasks','housekeeping_tasks_staff_update', ARRAY['authenticated']);

-- integration_configs
SELECT public._set_policy_roles('public','integration_configs','Admins can manage integration configs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','integration_configs','Users can view integration configs', ARRAY['authenticated']);

-- integration_health
SELECT public._set_policy_roles('public','integration_health','Allow staff to view integration health', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','integration_health','integration_health_service_and_admin', ARRAY['service_role','authenticated']);

-- integration_tokens
SELECT public._set_policy_roles('public','integration_tokens','integration_tokens_service_only', ARRAY['service_role']);

-- inventory_categories
SELECT public._set_policy_roles('public','inventory_categories','Managers can manage inventory categories', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_categories','Staff can view inventory categories', ARRAY['authenticated']);

-- inventory_items
SELECT public._set_policy_roles('public','inventory_items','Managers can manage inventory items', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_items','Staff can view inventory items', ARRAY['authenticated']);

-- inventory_stock
SELECT public._set_policy_roles('public','inventory_stock','Managers can delete stock records', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_stock','Staff can modify stock levels', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_stock','Staff can update stock levels', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_stock','Staff can view inventory stock', ARRAY['authenticated']);

-- inventory_usage
SELECT public._set_policy_roles('public','inventory_usage','Managers can delete inventory usage', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_usage','Managers can modify inventory usage', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_usage','Managers can update inventory usage', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','inventory_usage','Staff can view inventory usage', ARRAY['authenticated']);

-- maintenance_tasks
SELECT public._set_policy_roles('public','maintenance_tasks','Admins can delete maintenance tasks', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','maintenance_tasks','Managers can create maintenance tasks', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','maintenance_tasks','Staff can update assigned tasks', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','maintenance_tasks','Staff can view maintenance tasks', ARRAY['authenticated']);

-- order_items
SELECT public._set_policy_roles('public','order_items','Staff can manage order items', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','order_items','Staff can view order items', ARRAY['authenticated']);

-- orders
SELECT public._set_policy_roles('public','orders','Admins can delete orders', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','orders','Managers can update orders', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','orders','Staff can view orders', ARRAY['authenticated']);

-- permissions
SELECT public._set_policy_roles('public','permissions','Authenticated users can view permissions', ARRAY['authenticated']);

-- profiles (set all common policies to authenticated if present)
SELECT public._set_policy_roles('public','profiles','Authenticated users view own profile', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','authenticated_users_can_view_basic_profiles', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','profiles_select_admin_safe', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','profiles_select_own', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','profiles_update_admin_safe', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','profiles_update_own', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','users_can_update_own_profile', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','users_can_view_own_profile', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','profiles','service_role_full_access', ARRAY['service_role']);

-- properties
SELECT public._set_policy_roles('public','properties','Properties are viewable by staff', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','properties','Property managers can manage properties', ARRAY['authenticated']);

-- property_cleaning_configs
SELECT public._set_policy_roles('public','property_cleaning_configs','Admins can create property cleaning configs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','property_cleaning_configs','Admins can delete property cleaning configs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','property_cleaning_configs','Admins can update property cleaning configs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','property_cleaning_configs','Admins can view property cleaning configs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','property_cleaning_configs','Staff can view property cleaning configs', ARRAY['authenticated']);

-- query_performance_log
SELECT public._set_policy_roles('public','query_performance_log','query_performance_log_service_role_all', ARRAY['service_role']);
SELECT public._set_policy_roles('public','query_performance_log','query_performance_service_insert', ARRAY['service_role']);
SELECT public._set_policy_roles('public','query_performance_log','query_performance_superadmin_access', ARRAY['authenticated']);

-- reports
SELECT public._set_policy_roles('public','reports','Users can delete their own reports', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','reports','Users can insert their own reports', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','reports','Users can update their own reports', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','reports','Users can view reports', ARRAY['authenticated']);

-- role_permissions, roles
SELECT public._set_policy_roles('public','role_permissions','Admins can manage role permissions', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','role_permissions','Users can view role permissions in their tenant', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','roles','Admins can manage roles', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','roles','Users can view roles in their tenant', ARRAY['authenticated']);

-- rule_* tables
SELECT public._set_policy_roles('public','rule_actions','Admins can manage rule actions', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','rule_actions','Staff can view rule actions', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','rule_assignments','Admins can manage rule assignments', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','rule_assignments','Staff can view rule assignments', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','rule_conditions','Admins can manage rule conditions', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','rule_conditions','Staff can view rule conditions', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','rule_test_results','Admins can manage rule test results', ARRAY['authenticated']);

-- security_events
SELECT public._set_policy_roles('public','security_events','security_events_superadmin_only', ARRAY['authenticated']);

-- settings_* tables
SELECT public._set_policy_roles('public','settings_audit_log','settings_audit_superadmin_only', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','settings_backups','settings_backups_superadmin_access', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','system_permissions','system_permissions_superadmin_only', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','system_settings','system_settings_admin_restricted', ARRAY['authenticated']);

-- sync_logs
SELECT public._set_policy_roles('public','sync_logs','Admins can manage sync logs', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','sync_logs','Admins can view sync logs', ARRAY['authenticated']);

-- task_attachments
SELECT public._set_policy_roles('public','task_attachments','Users can view task attachments', ARRAY['authenticated']);

-- task_comments
SELECT public._set_policy_roles('public','task_comments','Users can create comments', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','task_comments','Users can create task comments', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','task_comments','Users can update their own comments', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','task_comments','Users can view comments in their tenant', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','task_comments','Users can view task comments', ARRAY['authenticated']);

-- task_templates
SELECT public._set_policy_roles('public','task_templates','Managers can manage templates', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','task_templates','Users can view templates in their tenant', ARRAY['authenticated']);

-- tasks
SELECT public._set_policy_roles('public','tasks','Managers can create tasks', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','tasks','Task updates based on role', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','tasks','Users can view tasks in their tenant', ARRAY['authenticated']);

-- tenant_branding (view policy)
SELECT public._set_policy_roles('public','tenant_branding','Users can view their tenant branding', ARRAY['authenticated']);

-- user_* tables
SELECT public._set_policy_roles('public','user_activity_log','user_activity_admin_access', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','user_roles','Admins can manage user roles', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','user_roles','Users can view roles in their tenant', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','user_roles','Users can view their own roles', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','user_settings','Users can manage their own settings', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','user_settings','Users can view their own settings', ARRAY['authenticated']);

-- vendors
SELECT public._set_policy_roles('public','vendors','Managers can manage vendors', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','vendors','Staff can view vendors', ARRAY['authenticated']);

-- webhook_* tables
SELECT public._set_policy_roles('public','webhook_endpoints','Admins can manage webhook endpoints', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','webhook_health','Admins can view webhook health', ARRAY['authenticated']);
SELECT public._set_policy_roles('public','webhook_health','System can manage webhook health', ARRAY['service_role']);

-- Clean up helper
DROP FUNCTION public._set_policy_roles(text, text, text, text[]);

COMMIT;