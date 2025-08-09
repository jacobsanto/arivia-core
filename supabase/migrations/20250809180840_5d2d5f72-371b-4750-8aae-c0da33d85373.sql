BEGIN;

-- Fix linter: set secure search_path on functions missing it
CREATE OR REPLACE FUNCTION public.check_active_config_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- If we're deleting an active configuration
  IF OLD.is_active = true THEN
    -- Check if there are other active configurations for this property
    IF NOT EXISTS (
      SELECT 1 FROM property_cleaning_configs 
      WHERE listing_id = OLD.listing_id 
        AND is_active = true 
        AND id != OLD.id
    ) THEN
      -- Allow deletion but log a warning
      INSERT INTO audit_logs (table_name, action, record_id, user_id, created_at)
      VALUES ('property_cleaning_configs', 'DELETE_LAST_ACTIVE', OLD.id::text, auth.uid(), NOW());
    END IF;
  END IF;
  
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_cleaning_config_safely(config_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  config_record RECORD;
  rules_count INTEGER;
  schedules_count INTEGER;
  result jsonb;
BEGIN
  -- Get configuration details
  SELECT * INTO config_record 
  FROM property_cleaning_configs 
  WHERE id = config_uuid;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Configuration not found');
  END IF;
  
  -- Count related records that will be deleted
  SELECT COUNT(*) INTO rules_count 
  FROM cleaning_rules 
  WHERE config_id = config_uuid;
  
  SELECT COUNT(*) INTO schedules_count 
  FROM cleaning_schedules cs
  JOIN cleaning_rules cr ON cs.rule_id = cr.id
  WHERE cr.config_id = config_uuid;
  
  -- Perform the deletion (CASCADE will handle related records)
  DELETE FROM property_cleaning_configs WHERE id = config_uuid;
  
  -- Return summary
  result := jsonb_build_object(
    'success', true,
    'deleted_config', config_record.config_name,
    'deleted_rules', rules_count,
    'deleted_schedules', schedules_count,
    'property_id', config_record.listing_id
  );
  
  RETURN result;
END;
$function$;

-- Restrict policies still assigned to PUBLIC to safer roles
ALTER POLICY "Admins can delete bookings" ON public.bookings TO authenticated;
ALTER POLICY "Property managers can create bookings" ON public.bookings TO authenticated;
ALTER POLICY "Property managers can update bookings" ON public.bookings TO authenticated;
ALTER POLICY "Property managers can view relevant bookings" ON public.bookings TO authenticated;

ALTER POLICY "Admins can manage cleaning actions" ON public.cleaning_actions TO authenticated;
ALTER POLICY "Staff can view cleaning actions" ON public.cleaning_actions TO authenticated;

ALTER POLICY "Admins can manage cleaning templates" ON public.cleaning_templates TO authenticated;
ALTER POLICY "Staff can view cleaning templates" ON public.cleaning_templates TO authenticated;

ALTER POLICY "Users can create damage reports" ON public.damage_reports TO authenticated;

ALTER POLICY "System can log API usage" ON public.guesty_api_usage TO service_role;

ALTER POLICY "housekeeping_tasks_manager_insert" ON public.housekeeping_tasks TO authenticated;

ALTER POLICY "Staff can create inventory usage records" ON public.inventory_usage TO authenticated;

ALTER POLICY "Staff can create orders" ON public.orders TO authenticated;

ALTER POLICY "profiles_insert_own" ON public.profiles TO authenticated;
ALTER POLICY "users_can_insert_own_profile" ON public.profiles TO authenticated;

ALTER POLICY "System can create sync logs" ON public.sync_logs TO service_role;

ALTER POLICY "Users can upload task attachments" ON public.task_attachments TO authenticated;

COMMIT;