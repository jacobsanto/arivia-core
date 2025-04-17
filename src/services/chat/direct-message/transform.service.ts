
import { DirectMessage as ChatDirectMessage } from '../chat.types';

// Define an interface for the database direct message structure
export interface DbDirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean | null;
  created_at?: string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    name: string;
  }>;
}

/**
 * Transforms a database direct message to a ChatDirectMessage type
 */
export function transformToDirectMessage(msg: DbDirectMessage): ChatDirectMessage {
  return {
    id: msg.id,
    sender_id: msg.sender_id,
    recipient_id: msg.recipient_id,
    content: msg.content,
    is_read: msg.is_read || false,
    created_at: msg.created_at,
    attachments: msg.attachments || []
  };
}
