-- Create damage_reports table
CREATE TABLE public.damage_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_id UUID,
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  reported_by UUID,
  assigned_to UUID,
  photos TEXT[],
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  repair_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for damage reports
CREATE POLICY "Users can view all damage reports" 
ON public.damage_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create damage reports" 
ON public.damage_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update damage reports" 
ON public.damage_reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete damage reports" 
ON public.damage_reports 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_damage_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_damage_reports_updated_at
  BEFORE UPDATE ON public.damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_damage_reports_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_damage_reports_property_id ON public.damage_reports(property_id);
CREATE INDEX idx_damage_reports_status ON public.damage_reports(status);
CREATE INDEX idx_damage_reports_severity ON public.damage_reports(severity);
CREATE INDEX idx_damage_reports_created_at ON public.damage_reports(created_at);