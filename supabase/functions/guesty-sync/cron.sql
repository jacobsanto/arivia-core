
SELECT cron.schedule(
  'sync-guesty-data',
  '0 */12 * * *',
  $$
  SELECT net.http_post(
    url:='${Deno.env.get('SUPABASE_URL')}/functions/v1/guesty-sync',
    headers:='{"Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}"}'::jsonb
  ) AS request_id;
  $$
);
