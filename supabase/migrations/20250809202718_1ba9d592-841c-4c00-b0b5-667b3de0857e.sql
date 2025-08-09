-- Fix policy type mismatch: compare text to uuid correctly for housekeeping_tasks
DROP POLICY IF EXISTS housekeeping_tasks_staff_update ON public.housekeeping_tasks;
CREATE POLICY housekeeping_tasks_staff_update
ON public.housekeeping_tasks
FOR UPDATE
TO authenticated
USING (
  is_authenticated() AND (
    get_user_role_safe() = ANY (ARRAY['superadmin','administrator','property_manager'])
    OR assigned_to::text = auth.uid()::text
  )
);