
-- Phase 1: Critical Security Fixes

-- First, let's create the system_settings table if it doesn't exist and fix RLS policies
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "system_settings_admin_access" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_superadmin_access" ON public.system_settings;

-- Create secure RLS policies for system_settings
CREATE POLICY "system_settings_superadmin_access" 
ON public.system_settings 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- Create a secure function to get current user role (fixing search_path issue)
CREATE OR REPLACE FUNCTION public.get_current_user_role_secure()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update existing functions to use secure search_path
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'properties', jsonb_build_object(
      'total', COUNT(*),
      'active', COUNT(*) FILTER (WHERE sync_status = 'active')
    ),
    'tasks_today', (
      SELECT COUNT(*) 
      FROM housekeeping_tasks 
      WHERE due_date = CURRENT_DATE AND status != 'completed'
    ),
    'bookings_this_month', (
      SELECT COUNT(*) 
      FROM guesty_bookings 
      WHERE DATE_TRUNC('month', check_in) = DATE_TRUNC('month', CURRENT_DATE)
      AND status = 'confirmed'
    ),
    'revenue_this_month', 0
  ) INTO result
  FROM guesty_listings
  WHERE is_deleted = false;
  
  RETURN result;
END;
$$;

-- Create audit logging table for settings changes
CREATE TABLE IF NOT EXISTS public.settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on settings audit log
ALTER TABLE public.settings_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log access
CREATE POLICY "settings_audit_superadmin_access" 
ON public.settings_audit_log 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- Create function to log settings changes
CREATE OR REPLACE FUNCTION public.log_settings_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.settings_audit_log (
    user_id,
    category,
    action,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.category, OLD.category),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE OLD.settings END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN NEW.settings ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for settings audit logging
DROP TRIGGER IF EXISTS settings_audit_trigger ON public.system_settings;
CREATE TRIGGER settings_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_settings_change();

-- Create settings validation function
CREATE OR REPLACE FUNCTION public.validate_settings(category TEXT, settings JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Basic validation based on category
  CASE category
    WHEN 'general' THEN
      -- Validate general settings
      IF NOT (settings ? 'site_name' AND settings ? 'timezone') THEN
        RAISE EXCEPTION 'General settings must include site_name and timezone';
      END IF;
    WHEN 'security' THEN
      -- Validate security settings
      IF NOT (settings ? 'loginAttempts' AND settings ? 'sessionDuration') THEN
        RAISE EXCEPTION 'Security settings must include loginAttempts and sessionDuration';
      END IF;
    WHEN 'user-management' THEN
      -- Validate user management settings
      IF NOT (settings ? 'passwordMinLength' AND settings ? 'sessionTimeout') THEN
        RAISE EXCEPTION 'User management settings must include passwordMinLength and sessionTimeout';
      END IF;
    -- Add more validation rules as needed
  END CASE;
  
  RETURN TRUE;
END;
$$;

-- Create settings backup table
CREATE TABLE IF NOT EXISTS public.settings_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name TEXT NOT NULL,
  settings_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on settings backups
ALTER TABLE public.settings_backups ENABLE ROW LEVEL SECURITY;

-- Create policy for settings backups
CREATE POLICY "settings_backups_superadmin_access" 
ON public.settings_backups 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- Create function to backup all settings
CREATE OR REPLACE FUNCTION public.backup_all_settings(backup_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  backup_id UUID;
  settings_data JSONB;
BEGIN
  -- Collect all current settings
  SELECT jsonb_object_agg(category, settings) INTO settings_data
  FROM public.system_settings;
  
  -- Create backup record
  INSERT INTO public.settings_backups (backup_name, settings_data, created_by)
  VALUES (backup_name, settings_data, auth.uid())
  RETURNING id INTO backup_id;
  
  RETURN backup_id;
END;
$$;

-- Create function to restore settings from backup
CREATE OR REPLACE FUNCTION public.restore_settings_backup(backup_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  backup_data JSONB;
  category_key TEXT;
  category_settings JSONB;
BEGIN
  -- Get backup data
  SELECT settings_data INTO backup_data
  FROM public.settings_backups
  WHERE id = backup_id;
  
  IF backup_data IS NULL THEN
    RAISE EXCEPTION 'Backup not found';
  END IF;
  
  -- Restore each category
  FOR category_key, category_settings IN SELECT * FROM jsonb_each(backup_data)
  LOOP
    -- Upsert settings for each category
    INSERT INTO public.system_settings (category, settings)
    VALUES (category_key, category_settings)
    ON CONFLICT (category) DO UPDATE SET
      settings = EXCLUDED.settings,
      updated_at = now();
  END LOOP;
  
  -- Mark backup as restored
  UPDATE public.settings_backups
  SET restored_at = now(), restored_by = auth.uid()
  WHERE id = backup_id;
  
  RETURN TRUE;
END;
$$;
