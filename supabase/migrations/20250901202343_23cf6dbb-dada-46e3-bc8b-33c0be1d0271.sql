-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification types enum for better type safety
CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'task_completed', 
  'damage_report',
  'low_stock',
  'chat_mention',
  'order_status',
  'maintenance_request',
  'system_alert',
  'integration_status'
);

-- Add check constraint for notification type
ALTER TABLE public.notifications 
ADD CONSTRAINT valid_notification_type 
CHECK (type IN (
  'task_assigned',
  'task_completed', 
  'damage_report',
  'low_stock',
  'chat_mention',
  'order_status',
  'maintenance_request',
  'system_alert',
  'integration_status'
));