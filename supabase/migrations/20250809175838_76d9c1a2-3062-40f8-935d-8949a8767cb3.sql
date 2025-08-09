BEGIN;

-- Reinforce permissions policy with explicit is_authenticated()
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions"
ON public.permissions
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  is_authenticated() AND (get_current_user_role() = ANY (ARRAY['superadmin','administrator']))
)
WITH CHECK (
  is_authenticated() AND (get_current_user_role() = ANY (ARRAY['superadmin','administrator']))
);

-- Reinforce tenant_branding admin policy with explicit is_authenticated()
DROP POLICY IF EXISTS "Tenant admins can modify branding" ON public.tenant_branding;
CREATE POLICY "Tenant admins can modify branding"
ON public.tenant_branding
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  is_authenticated() AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('tenant_admin','superadmin')
  )
)
WITH CHECK (
  is_authenticated() AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('tenant_admin','superadmin')
  )
);

-- Reinforce damage_report_media insert policy with explicit is_authenticated()
DROP POLICY IF EXISTS "Users can upload media to their reports" ON public.damage_report_media;
CREATE POLICY "Users can upload media to their reports"
ON public.damage_report_media
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  is_authenticated()
  AND EXISTS (
    SELECT 1 FROM public.damage_reports dr
    WHERE dr.id = damage_report_media.report_id
      AND dr.reported_by = auth.uid()
  )
  AND auth.uid() = uploaded_by
);

COMMIT;