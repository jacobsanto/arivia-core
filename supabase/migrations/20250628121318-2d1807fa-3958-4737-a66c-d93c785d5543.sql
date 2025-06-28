
-- Phase 1: Enable RLS on all tables that currently have it disabled
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupancy_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guesty_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_service_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Phase 2: Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Phase 3: Create RLS policies for each table

-- Chat Channels: Users can view all channels, admins can manage
CREATE POLICY "Users can view chat channels" ON public.chat_channels
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create channels" ON public.chat_channels
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update channels" ON public.chat_channels
  FOR UPDATE USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

CREATE POLICY "Admins can delete channels" ON public.chat_channels
  FOR DELETE USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

-- Direct Messages: Users can only see messages they sent or received
CREATE POLICY "Users can view their direct messages" ON public.direct_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their sent messages" ON public.direct_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Financial Reports: Role-based access
CREATE POLICY "Admins and managers can view financial reports" ON public.financial_reports
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager'));

CREATE POLICY "Admins can manage financial reports" ON public.financial_reports
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

-- Occupancy Reports: Role-based access
CREATE POLICY "Admins and managers can view occupancy reports" ON public.occupancy_reports
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager'));

CREATE POLICY "Admins can manage occupancy reports" ON public.occupancy_reports
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

-- User Settings: Users can only access their own settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (user_id = auth.uid());

-- System Settings: Admin-only access
CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

-- Webhook Health: Admin-only access
CREATE POLICY "Admins can view webhook health" ON public.webhook_health
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

CREATE POLICY "System can manage webhook health" ON public.webhook_health
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

-- Inventory Usage: Role-based access
CREATE POLICY "Staff can view inventory usage" ON public.inventory_usage
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff'));

CREATE POLICY "Staff can create inventory usage records" ON public.inventory_usage
  FOR INSERT WITH CHECK (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff'));

CREATE POLICY "Managers can update inventory usage" ON public.inventory_usage
  FOR UPDATE USING (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager'));

-- Guesty API Usage: Admin-only access for monitoring
CREATE POLICY "Admins can view API usage" ON public.guesty_api_usage
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

CREATE POLICY "System can log API usage" ON public.guesty_api_usage
  FOR INSERT WITH CHECK (true); -- Allow system to log usage

-- Cleaning Service Definitions: Staff access
CREATE POLICY "Staff can view cleaning definitions" ON public.cleaning_service_definitions
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff'));

CREATE POLICY "Managers can manage cleaning definitions" ON public.cleaning_service_definitions
  FOR ALL USING (public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager'));

-- Sync Logs: Admin-only access
CREATE POLICY "Admins can view sync logs" ON public.sync_logs
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'administrator'));

CREATE POLICY "System can create sync logs" ON public.sync_logs
  FOR INSERT WITH CHECK (true); -- Allow system to create logs

CREATE POLICY "Admins can manage sync logs" ON public.sync_logs
  FOR UPDATE USING (public.get_current_user_role() IN ('superadmin', 'administrator'));
