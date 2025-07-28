-- Fix JSONB operator issues by ensuring proper JSONB column types
-- Check if there are any text columns that should be JSONB

-- First, let's create a comprehensive task comments system
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('housekeeping', 'maintenance')),
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task comments
CREATE POLICY "Users can create task comments" ON task_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff')
  );

CREATE POLICY "Users can view task comments" ON task_comments
  FOR SELECT USING (
    get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff')
  );

CREATE POLICY "Users can update their own comments" ON task_comments
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Create task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('housekeeping', 'maintenance')),
  user_id UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task attachments
CREATE POLICY "Users can upload task attachments" ON task_attachments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff')
  );

CREATE POLICY "Users can view task attachments" ON task_attachments
  FOR SELECT USING (
    get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff')
  );

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_user_id ON task_attachments(user_id);

-- Fix any potential JSONB operator issues by ensuring proper types
-- Update housekeeping_tasks to ensure proper JSONB handling
UPDATE housekeeping_tasks SET checklist = '[]'::jsonb WHERE checklist IS NULL;
UPDATE housekeeping_tasks SET default_actions = '[]'::jsonb WHERE default_actions IS NULL;
UPDATE housekeeping_tasks SET additional_actions = '[]'::jsonb WHERE additional_actions IS NULL;