-- Inventory foundation: categories and usage + secure RLS

-- 1) Create inventory_categories if not exists
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Update trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_inventory_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_inventory_categories_updated_at
    BEFORE UPDATE ON public.inventory_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies for inventory_categories
DROP POLICY IF EXISTS "Managers can manage inventory categories" ON public.inventory_categories;
CREATE POLICY "Managers can manage inventory categories"
ON public.inventory_categories
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager']::text[])
)
WITH CHECK (
  public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager']::text[])
);

DROP POLICY IF EXISTS "Staff can view inventory categories" ON public.inventory_categories;
CREATE POLICY "Staff can view inventory categories"
ON public.inventory_categories
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() = ANY (
    ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff','maintenance_staff']::text[]
  )
);

-- 2) Create inventory_usage if not exists
CREATE TABLE IF NOT EXISTS public.inventory_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  property TEXT NOT NULL,
  reported_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_inventory_usage_date ON public.inventory_usage(date);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_category ON public.inventory_usage(category);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_property ON public.inventory_usage(property);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_reported_by ON public.inventory_usage(reported_by);

-- Policies for inventory_usage
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.inventory_usage;
CREATE POLICY "Users can insert their own usage"
ON public.inventory_usage
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reported_by AND 
  public.get_current_user_role() = ANY (
    ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff','maintenance_staff']::text[]
  )
);

DROP POLICY IF EXISTS "Staff can view inventory usage" ON public.inventory_usage;
CREATE POLICY "Staff can view inventory usage"
ON public.inventory_usage
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() = ANY (
    ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff','maintenance_staff']::text[]
  )
);

DROP POLICY IF EXISTS "Managers can modify inventory usage" ON public.inventory_usage;
CREATE POLICY "Managers can modify inventory usage"
ON public.inventory_usage
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager']::text[])
)
WITH CHECK (
  public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager']::text[])
);

DROP POLICY IF EXISTS "Managers can delete inventory usage" ON public.inventory_usage;
CREATE POLICY "Managers can delete inventory usage"
ON public.inventory_usage
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','inventory_manager']::text[])
);
