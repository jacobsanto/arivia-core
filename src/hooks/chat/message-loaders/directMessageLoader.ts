
// @ts-nocheck

import { supabase } from "@/integrations/supabase/client";
import { Message } from "../../useChatTypes";

export async function loadDirectMessages(user: any, recipientId: string, setIsOffline: (offline: boolean) => void): Promise<Message[]> {
  try {
    setIsOffline(false);
    
    const { data, error } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:profiles!sender_id(id, name, avatar)
      `)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading direct messages:', error);
      throw error;
    }

    return (data || []).map(msg => ({
      id: msg.id,
      sender: (msg.sender as any)?.name || 'Unknown User',
      avatar: (msg.sender as any)?.avatar || '/placeholder.svg',
      content: msg.content,
      timestamp: msg.created_at,
      isCurrentUser: msg.sender_id === user.id,
      reactions: {},
      attachments: []
    }));
  } catch (error) {
    console.error('Direct message loading failed:', error);
    setIsOffline(true);
    // Return empty array instead of throwing to prevent cascade failures
    return [];
  }
}
