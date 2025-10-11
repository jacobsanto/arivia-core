
// @ts-nocheck

import { supabase } from "@/integrations/supabase/client";
import { Message } from "../../useChatTypes";
import { logger } from "@/services/logger";

export async function loadChannelMessages(user: any, setIsOffline: (offline: boolean) => void): Promise<Message[]> {
  try {
    setIsOffline(false);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!sender_id(id, name, avatar)
      `)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      logger.error('Error loading channel messages', { error });
      throw error;
    }

    return (data || []).map(msg => ({
      id: msg.id,
      sender: msg.sender?.name || 'Unknown User',
      avatar: msg.sender?.avatar || '/placeholder.svg',
      content: msg.content,
      timestamp: msg.created_at,
      isCurrentUser: msg.sender_id === user.id,
      reactions: (msg.reactions as any) || {},
      attachments: []
    }));
  } catch (error) {
    logger.error('Channel message loading failed', { error });
    setIsOffline(true);
    // Return empty array instead of throwing to prevent cascade failures
    return [];
  }
}
