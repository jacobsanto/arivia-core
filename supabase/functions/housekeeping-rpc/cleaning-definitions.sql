
-- Create a stored procedure to fetch cleaning definitions
CREATE OR REPLACE FUNCTION get_cleaning_definitions()
RETURNS TABLE (
  task_type TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY 
  SELECT cd.task_type, cd.description 
  FROM cleaning_service_definitions cd;
END;
$$ LANGUAGE plpgsql;
