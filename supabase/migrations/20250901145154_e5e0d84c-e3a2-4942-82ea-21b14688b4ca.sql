-- Enhanced Housekeeping Task System
-- Create comprehensive task management with QC, dependencies, and rich metadata

-- Add missing columns to existing housekeeping_tasks table
ALTER TABLE housekeeping_tasks 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS property_id UUID,
ADD COLUMN IF NOT EXISTS room_number TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_checkin TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS guest_checkout TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS qc_status TEXT DEFAULT 'pending' CHECK (qc_status IN ('pending', 'passed', 'failed')),
ADD COLUMN IF NOT EXISTS qc_notes TEXT,
ADD COLUMN IF NOT EXISTS qc_reviewed_by UUID,
ADD COLUMN IF NOT EXISTS qc_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Update title column to be NOT NULL with a default based on task_type
UPDATE housekeeping_tasks 
SET title = COALESCE(title, INITCAP(task_type) || ' - ' || COALESCE(listing_id, 'Property'))
WHERE title IS NULL;

ALTER TABLE housekeeping_tasks 
ALTER COLUMN title SET NOT NULL;

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('housekeeping', 'maintenance')),
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  depends_on_task_id UUID NOT NULL,
  dependency_type TEXT DEFAULT 'blocking' CHECK (dependency_type IN ('blocking', 'soft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create checklist templates table (enhanced)
CREATE TABLE IF NOT EXISTS housekeeping_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  estimated_duration INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create room status tracking table
CREATE TABLE IF NOT EXISTS room_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  room_number TEXT,
  old_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('dirty', 'cleaning', 'cleaned', 'inspected', 'ready', 'maintenance', 'out_of_order')),
  changed_by UUID,
  task_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_status_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_comments
CREATE POLICY "View task comments (all authenticated users)" ON task_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Create task comments (authenticated users)" ON task_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own comments" ON task_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Delete own comments or admin" ON task_comments
  FOR DELETE USING (
    auth.uid() = user_id OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for task_dependencies
CREATE POLICY "View task dependencies (authenticated)" ON task_dependencies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Manage task dependencies (managers/admins)" ON task_dependencies
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for housekeeping_checklist_templates
CREATE POLICY "View checklist templates (authenticated)" ON housekeeping_checklist_templates
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = TRUE);

CREATE POLICY "Manage checklist templates (managers/admins)" ON housekeeping_checklist_templates
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    has_role(auth.uid(), 'superadmin'::app_role)
  );

-- RLS Policies for room_status_log
CREATE POLICY "View room status log (authenticated)" ON room_status_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Create room status log (authenticated)" ON room_status_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update room status and log changes
CREATE OR REPLACE FUNCTION update_room_status(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update task blocking status
CREATE OR REPLACE FUNCTION update_task_dependencies() RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for task status changes
DROP TRIGGER IF EXISTS housekeeping_task_status_change ON housekeeping_tasks;
CREATE TRIGGER housekeeping_task_status_change
  BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_dependencies();

-- Insert some default checklist templates
INSERT INTO housekeeping_checklist_templates (name, description, task_type, items, estimated_duration) VALUES
(
  'Standard Turnover Clean',
  'Complete turnover cleaning for guest departure/arrival',
  'turnover_clean',
  '[
    {"id": "1", "text": "Strip and change all bed linens", "category": "bedroom", "required": true},
    {"id": "2", "text": "Vacuum all carpets and mop hard floors", "category": "general", "required": true},
    {"id": "3", "text": "Clean and sanitize bathroom completely", "category": "bathroom", "required": true},
    {"id": "4", "text": "Dust all surfaces and furniture", "category": "general", "required": true},
    {"id": "5", "text": "Clean kitchen thoroughly", "category": "kitchen", "required": true},
    {"id": "6", "text": "Restock amenities and supplies", "category": "supplies", "required": true},
    {"id": "7", "text": "Take completion photos", "category": "verification", "required": false}
  ]'::jsonb,
  90
),
(
  'Deep Clean',
  'Intensive deep cleaning service',
  'deep_clean',
  '[
    {"id": "1", "text": "Deep clean all appliances", "category": "kitchen", "required": true},
    {"id": "2", "text": "Clean inside and outside of all cabinets", "category": "kitchen", "required": true},
    {"id": "3", "text": "Steam clean carpets", "category": "general", "required": true},
    {"id": "4", "text": "Detailed bathroom deep clean", "category": "bathroom", "required": true},
    {"id": "5", "text": "Clean all light fixtures and fans", "category": "general", "required": true},
    {"id": "6", "text": "Wash all windows", "category": "general", "required": true}
  ]'::jsonb,
  180
),
(
  'Maintenance Clean',
  'Post-maintenance cleaning service',
  'maintenance_clean',
  '[
    {"id": "1", "text": "Remove all debris and construction dust", "category": "general", "required": true},
    {"id": "2", "text": "Clean all surfaces affected by work", "category": "general", "required": true},
    {"id": "3", "text": "Sanitize work areas", "category": "general", "required": true},
    {"id": "4", "text": "Verify all amenities are in place", "category": "verification", "required": true}
  ]'::jsonb,
  60
)
ON CONFLICT DO NOTHING;