-- Create operational analytics functions for reporting

-- Function to get housekeeping performance metrics
CREATE OR REPLACE FUNCTION get_housekeeping_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_tasks', COUNT(*),
    'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
    'completion_rate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / NULLIF(COUNT(*), 0)), 2
    ),
    'overdue_tasks', COUNT(*) FILTER (
      WHERE status != 'completed' AND due_date < CURRENT_DATE
    ),
    'by_type', jsonb_object_agg(
      task_type, 
      COUNT(*)
    ),
    'by_status', jsonb_object_agg(
      status,
      COUNT(*)
    )
  ) INTO result
  FROM housekeeping_tasks
  WHERE created_at::date BETWEEN start_date AND end_date;
  
  RETURN result;
END;
$$;

-- Function to get maintenance performance metrics
CREATE OR REPLACE FUNCTION get_maintenance_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_tasks', COUNT(*),
    'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
    'urgent_tasks', COUNT(*) FILTER (WHERE priority = 'urgent'),
    'high_priority_tasks', COUNT(*) FILTER (WHERE priority = 'high'),
    'avg_response_hours', COALESCE(
      ROUND(AVG(
        EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600
      ), 2), 0
    ),
    'by_priority', jsonb_object_agg(
      priority,
      COUNT(*)
    ),
    'by_status', jsonb_object_agg(
      status,
      COUNT(*)
    )
  ) INTO result
  FROM maintenance_tasks
  WHERE created_at::date BETWEEN start_date AND end_date;
  
  RETURN result;
END;
$$;

-- Function to get property operations metrics
CREATE OR REPLACE FUNCTION get_property_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  damage_count integer;
BEGIN
  -- Get damage reports count for the period
  SELECT COUNT(*) INTO damage_count
  FROM damage_reports
  WHERE created_at::date BETWEEN start_date AND end_date;

  SELECT jsonb_build_object(
    'total_properties', COUNT(*),
    'active_properties', COUNT(*) FILTER (WHERE status = 'active'),
    'sync_status', jsonb_object_agg(
      sync_status,
      COUNT(*)
    ),
    'damage_reports_period', damage_count,
    'last_sync', MAX(last_synced)
  ) INTO result
  FROM guesty_listings
  WHERE is_deleted = false;
  
  RETURN result;
END;
$$;

-- Function to get inventory analytics
CREATE OR REPLACE FUNCTION get_inventory_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_usage', COALESCE(SUM(quantity), 0),
    'usage_by_category', jsonb_object_agg(
      category,
      SUM(quantity)
    ),
    'usage_by_property', jsonb_object_agg(
      property,
      SUM(quantity)
    ),
    'top_used_items', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'item', item,
          'total_usage', usage_sum
        )
      )
      FROM (
        SELECT item, SUM(quantity) as usage_sum
        FROM inventory_usage
        WHERE date::date BETWEEN start_date AND end_date
        GROUP BY item
        ORDER BY usage_sum DESC
        LIMIT 10
      ) top_items
    )
  ) INTO result
  FROM inventory_usage
  WHERE date::date BETWEEN start_date AND end_date;
  
  RETURN result;
END;
$$;

-- Function to get comprehensive operational dashboard
CREATE OR REPLACE FUNCTION get_operational_dashboard(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'housekeeping', get_housekeeping_metrics(start_date, end_date),
    'maintenance', get_maintenance_metrics(start_date, end_date),
    'properties', get_property_metrics(start_date, end_date),
    'inventory', get_inventory_metrics(start_date, end_date),
    'period', jsonb_build_object(
      'start_date', start_date,
      'end_date', end_date,
      'days', end_date - start_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_housekeeping_metrics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_maintenance_metrics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_property_metrics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_inventory_metrics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_operational_dashboard(DATE, DATE) TO authenticated;