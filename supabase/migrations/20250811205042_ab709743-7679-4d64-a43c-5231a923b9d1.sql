-- Phase 6: Tighten RLS policies and add indexes for performance

-- 1) cleaning_rules: replace overly permissive policy
ALTER TABLE public.cleaning_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.cleaning_rules;

-- Allow everyone to read
CREATE POLICY "Read cleaning rules"
ON public.cleaning_rules
FOR SELECT
USING (true);

-- Only administrators and property managers can insert rules
CREATE POLICY "Insert cleaning rules (managers/admins)"
ON public.cleaning_rules
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'administrator'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role)
);

-- Only creators, administrators, or property managers can update
CREATE POLICY "Update cleaning rules (owner or managers/admins)"
ON public.cleaning_rules
FOR UPDATE
USING (
  created_by = auth.uid() OR
  has_role(auth.uid(), 'administrator'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role)
);

-- Only administrators can delete
CREATE POLICY "Delete cleaning rules (admins)"
ON public.cleaning_rules
FOR DELETE
USING (
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Helpful indexes (if not present)
CREATE INDEX IF NOT EXISTS idx_cleaning_rules_property ON public.cleaning_rules (property_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_rules_created_at ON public.cleaning_rules (created_at);


-- 2) inventory_usage: replace overly permissive policy
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.inventory_usage;

-- Anyone authenticated can read usage
CREATE POLICY "Read inventory usage"
ON public.inventory_usage
FOR SELECT
USING (true);

-- Only the reporter can insert their own usage rows
CREATE POLICY "Insert inventory usage (self)"
ON public.inventory_usage
FOR INSERT
WITH CHECK (reported_by = auth.uid());

-- Reporter can update their own rows; managers/admins can also update
CREATE POLICY "Update inventory usage (owner or managers/admins)"
ON public.inventory_usage
FOR UPDATE
USING (
  reported_by = auth.uid() OR
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Only administrators and property managers can delete
CREATE POLICY "Delete inventory usage (managers/admins)"
ON public.inventory_usage
FOR DELETE
USING (
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Indexes for frequent reporting filters
CREATE INDEX IF NOT EXISTS idx_inventory_usage_item ON public.inventory_usage (item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_property ON public.inventory_usage (property_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_date ON public.inventory_usage (usage_date);


-- 3) order_items: replace overly permissive policy
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.order_items;

-- Authenticated users can view order items
CREATE POLICY "Read order items"
ON public.order_items
FOR SELECT
USING (true);

-- Managers/admins can modify order items
CREATE POLICY "Insert order items (managers/admins)"
ON public.order_items
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Update order items (managers/admins)"
ON public.order_items
FOR UPDATE
USING (
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Delete order items (managers/admins)"
ON public.order_items
FOR DELETE
USING (
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item ON public.order_items (item_id);


-- 4) inventory_items: add delete policy and useful indexes
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
-- Keep existing SELECT/INSERT/UPDATE policies; add DELETE for managers/admins
CREATE POLICY IF NOT EXISTS "Delete inventory items (managers/admins)"
ON public.inventory_items
FOR DELETE
USING (
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items (category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON public.inventory_items ((lower(name)));
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON public.inventory_items (created_at);


-- 5) tasks: add delete policy and indexes
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Delete tasks (owner/assignee/managers/admins)"
ON public.tasks
FOR DELETE
USING (
  assigned_to = auth.uid() OR
  created_by = auth.uid() OR
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_property ON public.tasks (property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at);


-- 6) orders: add delete policy and indexes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Delete orders (managers/admins)"
ON public.orders
FOR DELETE
USING (
  has_role(auth.uid(), 'property_manager'::app_role) OR
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders (order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_requestor ON public.orders (requestor);


-- 7) properties: helpful indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_name ON public.properties ((lower(name)));

-- Note:
-- Some policies still reference 'superadmin' in other tables; we retained them where existing.
-- We tightened ONLY tables that had overly permissive ALL policies and added missing DELETE policies + indexes.
