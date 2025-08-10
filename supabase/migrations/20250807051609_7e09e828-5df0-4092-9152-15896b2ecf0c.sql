-- Create external_integrations table for generic integrations
CREATE TABLE IF NOT EXISTS public.external_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- communication, finance, marketing, property_management, etc.
  integration_type TEXT NOT NULL DEFAULT 'api', -- api, webhook, both
  provider TEXT NOT NULL, -- guesty, slack, quickbooks, etc.
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, error, configuring
  health_score INTEGER DEFAULT 100, -- 0-100 health indicator
  last_sync TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  api_endpoint TEXT,
  webhook_url TEXT,
  auth_method TEXT DEFAULT 'api_key', -- api_key, oauth2, bearer_token, basic_auth
  config JSONB DEFAULT '{}', -- flexible configuration storage
  credentials JSONB DEFAULT '{}', -- encrypted credentials
  rate_limit_per_hour INTEGER DEFAULT 1000,
  timeout_seconds INTEGER DEFAULT 30,
  retry_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_configs table for integration templates
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE, -- guesty, slack, quickbooks, etc.
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  logo_url TEXT,
  documentation_url TEXT,
  setup_difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  estimated_setup_time TEXT DEFAULT '10 minutes',
  supported_operations JSONB DEFAULT '[]', -- ['read', 'write', 'webhook']
  required_fields JSONB DEFAULT '[]', -- field definitions for setup form
  optional_fields JSONB DEFAULT '[]',
  webhook_events JSONB DEFAULT '[]', -- supported webhook events
  rate_limits JSONB DEFAULT '{}', -- rate limit information
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create webhook_endpoints table for webhook management
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.external_integrations(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL,
  secret_key TEXT, -- for signature verification
  events JSONB DEFAULT '[]', -- subscribed events
  headers JSONB DEFAULT '{}', -- custom headers
  last_received TIMESTAMP WITH TIME ZONE,
  last_successful TIMESTAMP WITH TIME ZONE,
  total_received INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive, error
  verification_token TEXT, -- for endpoint verification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create api_logs table for comprehensive API monitoring
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.external_integrations(id) ON DELETE CASCADE,
  request_method TEXT NOT NULL,
  request_url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  response_time_ms INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_health table for monitoring
CREATE TABLE IF NOT EXISTS public.integration_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.external_integrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy, warning, error, unknown
  last_synced TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  error_count_24h INTEGER DEFAULT 0,
  success_rate_24h DECIMAL(5,2) DEFAULT 100.00,
  avg_response_time_ms INTEGER,
  next_sync TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_integrations
CREATE POLICY "Admins can manage all integrations"
ON public.external_integrations
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "Staff can view integrations"
ON public.external_integrations
FOR SELECT
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff']));

-- RLS Policies for integration_configs (read-only for most users)
CREATE POLICY "Users can view integration configs"
ON public.integration_configs
FOR SELECT
USING (is_authenticated());

CREATE POLICY "Admins can manage integration configs"
ON public.integration_configs
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator']));

-- RLS Policies for webhook_endpoints
CREATE POLICY "Admins can manage webhook endpoints"
ON public.webhook_endpoints
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager']));

-- RLS Policies for api_logs
CREATE POLICY "Admins can view API logs"
ON public.api_logs
FOR SELECT
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator']));

CREATE POLICY "System can create API logs"
ON public.api_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for integration_health
CREATE POLICY "Admins can view integration health"
ON public.integration_health
FOR SELECT
USING (get_current_user_role() = ANY(ARRAY['superadmin', 'administrator', 'property_manager']));

CREATE POLICY "System can manage integration health"
ON public.integration_health
FOR ALL
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_external_integrations_provider ON public.external_integrations(provider);
CREATE INDEX idx_external_integrations_category ON public.external_integrations(category);
CREATE INDEX idx_external_integrations_status ON public.external_integrations(status);
CREATE INDEX idx_api_logs_integration_id ON public.api_logs(integration_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX idx_webhook_endpoints_integration_id ON public.webhook_endpoints(integration_id);
CREATE INDEX idx_integration_health_provider ON public.integration_health(provider);

-- Create triggers for updated_at columns
CREATE TRIGGER update_external_integrations_updated_at
  BEFORE UPDATE ON public.external_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_integration_health_updated_at
  BEFORE UPDATE ON public.integration_health
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample integration configs for popular platforms
INSERT INTO public.integration_configs (provider, name, description, category, setup_difficulty, estimated_setup_time, supported_operations, required_fields, optional_fields, webhook_events) VALUES
('slack', 'Slack', 'Send notifications and messages to Slack channels', 'communication', 'easy', '5 minutes', 
 '["send_message", "webhook"]'::jsonb,
 '[{"name": "webhook_url", "type": "url", "label": "Slack Webhook URL", "required": true, "description": "Create an incoming webhook in your Slack workspace"}]'::jsonb,
 '[{"name": "channel", "type": "text", "label": "Default Channel", "required": false, "description": "Default channel for notifications"}]'::jsonb,
 '["message"]'::jsonb),

('discord', 'Discord', 'Send notifications to Discord channels', 'communication', 'easy', '5 minutes',
 '["send_message", "webhook"]'::jsonb,
 '[{"name": "webhook_url", "type": "url", "label": "Discord Webhook URL", "required": true, "description": "Create a webhook in your Discord channel settings"}]'::jsonb,
 '[]'::jsonb,
 '["message"]'::jsonb),

('quickbooks', 'QuickBooks Online', 'Sync financial data with QuickBooks', 'finance', 'hard', '30 minutes',
 '["read", "write", "sync"]'::jsonb,
 '[{"name": "client_id", "type": "text", "label": "Client ID", "required": true}, {"name": "client_secret", "type": "password", "label": "Client Secret", "required": true}]'::jsonb,
 '[{"name": "sandbox_mode", "type": "boolean", "label": "Sandbox Mode", "required": false}]'::jsonb,
 '["invoice_created", "payment_received"]'::jsonb),

('mailchimp', 'Mailchimp', 'Email marketing and guest communication', 'marketing', 'medium', '15 minutes',
 '["read", "write", "sync"]'::jsonb,
 '[{"name": "api_key", "type": "password", "label": "API Key", "required": true}, {"name": "audience_id", "type": "text", "label": "Audience ID", "required": true}]'::jsonb,
 '[]'::jsonb,
 '["subscribe", "unsubscribe", "campaign_sent"]'::jsonb),

('zapier', 'Zapier', 'Connect to 5000+ apps via Zapier webhooks', 'automation', 'easy', '10 minutes',
 '["webhook"]'::jsonb,
 '[{"name": "webhook_url", "type": "url", "label": "Zapier Webhook URL", "required": true, "description": "Create a webhook trigger in Zapier"}]'::jsonb,
 '[]'::jsonb,
 '["custom"]'::jsonb),

('teams', 'Microsoft Teams', 'Send notifications to Microsoft Teams', 'communication', 'easy', '5 minutes',
 '["send_message", "webhook"]'::jsonb,
 '[{"name": "webhook_url", "type": "url", "label": "Teams Webhook URL", "required": true, "description": "Create an incoming webhook in Teams"}]'::jsonb,
 '[]'::jsonb,
 '["message"]'::jsonb);

-- Insert health records for Guesty (existing integration)
INSERT INTO public.integration_health (integration_id, provider, status, last_synced, updated_at)
SELECT id, 'guesty', 'healthy', NOW(), NOW()
FROM public.external_integrations 
WHERE provider = 'guesty'
ON CONFLICT DO NOTHING;