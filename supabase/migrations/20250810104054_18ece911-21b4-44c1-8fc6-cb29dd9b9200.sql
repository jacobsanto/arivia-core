-- Add egress monitoring and optimization settings
CREATE TABLE IF NOT EXISTS public.egress_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  request_count INTEGER DEFAULT 0,
  total_bytes BIGINT DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  peak_requests_per_minute INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.egress_monitoring ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view egress monitoring
CREATE POLICY "Only superadmins can view egress monitoring"
  ON public.egress_monitoring
  FOR ALL
  USING (get_user_role_safe(auth.uid()) = 'superadmin');

-- Function to log egress usage
CREATE OR REPLACE FUNCTION public.log_egress_usage(
  bytes_used BIGINT,
  has_error BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.egress_monitoring (date, request_count, total_bytes, error_count)
  VALUES (CURRENT_DATE, 1, bytes_used, CASE WHEN has_error THEN 1 ELSE 0 END)
  ON CONFLICT (date) DO UPDATE SET
    request_count = egress_monitoring.request_count + 1,
    total_bytes = egress_monitoring.total_bytes + bytes_used,
    error_count = egress_monitoring.error_count + CASE WHEN has_error THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

-- Function to get egress metrics
CREATE OR REPLACE FUNCTION public.get_egress_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only superadmins can view egress metrics
  IF get_user_role_safe(auth.uid()) != 'superadmin' THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;

  SELECT jsonb_build_object(
    'total_requests', COALESCE(SUM(request_count), 0),
    'total_bytes', COALESCE(SUM(total_bytes), 0),
    'total_errors', COALESCE(SUM(error_count), 0),
    'error_rate', CASE 
      WHEN SUM(request_count) > 0 THEN 
        ROUND((SUM(error_count)::DECIMAL / SUM(request_count)) * 100, 2)
      ELSE 0 
    END,
    'daily_breakdown', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date,
          'requests', request_count,
          'bytes', total_bytes,
          'errors', error_count
        )
      )
      FROM egress_monitoring
      WHERE date BETWEEN start_date AND end_date
      ORDER BY date DESC
    )
  ) INTO result
  FROM egress_monitoring
  WHERE date BETWEEN start_date AND end_date;
  
  RETURN COALESCE(result, '{"total_requests": 0, "total_bytes": 0, "total_errors": 0, "error_rate": 0}'::jsonb);
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_egress_monitoring_updated_at
  BEFORE UPDATE ON public.egress_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();