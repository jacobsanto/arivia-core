-- Fix function search path security warnings
-- Set explicit search_path for security functions

DROP FUNCTION IF EXISTS public.update_room_status(UUID, TEXT, TEXT, UUID, TEXT);
CREATE OR REPLACE FUNCTION public.update_room_status(
  p_property_id UUID,
  p_room_number TEXT,
  p_new_status TEXT,
  p_task_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS public.update_task_dependencies();
CREATE OR REPLACE FUNCTION public.update_task_dependencies() RETURNS TRIGGER AS $$
BEGIN
  -- Update is_blocked status for tasks that depend on this task
  IF OLD.status != NEW.status AND NEW.status = 'completed' THEN
    UPDATE housekeeping_tasks 
    SET is_blocked = FALSE
    WHERE id IN (
      SELECT td.task_id 
      FROM task_dependencies td 
      WHERE td.depends_on_task_id = NEW.id
    );
  END IF;

  -- Update room status based on task status
  IF OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'in_progress' THEN
        PERFORM update_room_status(NEW.property_id, NEW.room_number, 'cleaning', NEW.id);
      WHEN 'completed' THEN
        PERFORM update_room_status(NEW.property_id, NEW.room_number, 'cleaned', NEW.id);
      ELSE
        -- For other statuses, keep current room status
        NULL;
    END CASE;
  END IF;

  -- Update room status when QC is completed
  IF OLD.qc_status != NEW.qc_status AND NEW.qc_status = 'passed' THEN
    PERFORM update_room_status(NEW.property_id, NEW.room_number, 'inspected', NEW.id, 'QC Passed');
  ELSIF OLD.qc_status != NEW.qc_status AND NEW.qc_status = 'failed' THEN
    PERFORM update_room_status(NEW.property_id, NEW.room_number, 'dirty', NEW.id, 'QC Failed - Requires Rework');
    -- Reopen the task for rework
    NEW.status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS housekeeping_task_status_change ON housekeeping_tasks;
CREATE TRIGGER housekeeping_task_status_change
  BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_dependencies();