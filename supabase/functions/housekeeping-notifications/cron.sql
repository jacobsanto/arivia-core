
-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the housekeeping notifications to run daily at 7:00 AM
SELECT cron.schedule(
  'housekeeping-daily-notifications',
  '0 7 * * *',  -- Run every day at 7:00 AM
  $$
  SELECT net.http_post(
    url:='{{SUPABASE_URL}}/functions/v1/housekeeping-notifications',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{SUPABASE_ANON_KEY}}"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
