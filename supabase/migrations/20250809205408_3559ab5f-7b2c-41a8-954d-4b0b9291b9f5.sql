-- Phase 3: Final sweep to enforce TO authenticated on remaining policies (excluding storage/cron)

-- Helper procedure to alter a policy if it exists
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'chat_messages','cleaning_actions','cleaning_templates','configuration_assignments',
        'external_integrations','rule_assignments','orders','roles','role_permissions',
        'task_attachments','task_templates','vendors','webhook_endpoints','webhook_health'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER POLICY %I ON %I.%I TO authenticated', r.policyname, r.schemaname, r.tablename);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping policy %.%.% due to error: %', r.schemaname, r.tablename, r.policyname, SQLERRM;
    END;
  END LOOP;
END $$;