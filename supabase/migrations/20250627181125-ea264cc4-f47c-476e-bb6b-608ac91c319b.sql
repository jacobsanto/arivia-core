
-- Create tenant_branding table for storing branding metadata
CREATE TABLE public.tenant_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL UNIQUE,
  brand_name TEXT NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  accent_color TEXT DEFAULT '#F59E0B',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#1F2937',
  font_family TEXT DEFAULT 'Inter',
  custom_css TEXT,
  theme_mode TEXT DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'auto')),
  custom_properties JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tenant branding
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their tenant's branding
CREATE POLICY "Users can view their tenant branding" 
  ON public.tenant_branding 
  FOR SELECT 
  USING (true); -- Allow all authenticated users to read branding data

-- Policy: Only tenant admins can modify branding
CREATE POLICY "Tenant admins can modify branding" 
  ON public.tenant_branding 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('tenant_admin', 'superadmin')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_tenant_branding_updated_at
  BEFORE UPDATE ON public.tenant_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default branding for Arivia Villas
INSERT INTO public.tenant_branding (
  tenant_id,
  brand_name,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  custom_properties
) VALUES (
  gen_random_uuid(),
  'Arivia Villas',
  '/arivia-logo-full-dark-bg.png',
  '#2563EB',
  '#1E40AF',
  '#F59E0B',
  '{"headerStyle": "elegant", "cardRadius": "lg", "shadowIntensity": "medium"}'
) ON CONFLICT (tenant_id) DO NOTHING;
