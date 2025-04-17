
import { ChatMessage } from '../chat.types';

// Define an interface for the database message structure
export interface DbMessage {
  id: string;
  content: string;
  channel_id: string | null;
  sender_id: string;
  is_read: boolean | null;
  reactions: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    name: string;
  }>;
}

/**
 * Transforms a database message to a ChatMessage type
 */
export function transformToMessage(msg: DbMessage, channelId: string): ChatMessage {
  return {
    id: msg.id,
    channel_id: channelId,
    user_id: msg.sender_id,
    content: msg.content,
    is_read: msg.is_read || false,
    created_at: msg.created_at,
    updated_at: msg.updated_at,
    reactions: msg.reactions as Record<string, string[]> || {},
    attachments: msg.attachments || []
  };
}
