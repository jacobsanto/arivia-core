
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { RealtimeChannel } from "@supabase/supabase-js";

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
  const isMountedRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Set the mounted flag
    isMountedRef.current = true;
    
    // Don't set up subscriptions unless we have a user and recipient
    if (!user || !recipientId) return;

    // Record the ID of the last message to prevent duplicates
    if (messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
    }
    
    // Clean up previous subscription if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const table = chatType === 'general' ? 'chat_messages' : 'direct_messages';
    const column = chatType === 'general' ? 'channel_id' : 'recipient_id';
    const channelName = `chat-${chatType}-${recipientId}`;
    
    console.log(`Setting up realtime subscription for ${channelName}`);
    
    // Create a new channel with a stable configuration
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table,
        filter: `${column}=eq.${recipientId}`
      }, async (payload) => {
        // Don't proceed if component is unmounted
        if (!isMountedRef.current) {
          console.log("Component unmounted, ignoring message update");
          return;
        }
        
        // Don't show messages from ourselves (we already added them)
        const senderId = payload.new.sender_id;
        if (senderId === user.id) return;
        
        // Prevent duplicate messages
        if (lastMessageIdRef.current === payload.new.id) {
          console.log("Duplicate message detected, skipping", payload.new.id);
          return;
        }
        
        try {
          // Get sender details
          const { data: senderData } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', senderId)
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
          
          // Update the last message ID
          lastMessageIdRef.current = newMessage.id;
          
          // Use a functional update to ensure we're working with the latest state
          setMessages(prev => {
            // Check if we already have this message (prevent duplicates)
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        } catch (error) {
          console.warn("Could not fetch sender details", error);
        }
      });

    // Subscribe and store the channel reference
    channel.subscribe((status: any) => {
      // Convert the string status to a type-safe comparison
      if (status === 'SUBSCRIBED') {
        if (isMountedRef.current) {
          channelRef.current = channel;
          console.log(`Successfully subscribed to ${channelName}`);
        } else {
          // Clean up if component unmounted during subscription
          supabase.removeChannel(channel);
        }
      } else if (status !== 'SUBSCRIBED' && status !== 'CLOSED') {
        console.warn(`Failed to subscribe to ${channelName}:`, status);
      }
    });
      
    // Clean up on unmount or when dependencies change
    return () => {
      console.log(`Cleaning up subscription for ${channelName}`);
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, recipientId, chatType, setMessages]);
}
