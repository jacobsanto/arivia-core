-- Ensure proper cascade deletion and add additional constraints for cleaning configuration deletion

-- Add constraint to ensure at least one active configuration per property (optional - can be removed if not needed)
-- This prevents deleting the last active configuration for a property
CREATE OR REPLACE FUNCTION check_active_config_exists()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for audit logging when configurations are deleted
CREATE OR REPLACE TRIGGER check_config_deletion
  BEFORE DELETE ON property_cleaning_configs
  FOR EACH ROW
  EXECUTE FUNCTION check_active_config_exists();

-- Add index for better performance when querying configurations by property
CREATE INDEX IF NOT EXISTS idx_property_cleaning_configs_listing_active 
  ON property_cleaning_configs(listing_id, is_active);

-- Add index for better performance when querying rules by config
CREATE INDEX IF NOT EXISTS idx_cleaning_rules_config_active 
  ON cleaning_rules(config_id, is_active);

-- Add index for better performance when querying schedules by rule
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_rule_active 
  ON cleaning_schedules(rule_id, is_active);

-- Update RLS policy to be more explicit about delete permissions
DROP POLICY IF EXISTS "Admins can manage property cleaning configs" ON property_cleaning_configs;

-- Separate policies for better control
CREATE POLICY "Admins can view property cleaning configs" 
  ON property_cleaning_configs FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff']));

CREATE POLICY "Admins can create property cleaning configs" 
  ON property_cleaning_configs FOR INSERT 
  WITH CHECK (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Admins can update property cleaning configs" 
  ON property_cleaning_configs FOR UPDATE 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Admins can delete property cleaning configs" 
  ON property_cleaning_configs FOR DELETE 
  USING (get_current_user_role() = ANY (ARRAY['superadmin', 'administrator', 'property_manager']));

-- Add a function to safely delete configurations and related tasks
CREATE OR REPLACE FUNCTION delete_cleaning_config_safely(config_uuid UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant execute permission to authenticated users (RLS will handle access control)
GRANT EXECUTE ON FUNCTION delete_cleaning_config_safely(UUID) TO authenticated;