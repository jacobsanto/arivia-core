
-- 1) Disable scheduled Guesty cron job (if pg_cron is installed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('sync-guesty-data');
  END IF;
END $$;

-- 2) Remove Guesty health artifacts and API usage logs
-- 2a) Delete integration_health rows for provider 'guesty' (table exists in your schema)
DELETE FROM public.integration_health WHERE provider = 'guesty';

-- 2b) Drop guesty_api_usage table if it exists
DROP TABLE IF EXISTS public.guesty_api_usage;

-- 2c) Purge any sync_logs referencing Guesty if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='sync_logs'
  ) THEN
    EXECUTE 'DELETE FROM public.sync_logs WHERE service = ''guesty'' OR message ILIKE ''%guesty%''';
  END IF;
END $$;

-- 2d) Clean webhook_health (if present) of 'guesty'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='webhook_health'
  ) THEN
    EXECUTE 'DELETE FROM public.webhook_health WHERE provider = ''guesty''';
  END IF;
END $$;

-- 3) Remove QuickBooks integrations from marketplace seeds
DELETE FROM public.external_integrations WHERE provider IN ('quickbooks');
DELETE FROM public.integration_configs WHERE provider IN ('quickbooks');

-- 4) Remove Guesty marketplace templates (ensure it won’t be shown)
DELETE FROM public.external_integrations WHERE provider IN ('guesty');
DELETE FROM public.integration_configs WHERE provider IN ('guesty');

-- 5) Seed new marketplace integration templates (idempotent via ON CONFLICT DO NOTHING)

-- Tokeet
INSERT INTO public.integration_configs
  (provider, name, description, category, difficulty, estimated_setup_time, features, config_schema, advanced_options, supported_events)
VALUES
  ('tokeet',
   'Tokeet',
   'Connect to Tokeet to sync bookings, availability, and tasks.',
   'property_management',
   'medium',
   '20 minutes',
   '["sync","bookings","availability"]'::jsonb,
   '[{"name":"api_key","type":"password","label":"API Key","required":true},{"name":"account_id","type":"text","label":"Account ID","required":true}]'::jsonb,
   '[]'::jsonb,
   '["reservation_created","reservation_updated"]'::jsonb)
ON CONFLICT (provider) DO NOTHING;

-- Advance CM PMS
INSERT INTO public.integration_configs
  (provider, name, description, category, difficulty, estimated_setup_time, features, config_schema, advanced_options, supported_events)
VALUES
  ('advance_cm_pms',
   'Advance CM PMS',
   'Connect to Advance CM PMS for property and booking synchronization.',
   'property_management',
   'medium',
   '30 minutes',
   '["sync","bookings","availability"]'::jsonb,
   '[{"name":"client_id","type":"text","label":"Client ID","required":true},{"name":"client_secret","type":"password","label":"Client Secret","required":true},{"name":"api_base_url","type":"url","label":"API Base URL","required":true}]'::jsonb,
   '[]'::jsonb,
   '["reservation_created","reservation_updated"]'::jsonb)
ON CONFLICT (provider) DO NOTHING;

-- Google Workspace (single connector with selectable scopes)
INSERT INTO public.integration_configs
  (provider, name, description, category, difficulty, estimated_setup_time, features, config_schema, advanced_options, supported_events)
VALUES
  ('google_workspace',
   'Google Workspace',
   'Connect Gmail, Drive, Sheets, Docs, and Calendar to streamline operations.',
   'communication',
   'medium',
   '20 minutes',
   '["gmail","drive","sheets","docs","calendar"]'::jsonb,
   '[
      {"name":"client_id","type":"text","label":"Google OAuth Client ID","required":true},
      {"name":"client_secret","type":"password","label":"Google OAuth Client Secret","required":true},
      {"name":"redirect_uri","type":"url","label":"Redirect URI","required":true},
      {"name":"scopes","type":"multiselect","label":"Scopes","required":true,
       "options": [
         {"value":"gmail.readonly","label":"Gmail Read-only"},
         {"value":"drive.file","label":"Drive File Access"},
         {"value":"spreadsheets","label":"Google Sheets"},
         {"value":"documents","label":"Google Docs"},
         {"value":"calendar","label":"Google Calendar"}
       ]
      }
    ]'::jsonb,
   '[]'::jsonb,
   '[]'::jsonb)
ON CONFLICT (provider) DO NOTHING;
