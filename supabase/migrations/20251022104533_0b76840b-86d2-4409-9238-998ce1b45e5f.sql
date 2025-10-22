-- Add missing columns to system_settings
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create index on category for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Add missing columns to chat_messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES chat_messages(id);

-- Add missing column to housekeeping_tasks
ALTER TABLE housekeeping_tasks 
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER;

-- Create message_reactions table for chat reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS on message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for message_reactions
CREATE POLICY "Users can view reactions"
ON message_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add their own reactions"
ON message_reactions FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
ON message_reactions FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- Update system_settings to use category as unique key instead of key
ALTER TABLE system_settings DROP CONSTRAINT IF EXISTS system_settings_key_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_unique_category ON system_settings(category) WHERE category IS NOT NULL;