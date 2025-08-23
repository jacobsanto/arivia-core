-- Create the missing checklist_templates table
CREATE TABLE public.checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for checklist templates
CREATE POLICY "Authenticated users can view active templates" 
ON public.checklist_templates 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Staff can create templates" 
ON public.checklist_templates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Creators and admins can update templates" 
ON public.checklist_templates 
FOR UPDATE 
USING (
  (created_by = auth.uid()) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admins can delete templates" 
ON public.checklist_templates 
FOR DELETE 
USING (
  has_role(auth.uid(), 'administrator'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_checklist_templates_updated_at
BEFORE UPDATE ON public.checklist_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default checklist templates
INSERT INTO public.checklist_templates (title, description, task_type, items) VALUES
('Standard Housekeeping', 'Basic housekeeping checklist for villa cleaning', 'Housekeeping', 
 '[{"id": 1, "title": "Make beds and arrange pillows", "completed": false},
   {"id": 2, "title": "Vacuum all floors and carpets", "completed": false},
   {"id": 3, "title": "Clean and disinfect bathrooms", "completed": false},
   {"id": 4, "title": "Clean kitchen and appliances", "completed": false},
   {"id": 5, "title": "Empty trash and replace bags", "completed": false}]'::jsonb),

('Deep Cleaning', 'Comprehensive deep cleaning checklist', 'Housekeeping',
 '[{"id": 1, "title": "Dust all surfaces and furniture", "completed": false},
   {"id": 2, "title": "Clean windows and mirrors", "completed": false},
   {"id": 3, "title": "Sanitize all touchpoints", "completed": false},
   {"id": 4, "title": "Clean inside of appliances", "completed": false},
   {"id": 5, "title": "Wash and change all linens", "completed": false},
   {"id": 6, "title": "Mop floors with disinfectant", "completed": false}]'::jsonb),

('Maintenance Check', 'Basic maintenance inspection checklist', 'Maintenance',
 '[{"id": 1, "title": "Check plumbing fixtures", "completed": false},
   {"id": 2, "title": "Test electrical outlets", "completed": false},
   {"id": 3, "title": "Inspect HVAC system", "completed": false},
   {"id": 4, "title": "Check for damages or repairs needed", "completed": false},
   {"id": 5, "title": "Test smoke detectors", "completed": false}]'::jsonb);