
-- Table to map properties to Guesty listings
CREATE TABLE IF NOT EXISTS guesty_properties (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  guesty_listing_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (property_id)
);

-- Table to log Guesty API synchronization activities
CREATE TABLE IF NOT EXISTS guesty_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS policies for guesty_properties
ALTER TABLE guesty_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to superadmins"
  ON guesty_properties
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- RLS policies for guesty_sync_logs
ALTER TABLE guesty_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow superadmins to view logs"
  ON guesty_sync_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- Update trigger for guesty_properties
CREATE TRIGGER set_guesty_properties_updated_at
BEFORE UPDATE ON guesty_properties
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
