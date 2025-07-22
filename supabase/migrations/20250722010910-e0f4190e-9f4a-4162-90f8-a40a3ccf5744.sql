-- Phase 2: Performance and Chat Optimization
-- Add missing indexes and fix performance issues

-- Add index for profiles table to fix sequential scans
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Add indexes for chat tables to improve performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_recipient ON public.direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Add missing indexes for housekeeping tasks
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_listing_booking ON public.housekeeping_tasks(listing_id, booking_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_due_date ON public.housekeeping_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_status ON public.housekeeping_tasks(status);

-- Add indexes for maintenance tasks
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_property_status ON public.maintenance_tasks(property_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_due_date ON public.maintenance_tasks(due_date);

-- Add indexes for damage reports
CREATE INDEX IF NOT EXISTS idx_damage_reports_property_status ON public.damage_reports(property_id, status);
CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON public.damage_reports(created_at DESC);

-- Add indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_usage_date ON public.inventory_usage(date);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_property ON public.inventory_usage(property);

-- Enable real-time for chat tables
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_channels REPLICA IDENTITY FULL;

-- Add chat tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channels;