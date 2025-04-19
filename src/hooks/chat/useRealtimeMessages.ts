import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { useToastService } from "@/contexts/ToastContext";

interface UseRealtimeMessagesProps {
  chatType: 'general' | 'direct';
  recipientId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useRealtimeMessages({ 
  chatType, 
  recipientId, 
  messages, 
  setMessages 
}: UseRealtimeMessagesProps) {
  const { user } = useUser();
  const toastService = useToastService();

  const handleNewMessage = useCallback(async (payload: any) => {
    const senderId = payload.new.sender_id;
    if (senderId === user?.id) return;
    
    let newMessage: Message = {
      id: payload.new.id,
      sender: "User",
      avatar: "/placeholder.svg",
      content: payload.new.content,
      timestamp: payload.new.created_at,
      isCurrentUser: false,
      reactions: chatType === 'general' ? (payload.new.reactions || {}) : {}
    };
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', senderId)
        .maybeSingle();
            
      if (data) {
        newMessage.sender = data.name || "Unknown User";
        newMessage.avatar = data.avatar || "/placeholder.svg";
      }
          
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.warn("Could not fetch sender details", error);
      setMessages(prev => [...prev, newMessage]);
    }
  }, [user?.id, chatType, setMessages]);

  useEffect(() => {
    if (!user || !recipientId) return;

    const table = chatType === 'general' ? 'chat_messages' : 'direct_messages';
    const column = chatType === 'general' ? 'channel_id' : 'recipient_id';
    const channelName = `chat-${chatType}-${recipientId}`;
    
    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table,
        filter: `${column}=eq.${recipientId}`
      }, handleNewMessage)
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log(`Subscribed to ${channelName}`);
        } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
          console.log(`Channel ${channelName} closed`);
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error(`Channel ${channelName} error`);
          toastService.error("Lost connection to chat", {
            description: "Messages may be delayed. Trying to reconnect..."
          });
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId, chatType, handleNewMessage, toastService]);
}
