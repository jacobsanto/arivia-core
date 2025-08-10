-- Recreate only the INSERT policy on inventory_usage with robust casting
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.inventory_usage;
CREATE POLICY "Users can insert their own usage"
ON public.inventory_usage
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  (reported_by::text = auth.uid()::text) AND 
  public.get_current_user_role() = ANY (
    ARRAY['superadmin','administrator','property_manager','inventory_manager','housekeeping_staff','maintenance_staff']::text[]
  )
);
