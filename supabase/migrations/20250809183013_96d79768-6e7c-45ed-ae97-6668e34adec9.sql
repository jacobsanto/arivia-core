-- Housekeeping tasks hardening: realtime safety, indexes, and explicit RLS

-- 1) Realtime safety
ALTER TABLE public.housekeeping_tasks REPLICA IDENTITY FULL;

-- 2) Ensure RLS is enabled (idempotent)
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- 3) Indexes for common queries (today range, ordering, filters)
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_due_date ON public.housekeeping_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_status ON public.housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_listing_due ON public.housekeeping_tasks(listing_id, due_date);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_booking ON public.housekeeping_tasks(booking_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_assigned_to ON public.housekeeping_tasks(assigned_to);

-- 4) RLS policies: explicit authentication and role-based access
DROP POLICY IF EXISTS housekeeping_tasks_staff_read ON public.housekeeping_tasks;
DROP POLICY IF EXISTS housekeeping_tasks_staff_update ON public.housekeeping_tasks;
DROP POLICY IF EXISTS housekeeping_tasks_manager_insert ON public.housekeeping_tasks;

-- Read for housekeeping staff and managers/admins
CREATE POLICY housekeeping_tasks_staff_read
ON public.housekeeping_tasks
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  public.is_authenticated()
  AND public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager','housekeeping_staff'])
);

-- Update for managers/admins or the assigned user (safe text casts to avoid uuid/text mismatch)
CREATE POLICY housekeeping_tasks_staff_update
ON public.housekeeping_tasks
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  public.is_authenticated()
  AND (
    public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
    OR (assigned_to::text = auth.uid()::text)
  )
);

-- Insert for managers/admins
CREATE POLICY housekeeping_tasks_manager_insert
ON public.housekeeping_tasks
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_authenticated()
  AND public.get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);
