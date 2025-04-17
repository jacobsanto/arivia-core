
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
export const GENERAL_CHAT_CHANNEL_ID = "00000000-0000-0000-0000-000000000001";

// Fallback channel for offline mode
export const FALLBACK_GENERAL_CHANNEL: ChatChannel = {
  id: GENERAL_CHAT_CHANNEL_ID,
  name: 'General',
  description: 'Public chat for all users',
  is_property_specific: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Fallback messages for offline mode
export const FALLBACK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    channel_id: GENERAL_CHAT_CHANNEL_ID,
    user_id: 'system',
    content: 'Welcome to Arivia Villas Team Chat! Currently in offline mode.',
    reactions: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
