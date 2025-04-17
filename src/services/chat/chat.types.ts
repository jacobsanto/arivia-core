
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
  reactions: Record<string, string[]>;
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

// Define a general chat channel ID using a proper UUID format
export const GENERAL_CHAT_CHANNEL_ID = "00000000-0000-0000-0000-000000000000";
