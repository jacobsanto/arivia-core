
import { supabase } from '@/integrations/supabase/client';

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  is_property_specific: boolean;
  property_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id?: string;
  content: string;
  reactions?: Record<string, any>;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}

// Define database structure interfaces to avoid type mismatches
export interface ChatMessageDB {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  reactions?: Record<string, any>;
}
