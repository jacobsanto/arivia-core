
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";
import { chatService } from "@/services/chat/chat.service";
import { Message } from "../useChatTypes";
import { toast } from "sonner";

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
    if (!user) return;
    
    let channel;
    let subscriptionAttempts = 0;
    const maxAttempts = 3;
    
    const setupRealtimeSubscription = () => {
      if (subscriptionAttempts >= maxAttempts) {
        console.warn(`Failed to establish realtime connection after ${maxAttempts} attempts`);
        return;
      }
      
      subscriptionAttempts++;
      
      try {
        if (chatType === 'general') {
          channel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes', 
              { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${GENERAL_CHAT_CHANNEL_ID}` },
              (payload) => {
                const newMsg = payload.new as any;
                
                if (newMsg.sender_id !== user.id) {
                  const uiMessage = {
                    id: newMsg.id,
                    sender: "Other User",
                    avatar: "/placeholder.svg",
                    content: newMsg.content,
                    timestamp: newMsg.created_at,
                    isCurrentUser: false,
                    reactions: newMsg.reactions || {}
                  };
                  
                  setMessages(prev => [...prev, uiMessage]);
                }
              }
            )
            .subscribe((status) => {
              if (status !== 'SUBSCRIBED' && status !== 'TIMED_OUT') {
                console.warn(`Realtime subscription status: ${status}`);
                if (status === 'CHANNEL_ERROR') {
                  // Wait and try again
                  setTimeout(() => setupRealtimeSubscription(), 2000);
                }
              }
            });
        } else if (chatType === 'direct' && recipientId) {
          channel = supabase
            .channel('public:direct_messages')
            .on('postgres_changes', 
              { event: 'INSERT', schema: 'public', table: 'direct_messages' },
              (payload) => {
                const newMsg = payload.new as any;
                
                if ((newMsg.sender_id === user.id && newMsg.recipient_id === recipientId) ||
                    (newMsg.sender_id === recipientId && newMsg.recipient_id === user.id)) {
                  
                  if (newMsg.sender_id === recipientId) {
                    chatService.markDirectMessageAsRead(newMsg.id).catch(err => {
                      console.warn("Failed to mark message as read:", err);
                    });
                  }
                  
                  if (newMsg.sender_id !== user.id) {
                    const uiMessage = {
                      id: newMsg.id,
                      sender: "Other User",
                      avatar: "/placeholder.svg",
                      content: newMsg.content,
                      timestamp: newMsg.created_at,
                      isCurrentUser: false,
                      reactions: {}
                    };
                    
                    setMessages(prev => [...prev, uiMessage]);
                  }
                }
              }
            )
            .subscribe((status) => {
              if (status !== 'SUBSCRIBED' && status !== 'TIMED_OUT') {
                console.warn(`Realtime subscription status: ${status}`);
                if (status === 'CHANNEL_ERROR') {
                  // Wait and try again
                  setTimeout(() => setupRealtimeSubscription(), 2000);
                }
              }
            });
        }
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
      }
    };
    
    setupRealtimeSubscription();
    
    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn("Error removing channel:", error);
        }
      }
    };
  }, [user, chatType, recipientId, setMessages]);
}
