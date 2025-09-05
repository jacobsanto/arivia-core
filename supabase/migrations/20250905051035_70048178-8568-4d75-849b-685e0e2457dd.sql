-- Fix Channel Members RLS Policy (Critical) - Remove infinite recursion
-- First, create a security definer function to check channel membership safely
CREATE OR REPLACE FUNCTION public.is_channel_member(_user_id uuid, _channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE user_id = _user_id AND channel_id = _channel_id
  );
$$;

-- Drop and recreate the problematic channel_members policies
DROP POLICY IF EXISTS "View channel members" ON public.channel_members;

CREATE POLICY "View channel members" ON public.channel_members
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_channels 
    WHERE chat_channels.id = channel_members.channel_id 
    AND (
      chat_channels.type = 'public' 
      OR public.is_channel_member(auth.uid(), chat_channels.id)
    )
  )
);

-- Fix function search paths (Medium)
-- Update cleanup_expired_typing_indicators function
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing_indicators()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM public.typing_indicators WHERE expires_at < now();
$$;

-- Update update_conversation_timestamp function  
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE public.direct_conversations
        SET last_message_at = NEW.created_at,
            updated_at = NEW.created_at
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Update update_task_dependencies function
CREATE OR REPLACE FUNCTION public.update_task_dependencies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;