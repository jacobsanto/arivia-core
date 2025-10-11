import { supabase } from "@/integrations/supabase/client";
import { Message } from "../../useChatTypes";
import { logger } from "@/services/logger";

export async function loadChannelMessages(user: any, setIsOffline: (offline: boolean) => void): Promise<Message[]> {
  try {
    setIsOffline(false);
    
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!author_id(id, name, avatar)
      `)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      logger.error('Error loading channel messages', { error });
      throw error;
    }

    return (data || []).map((msg: any) => ({
      id: msg.id,
      sender: msg.sender?.[0]?.name || 'Unknown User',
      avatar: msg.sender?.[0]?.avatar || '/placeholder.svg',
      content: msg.content,
      timestamp: msg.created_at,
      isCurrentUser: msg.author_id === user.id,
      reactions: msg.reactions || {},
      attachments: []
    }));
  } catch (error) {
    logger.error('Channel message loading failed', { error });
    setIsOffline(true);
    // Return empty array instead of throwing to prevent cascade failures
    return [];
  }
}
