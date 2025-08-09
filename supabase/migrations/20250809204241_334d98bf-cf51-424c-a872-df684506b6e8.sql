-- Phase 1 (continued): ensure remaining policies are restricted TO authenticated

-- integration_configs
DROP POLICY IF EXISTS "Admins can manage integration configs" ON public.integration_configs;
CREATE POLICY "Admins can manage integration configs"
ON public.integration_configs
FOR ALL
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator'])
);

DROP POLICY IF EXISTS "Users can view integration configs" ON public.integration_configs;
CREATE POLICY "Users can view integration configs"
ON public.integration_configs
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['superadmin','administrator','property_manager'])
);

-- damage_report_media (INSERT policy)
DROP POLICY IF EXISTS "Users can upload media to their reports" ON public.damage_report_media;
CREATE POLICY "Users can upload media to their reports"
ON public.damage_report_media
FOR INSERT
TO authenticated
WITH CHECK (
  is_authenticated() AND (
    EXISTS (
      SELECT 1 FROM damage_reports dr
      WHERE dr.id = damage_report_media.report_id AND dr.reported_by = auth.uid()
    )
    AND auth.uid() = uploaded_by
  )
);

-- orders (ensure create/update policies are authenticated if they exist)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Admins can delete orders'
  ) THEN
    ALTER POLICY "Admins can delete orders" ON public.orders TO authenticated;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Managers can update orders'
  ) THEN
    ALTER POLICY "Managers can update orders" ON public.orders TO authenticated;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Staff can view orders'
  ) THEN
    ALTER POLICY "Staff can view orders" ON public.orders TO authenticated;
  END IF;
END $$;

-- bookings (guard: alter existing policies to authenticated if present)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Admins can delete bookings'
  ) THEN
    ALTER POLICY "Admins can delete bookings" ON public.bookings TO authenticated;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Property managers can update bookings'
  ) THEN
    ALTER POLICY "Property managers can update bookings" ON public.bookings TO authenticated;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Property managers can view relevant bookings'
  ) THEN
    ALTER POLICY "Property managers can view relevant bookings" ON public.bookings TO authenticated;
  END IF;
END $$;