-- Security Fix: Add secure search_path to all database functions
-- This prevents search path injection attacks

-- 1. Update get_or_create_direct_conversation function
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

-- 2. Update prevent_profile_escalation function
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

-- 3. Update update_damage_reports_updated_at function
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

-- 4. Update update_room_status function
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

-- 5. Update update_task_dependencies function
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

-- 6. Update update_updated_at_column function
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