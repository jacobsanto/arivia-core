
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeMessagesProps {
  chatType: 'general' | 'direct';
  recipientId: string;
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
  const isMountedRef = useRef(true);
  const subscriptionKeyRef = useRef<string>('');

  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // Stabilize the message update function
  const updateMessages = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Prevent duplicate messages
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
  }, [setMessages]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!user) {
      cleanupSubscription();
      return;
    }

    // For direct messages, we need a recipientId
    if (chatType === 'direct' && !recipientId) {
      cleanupSubscription();
      return;
    }

    const newSubscriptionKey = `${chatType}-${recipientId}-${user.id}`;
    
    // Don't recreate subscription if key hasn't changed
    if (subscriptionKeyRef.current === newSubscriptionKey && channelRef.current) {
      return;
    }

    // Clean up previous subscription
    cleanupSubscription();
    
    subscriptionKeyRef.current = newSubscriptionKey;
    const table = chatType === 'general' ? 'chat_messages' : 'direct_messages';
    const column = chatType === 'general' ? 'channel_id' : 'recipient_id';
    const channelName = `chat-${newSubscriptionKey}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table,
        filter: `${column}=eq.${recipientId}`
      }, async (payload) => {
        if (!isMountedRef.current || payload.new.sender_id === user.id) {
          return;
        }
        
        try {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', payload.new.sender_id)
            .maybeSingle();
            
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
          
          updateMessages(newMessage);
        } catch (error) {
          console.warn("Could not fetch sender details", error);
        }
      });

    channel.subscribe((status: any) => {
      if (status === 'SUBSCRIBED' && isMountedRef.current) {
        channelRef.current = channel;
      }
    });
      
    return () => {
      isMountedRef.current = false;
      cleanupSubscription();
    };
  }, [user, recipientId, chatType, updateMessages, cleanupSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupSubscription();
    };
  }, [cleanupSubscription]);
}
