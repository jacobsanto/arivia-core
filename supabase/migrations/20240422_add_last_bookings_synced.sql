
-- Add the last_bookings_synced column to the integration_health table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name = 'integration_health' 
                 AND column_name = 'last_bookings_synced') THEN
    ALTER TABLE public.integration_health 
    ADD COLUMN last_bookings_synced TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
