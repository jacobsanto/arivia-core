-- Phase 1 Security Hardening: add explicit is_authenticated() to key policies
-- This migration updates existing policies to explicitly require authenticated users,
-- reducing linter warnings about potential anonymous access.

-- chat_channels
DROP POLICY IF EXISTS "Admins can delete channels" ON public.chat_channels;
CREATE POLICY "Admins can delete channels"
ON public.chat_channels
FOR DELETE
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS "Admins can update channels" ON public.chat_channels;
CREATE POLICY "Admins can update channels"
ON public.chat_channels
FOR UPDATE
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
);

-- Keep existing view/insert policies; ensure insert requires auth explicitly
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.chat_channels;
CREATE POLICY "Authenticated users can create channels"
ON public.chat_channels
FOR INSERT
WITH CHECK (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- cleaning_service_definitions
DROP POLICY IF EXISTS "Managers can manage cleaning definitions" ON public.cleaning_service_definitions;
CREATE POLICY "Managers can manage cleaning definitions"
ON public.cleaning_service_definitions
FOR ALL
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- cleaning_rules
DROP POLICY IF EXISTS "Admins can manage cleaning rules" ON public.cleaning_rules;
CREATE POLICY "Admins can manage cleaning rules"
ON public.cleaning_rules
FOR ALL
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- cleaning_schedules
DROP POLICY IF EXISTS "Admins can manage cleaning schedules" ON public.cleaning_schedules;
CREATE POLICY "Admins can manage cleaning schedules"
ON public.cleaning_schedules
FOR ALL
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- rule_actions
DROP POLICY IF EXISTS "Admins can manage rule actions" ON public.rule_actions;
CREATE POLICY "Admins can manage rule actions"
ON public.rule_actions
FOR ALL
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- rule_conditions
DROP POLICY IF EXISTS "Admins can manage rule conditions" ON public.rule_conditions;
CREATE POLICY "Admins can manage rule conditions"
ON public.rule_conditions
FOR ALL
USING (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- properties
DROP POLICY IF EXISTS "Properties are viewable by staff" ON public.properties;
CREATE POLICY "Properties are viewable by staff"
ON public.properties
FOR SELECT
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff','maintenance_staff'])
);

DROP POLICY IF EXISTS "Property managers can manage properties" ON public.properties;
CREATE POLICY "Property managers can manage properties"
ON public.properties
FOR ALL
USING (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
)
WITH CHECK (
  is_authenticated() AND get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- checklist_templates
DROP POLICY IF EXISTS "Super admins can manage checklist templates" ON public.checklist_templates;
CREATE POLICY "Super admins can manage checklist templates"
ON public.checklist_templates
FOR ALL
USING (
  is_authenticated() AND get_user_role_safe() = 'superadmin'
)
WITH CHECK (
  is_authenticated() AND get_user_role_safe() = 'superadmin'
);
