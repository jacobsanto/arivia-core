-- Phase 1: Database Schema Corrections

-- 1.1: Add missing columns to housekeeping_tasks
ALTER TABLE housekeeping_tasks 
ADD COLUMN IF NOT EXISTS qc_status TEXT CHECK (qc_status IN ('pending', 'passed', 'failed', 'not_required'));

ALTER TABLE housekeeping_tasks 
ADD COLUMN IF NOT EXISTS listing_id TEXT;

-- Set default qc_status for existing records
UPDATE housekeeping_tasks SET qc_status = 'not_required' WHERE qc_status IS NULL;

-- 1.2: Add title column to guesty_listings
ALTER TABLE guesty_listings 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Use nickname as default title
UPDATE guesty_listings SET title = COALESCE(nickname, listing_id) WHERE title IS NULL;

-- 1.3: Create missing audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  level TEXT CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  route TEXT,
  error_name TEXT,
  error_stack TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only superadmins can view audit logs
CREATE POLICY "Superadmins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Phase 3: Add Missing RLS Policies

-- 1. channel_members
CREATE POLICY "Users can view channel members" 
ON channel_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join channels" 
ON channel_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 2. checklist_templates
CREATE POLICY "Users can view templates" 
ON checklist_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage templates" 
ON checklist_templates FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'property_manager'::app_role) OR 
       has_role(auth.uid(), 'administrator'::app_role) OR
       has_role(auth.uid(), 'superadmin'::app_role));

-- 3. cleaning_actions
CREATE POLICY "Users can view cleaning actions" 
ON cleaning_actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage actions" 
ON cleaning_actions FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'administrator'::app_role) OR 
       has_role(auth.uid(), 'superadmin'::app_role));

-- 4. cleaning_rules
CREATE POLICY "Users can view cleaning rules" 
ON cleaning_rules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage rules" 
ON cleaning_rules FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'administrator'::app_role) OR 
       has_role(auth.uid(), 'superadmin'::app_role));

-- 5. damage_reports
CREATE POLICY "Users can view damage reports" 
ON damage_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can create reports" 
ON damage_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Managers can update reports" 
ON damage_reports FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'property_manager'::app_role) OR 
       has_role(auth.uid(), 'administrator'::app_role) OR
       has_role(auth.uid(), 'superadmin'::app_role));

-- 6. guesty_listings  
CREATE POLICY "Users can view listings" 
ON guesty_listings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage listings" 
ON guesty_listings FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'administrator'::app_role) OR 
       has_role(auth.uid(), 'superadmin'::app_role));

-- 7. inventory_categories
CREATE POLICY "Users can view categories" 
ON inventory_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage categories" 
ON inventory_categories FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'property_manager'::app_role) OR 
       has_role(auth.uid(), 'administrator'::app_role) OR
       has_role(auth.uid(), 'superadmin'::app_role));

-- 8. orders
CREATE POLICY "Users can view orders" 
ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can create orders" 
ON orders FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Managers can manage orders" 
ON orders FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'property_manager'::app_role) OR 
       has_role(auth.uid(), 'administrator'::app_role) OR
       has_role(auth.uid(), 'superadmin'::app_role));

-- 9. order_items
CREATE POLICY "Users can view order items" 
ON order_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Order creators can add items" 
ON order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid())
);

-- 10. role_permissions
CREATE POLICY "Users can view role permissions" 
ON role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Superadmins manage permissions" 
ON role_permissions FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- 11. room_status_log
CREATE POLICY "Users can view status log" 
ON room_status_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can log status changes" 
ON room_status_log FOR INSERT TO authenticated WITH CHECK (true);

-- 12. system_settings
CREATE POLICY "Users can view settings" 
ON system_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage settings" 
ON system_settings FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'administrator'::app_role) OR 
       has_role(auth.uid(), 'superadmin'::app_role));

-- 13. user_activity_log
CREATE POLICY "Users view own activity" 
ON user_activity_log FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR 
       has_role(auth.uid(), 'administrator'::app_role) OR 
       has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can log activity" 
ON user_activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- 14. user_roles
CREATE POLICY "Users can view user roles" 
ON user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage user roles" 
ON user_roles FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'administrator'::app_role) OR 
       has_role(auth.uid(), 'superadmin'::app_role));

-- 15. vendors
CREATE POLICY "Users can view vendors" 
ON vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers manage vendors" 
ON vendors FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'property_manager'::app_role) OR 
       has_role(auth.uid(), 'administrator'::app_role) OR
       has_role(auth.uid(), 'superadmin'::app_role));