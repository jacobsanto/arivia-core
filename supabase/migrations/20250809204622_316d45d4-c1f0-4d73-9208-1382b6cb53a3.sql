-- Phase 2: Restrict cron schema policies to authenticated users

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'cron' AND tablename = 'job' AND policyname = 'cron_job_policy'
  ) THEN
    EXECUTE 'ALTER POLICY cron_job_policy ON cron.job TO authenticated';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'cron' AND tablename = 'job_run_details' AND policyname = 'cron_job_run_details_policy'
  ) THEN
    EXECUTE 'ALTER POLICY cron_job_run_details_policy ON cron.job_run_details TO authenticated';
  END IF;
END $$;