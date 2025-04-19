
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

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
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user || !recipientId) return;

    // Clean up previous subscription if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const table = chatType === 'general' ? 'chat_messages' : 'direct_messages';
    const column = chatType === 'general' ? 'channel_id' : 'recipient_id';
    const channelName = `chat-${chatType}-${recipientId}`;
    
    // Create a new channel
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table,
        filter: `${column}=eq.${recipientId}`
      }, async (payload) => {
        // Don't show messages from ourselves (we already added them)
        const senderId = payload.new.sender_id;
        if (senderId === user.id) return;
        
        try {
          // Get sender details
          const { data: senderData } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', senderId)
            .single();
            
          const newMessage: Message = {
            id: payload.new.id,
            sender: senderData?.name || "Unknown User",
            avatar: senderData?.avatar || "/placeholder.svg",
            content: payload.new.content,
            timestamp: payload.new.created_at,
            isCurrentUser: false,
            reactions: chatType === 'general' ? (payload.new.reactions || {}) : {},
            attachments: payload.new.attachments
          };
            
          setMessages(prev => [...prev, newMessage]);
        } catch (error) {
          console.warn("Could not fetch sender details", error);
        }
      });

    // Subscribe and store the channel reference
    // Important: The status is returned as a string, not as an enum value
    channel.subscribe((status) => {
      // Using string literals for comparison instead of enum values
      if (status === 'SUBSCRIBED') {
        channelRef.current = channel;
      } else if (status !== 'SUBSCRIBED' && status !== 'CLOSED') {
        console.warn(`Failed to subscribe to ${channelName}:`, status);
      }
    });
      
    // Clean up on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, recipientId, chatType, setMessages]);
}
