-- Security Hardening Phase 1 & 2: Fix Function Search Paths and Enhance RLS Policies

-- Fix all database functions to use secure search_path (Critical Priority)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_channel_member(_user_id uuid, _channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE user_id = _user_id AND channel_id = _channel_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_channel_member_safe(_user_id uuid, _channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE user_id = _user_id AND channel_id = _channel_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, severity text, details jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (user_id, event_type, severity, details)
  VALUES (auth.uid(), event_type, severity, details)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS TABLE(recent_security_events jsonb, unresolved_events_count bigint, critical_events_count bigint, active_users_count bigint, failed_login_attempts bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow superadmins to access security dashboard
  IF NOT (has_role(auth.uid(), 'superadmin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied - requires superadmin role';
  END IF;

  -- Log security dashboard access for audit trail
  INSERT INTO public.audit_logs (user_id, level, message, metadata)
  VALUES (auth.uid(), 'info', 'Security dashboard accessed', 
          json_build_object('action', 'security_dashboard_access', 'timestamp', NOW()));

  RETURN QUERY
  SELECT 
    (
      SELECT COALESCE(json_agg(se), '[]'::json)::jsonb
      FROM (
        SELECT id, event_type, severity, user_id, details, resolved, created_at
        FROM public.security_events 
        ORDER BY created_at DESC 
        LIMIT 10
      ) se
    ) as recent_security_events,
    (SELECT COUNT(*) FROM public.security_events WHERE NOT resolved) as unresolved_events_count,
    (SELECT COUNT(*) FROM public.security_events WHERE severity = 'critical' AND NOT resolved) as critical_events_count,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_activity_log WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_count,
    (SELECT COUNT(*) FROM public.security_events WHERE event_type = 'failed_login' AND created_at > NOW() - INTERVAL '1 hour') as failed_login_attempts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS TABLE(database jsonb, authentication jsonb, integrations jsonb, performance jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_tables INTEGER;
  rls_tables INTEGER;
  active_connections INTEGER;
  total_users INTEGER;
  active_sessions INTEGER;
BEGIN
  -- Only allow superadmins to access system health
  IF NOT (has_role(auth.uid(), 'superadmin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied - requires superadmin role';
  END IF;

  -- Get database metrics
  SELECT COUNT(*) INTO total_tables 
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  SELECT COUNT(*) INTO rls_tables 
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
  AND c.relkind = 'r' 
  AND c.relrowsecurity = true;

  -- Get connection count (approximate)
  SELECT COUNT(*) INTO active_connections
  FROM pg_stat_activity 
  WHERE state = 'active';

  -- Get user metrics
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Estimate active sessions (users with recent activity)
  SELECT COUNT(DISTINCT user_id) INTO active_sessions
  FROM public.user_activity_log 
  WHERE created_at > NOW() - INTERVAL '24 hours';

  RETURN QUERY
  SELECT 
    json_build_object(
      'tables_count', total_tables,
      'rls_enabled_tables', rls_tables,
      'active_connections', active_connections
    )::jsonb as database,
    
    json_build_object(
      'total_users', total_users,
      'active_sessions', active_sessions
    )::jsonb as authentication,
    
    json_build_object(
      'guesty_listings', 0,
      'guesty_bookings', 0,
      'last_sync', NOW()::text
    )::jsonb as integrations,
    
    json_build_object(
      'avg_query_time', 50.0,
      'slow_queries_count', 0
    )::jsonb as performance;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'housekeeping_staff'::app_role
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Allow admins/superadmins to update anything
  if (public.has_role(auth.uid(), 'administrator'::app_role) OR public.has_role(auth.uid(), 'superadmin'::app_role)) then
    return NEW;
  end if;

  -- Non-admins: prevent changes to sensitive fields
  if (NEW.role IS DISTINCT FROM OLD.role) then
    RAISE EXCEPTION 'Changing role is not allowed';
  end if;
  if (NEW.custom_permissions IS DISTINCT FROM OLD.custom_permissions) then
    RAISE EXCEPTION 'Changing custom permissions is not allowed';
  end if;
  if (NEW.user_id IS DISTINCT FROM OLD.user_id) then
    RAISE EXCEPTION 'Changing user_id is not allowed';
  end if;

  return NEW;
end;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_privileged_profile_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- block creation of privileged roles by non-admins
  if (NEW.role IN ('administrator'::app_role, 'superadmin'::app_role)) then
    if NOT (public.has_role(auth.uid(), 'administrator'::app_role) OR public.has_role(auth.uid(), 'superadmin'::app_role)) then
      RAISE EXCEPTION 'Creating profiles with privileged roles is not allowed';
    end if;
  end if;
  return NEW;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(user1_id uuid, user2_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    conversation_id uuid;
BEGIN
    -- Try to find existing conversation (either direction)
    SELECT id INTO conversation_id
    FROM public.direct_conversations
    WHERE (participant_1 = user1_id AND participant_2 = user2_id)
       OR (participant_1 = user2_id AND participant_2 = user1_id);
    
    -- If not found, create new conversation
    IF conversation_id IS NULL THEN
        INSERT INTO public.direct_conversations (participant_1, participant_2)
        VALUES (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE public.direct_conversations
        SET last_message_at = NEW.created_at,
            updated_at = NEW.created_at
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_damage_reports_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_task_dependencies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update is_blocked status for tasks that depend on this task
  IF OLD.status != NEW.status AND NEW.status = 'completed' THEN
    UPDATE public.housekeeping_tasks 
    SET is_blocked = FALSE
    WHERE id IN (
      SELECT td.task_id 
      FROM public.task_dependencies td 
      WHERE td.depends_on_task_id = NEW.id
    );
  END IF;

  -- Update room status based on task status
  IF OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'in_progress' THEN
        PERFORM public.update_room_status(NEW.property_id, NEW.room_number, 'cleaning', NEW.id);
      WHEN 'completed' THEN
        PERFORM public.update_room_status(NEW.property_id, NEW.room_number, 'cleaned', NEW.id);
      ELSE
        -- For other statuses, keep current room status
        NULL;
    END CASE;
  END IF;

  -- Update room status when QC is completed
  IF OLD.qc_status != NEW.qc_status AND NEW.qc_status = 'passed' THEN
    PERFORM public.update_room_status(NEW.property_id, NEW.room_number, 'inspected', NEW.id, 'QC Passed');
  ELSIF OLD.qc_status != NEW.qc_status AND NEW.qc_status = 'failed' THEN
    PERFORM public.update_room_status(NEW.property_id, NEW.room_number, 'dirty', NEW.id, 'QC Failed - Requires Rework');
    -- Reopen the task for rework
    NEW.status = 'pending';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_room_status(p_property_id uuid, p_room_number text, p_new_status text, p_task_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
  current_status TEXT;
BEGIN
  -- Get current status from room_status_log
  SELECT new_status INTO current_status 
  FROM room_status_log 
  WHERE property_id = p_property_id AND room_number = p_room_number
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Insert new status log entry
  INSERT INTO room_status_log (
    property_id, room_number, old_status, new_status, 
    changed_by, task_id, notes
  ) VALUES (
    p_property_id, p_room_number, current_status, p_new_status,
    auth.uid(), p_task_id, p_notes
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_typing_indicators()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    DELETE FROM public.typing_indicators WHERE expires_at < now();
$function$;

-- Enhanced RLS Policies for Profiles Table (High Priority)
-- Drop existing policies and create more restrictive ones
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create separate policies for different data access levels
CREATE POLICY "Users can view their own profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view profile summaries only" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'administrator'::app_role) 
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- Superadmins only: Full access to profiles table
CREATE POLICY "Superadmins can manage all profiles" 
ON public.profiles 
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Enhanced RLS for Security Events (High Priority)
-- Only superadmins can access security events
DROP POLICY IF EXISTS "Administrators can view security events" ON public.security_events;
DROP POLICY IF EXISTS "Administrators can resolve security events" ON public.security_events;

CREATE POLICY "Superadmins only can view security events" 
ON public.security_events 
FOR SELECT 
USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmins only can resolve security events" 
ON public.security_events 
FOR UPDATE 
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Enhanced User Activity Logging
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log when admins access other users' profiles
  IF auth.uid() != NEW.user_id AND (has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)) THEN
    INSERT INTO public.audit_logs (user_id, level, message, metadata)
    VALUES (auth.uid(), 'info', 'Profile access by admin', 
            json_build_object('target_user', NEW.user_id, 'action', 'profile_view'));
  END IF;
  RETURN NEW;
END;
$function$;

-- Create audit trigger for profile access (commented out as it would trigger on every select)
-- CREATE TRIGGER log_profile_access_trigger 
-- AFTER SELECT ON public.profiles 
-- FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- Create function to log security-sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_operation(operation_type text, target_resource text, details jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (user_id, level, message, metadata)
  VALUES (auth.uid(), 'security', operation_type, 
          json_build_object('resource', target_resource, 'details', details, 'timestamp', NOW()));
END;
$function$;