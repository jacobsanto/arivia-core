
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";

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

  useEffect(() => {
    if (!user || !recipientId) return;

    // Set up real-time listeners based on chat type
    const table = chatType === 'general' ? 'chat_messages' : 'direct_messages';
    const column = chatType === 'general' ? 'channel_id' : 'recipient_id';
    const channelName = `chat-${chatType}-${recipientId}`;
    
    // Create a channel for this specific chat
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table,
        filter: `${column}=eq.${recipientId}`
      }, (payload) => {
        // Don't show messages from ourselves (we already added them)
        const senderId = payload.new.sender_id;
          
        if (senderId === user.id) return;
        
        // Format message from payload
        let newMessage: Message = {
          id: payload.new.id,
          sender: "User", // Will be updated with user details
          avatar: "/placeholder.svg",
          content: payload.new.content,
          timestamp: payload.new.created_at,
          isCurrentUser: false,
          reactions: chatType === 'general' ? (payload.new.reactions || {}) : {}
        };
        
        // Try to fetch user details
        const fetchSenderDetails = async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('name, avatar')
              .eq('id', senderId)
              .single();
              
            if (data) {
              newMessage.sender = data.name || "Unknown User";
              newMessage.avatar = data.avatar || "/placeholder.svg";
            }
            
            setMessages(prev => [...prev, newMessage]);
          } catch (error) {
            console.warn("Could not fetch sender details", error);
            setMessages(prev => [...prev, newMessage]);
          }
        };
        
        fetchSenderDetails();
      });
      
    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        console.warn(`Failed to subscribe to ${channelName}:`, status);
      }
    });
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId, chatType, setMessages]);
}
