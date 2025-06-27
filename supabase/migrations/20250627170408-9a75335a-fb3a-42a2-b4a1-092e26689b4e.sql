
-- Create tenant-scoped task management tables with RLS

-- Create task status enum
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- Create task priority enum  
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'open',
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_role TEXT, -- role that should handle this task
  assigned_to UUID REFERENCES auth.users(id),
  property_id UUID,
  booking_id TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create task templates table
CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  assigned_role TEXT NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  estimated_duration INTEGER, -- in minutes
  checklist JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table for tenant-specific role assignments
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id, role)
);

-- Create task comments table for communication
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see tasks within their tenant
CREATE POLICY "Users can view tasks in their tenant" ON public.tasks
  FOR SELECT USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

-- Only managers and admins can create tasks
CREATE POLICY "Managers can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('tenant_admin', 'property_manager')
      AND ur.is_active = true
    )
  );

-- Users can update tasks based on role permissions
CREATE POLICY "Task updates based on role" ON public.tasks
  FOR UPDATE USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    ) AND (
      -- Managers can update all tasks
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.tenant_id = tasks.tenant_id
        AND ur.role IN ('tenant_admin', 'property_manager')
        AND ur.is_active = true
      ) OR
      -- Staff can only update their assigned tasks
      (assigned_to = auth.uid())
    )
  );

-- Add RLS policies for task templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their tenant" ON public.task_templates
  FOR SELECT USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

CREATE POLICY "Managers can manage templates" ON public.task_templates
  FOR ALL USING (
    auth.uid() = created_by AND
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('tenant_admin', 'property_manager')
      AND ur.is_active = true
    )
  );

-- Add RLS policies for user roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles in their tenant" ON public.user_roles
  FOR SELECT USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'tenant_admin'
      AND ur.is_active = true
    )
  );

-- Add RLS policies for task comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their tenant" ON public.task_comments
  FOR SELECT USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

CREATE POLICY "Users can create comments" ON public.task_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    tenant_id IN (
      SELECT ur.tenant_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_tasks_tenant_id ON public.tasks(tenant_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_task_templates_tenant_id ON public.task_templates(tenant_id);
CREATE INDEX idx_user_roles_tenant_user ON public.user_roles(tenant_id, user_id);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON public.task_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
