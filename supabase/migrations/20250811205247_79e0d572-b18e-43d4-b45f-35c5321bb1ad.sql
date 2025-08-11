-- Phase 6 (retry): Tighten RLS policies and add indexes

-- 1) cleaning_rules
ALTER TABLE public.cleaning_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.cleaning_rules;
DROP POLICY IF EXISTS "Read cleaning rules" ON public.cleaning_rules;
DROP POLICY IF EXISTS "Insert cleaning rules (managers/admins)" ON public.cleaning_rules;
DROP POLICY IF EXISTS "Update cleaning rules (owner or managers/admins)" ON public.cleaning_rules;
DROP POLICY IF EXISTS "Delete cleaning rules (admins)" ON public.cleaning_rules;

CREATE POLICY "Read cleaning rules" ON public.cleaning_rules FOR SELECT USING (true);
CREATE POLICY "Insert cleaning rules (managers/admins)" ON public.cleaning_rules FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'administrator'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role)
  );
CREATE POLICY "Update cleaning rules (owner or managers/admins)" ON public.cleaning_rules FOR UPDATE
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'administrator'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role)
  );
CREATE POLICY "Delete cleaning rules (admins)" ON public.cleaning_rules FOR DELETE
  USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE INDEX IF NOT EXISTS idx_cleaning_rules_property ON public.cleaning_rules (property_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_rules_created_at ON public.cleaning_rules (created_at);


-- 2) inventory_usage
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.inventory_usage;
DROP POLICY IF EXISTS "Read inventory usage" ON public.inventory_usage;
DROP POLICY IF EXISTS "Insert inventory usage (self)" ON public.inventory_usage;
DROP POLICY IF EXISTS "Update inventory usage (owner or managers/admins)" ON public.inventory_usage;
DROP POLICY IF EXISTS "Delete inventory usage (managers/admins)" ON public.inventory_usage;

CREATE POLICY "Read inventory usage" ON public.inventory_usage FOR SELECT USING (true);
CREATE POLICY "Insert inventory usage (self)" ON public.inventory_usage FOR INSERT
  WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Update inventory usage (owner or managers/admins)" ON public.inventory_usage FOR UPDATE
  USING (
    reported_by = auth.uid() OR
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );
CREATE POLICY "Delete inventory usage (managers/admins)" ON public.inventory_usage FOR DELETE
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );

CREATE INDEX IF NOT EXISTS idx_inventory_usage_item ON public.inventory_usage (item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_property ON public.inventory_usage (property_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_date ON public.inventory_usage (usage_date);


-- 3) order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated access" ON public.order_items;
DROP POLICY IF EXISTS "Read order items" ON public.order_items;
DROP POLICY IF EXISTS "Insert order items (managers/admins)" ON public.order_items;
DROP POLICY IF EXISTS "Update order items (managers/admins)" ON public.order_items;
DROP POLICY IF EXISTS "Delete order items (managers/admins)" ON public.order_items;

CREATE POLICY "Read order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Insert order items (managers/admins)" ON public.order_items FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );
CREATE POLICY "Update order items (managers/admins)" ON public.order_items FOR UPDATE
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );
CREATE POLICY "Delete order items (managers/admins)" ON public.order_items FOR DELETE
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item ON public.order_items (item_id);


-- 4) inventory_items: add delete policy and indexes
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Delete inventory items (managers/admins)" ON public.inventory_items;
CREATE POLICY "Delete inventory items (managers/admins)" ON public.inventory_items FOR DELETE
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items (category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON public.inventory_items ((lower(name)));
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON public.inventory_items (created_at);


-- 5) tasks: add delete policy and indexes
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Delete tasks (owner/assignee/managers/admins)" ON public.tasks;
CREATE POLICY "Delete tasks (owner/assignee/managers/admins)" ON public.tasks FOR DELETE
  USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );
CREATE INDEX IF NOT EXISTS idx_tasks_property ON public.tasks (property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at);


-- 6) orders: add delete policy and indexes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Delete orders (managers/admins)" ON public.orders;
CREATE POLICY "Delete orders (managers/admins)" ON public.orders FOR DELETE
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) OR
    has_role(auth.uid(), 'administrator'::app_role)
  );
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders (order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_requestor ON public.orders (requestor);


-- 7) properties: indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_name ON public.properties ((lower(name)));