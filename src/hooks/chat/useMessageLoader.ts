
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Message } from "../useChatTypes";
import { supabase } from "@/integrations/supabase/client";

export function useMessageLoader(chatType: 'general' | 'direct', recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    
    async function loadMessages() {
      setLoading(true);
      try {
        if (chatType === 'general') {
          const generalChannel = await chatService.getOrCreateGeneralChannel();
          if (generalChannel) {
            const channelMessages = await chatService.getChannelMessages(generalChannel.id);
            
            if (!isMounted) return;
            
            // Get user profiles for all message senders
            const userIds = [...new Set(channelMessages.map(msg => msg.user_id))].filter(Boolean);
            
            let userProfiles: Record<string, { name: string, avatar: string }> = {};
            
            if (userIds.length > 0) {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, avatar')
                .in('id', userIds);
                
              if (profiles) {
                userProfiles = profiles.reduce((acc, profile) => {
                  acc[profile.id] = { 
                    name: profile.name || 'Unknown User', 
                    avatar: profile.avatar || '/placeholder.svg' 
                  };
                  return acc;
                }, {} as Record<string, { name: string, avatar: string }>);
              }
            }
            
            const uiMessages = channelMessages.map(msg => {
              const profile = msg.user_id ? userProfiles[msg.user_id] : null;
              
              return {
                id: msg.id,
                sender: profile?.name || "Unknown User",
                avatar: profile?.avatar || "/placeholder.svg",
                content: msg.content,
                timestamp: msg.created_at || new Date().toISOString(),
                isCurrentUser: msg.user_id === user.id,
                reactions: msg.reactions || {}
              };
            });
            
            setMessages(uiMessages);
          }
        } else if (chatType === 'direct' && recipientId) {
          const directMessages = await chatService.getDirectMessages(user.id, recipientId);
          
          if (!isMounted) return;
          
          // Mark messages as read
          directMessages.forEach(msg => {
            if (msg.sender_id === recipientId && !msg.is_read) {
              chatService.markDirectMessageAsRead(msg.id);
            }
          });
          
          // Get sender and recipient profiles
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar')
            .in('id', [user.id, recipientId]);
          
          let userProfiles: Record<string, { name: string, avatar: string }> = {};
          
          if (profiles) {
            userProfiles = profiles.reduce((acc, profile) => {
              acc[profile.id] = {
                name: profile.name || 'Unknown User',
                avatar: profile.avatar || '/placeholder.svg'
              };
              return acc;
            }, {} as Record<string, { name: string, avatar: string }>);
          }
          
          const uiMessages = directMessages.map(msg => {
            const isSender = msg.sender_id === user.id;
            const profileId = isSender ? user.id : recipientId;
            const profile = userProfiles[profileId];
            
            return {
              id: msg.id,
              sender: profile?.name || (isSender ? user.name : "Other User"),
              avatar: profile?.avatar || "/placeholder.svg",
              content: msg.content,
              timestamp: msg.created_at || new Date().toISOString(),
              isCurrentUser: isSender,
              reactions: {}
            };
          });
          
          setMessages(uiMessages);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (isMounted) {
          toast.error("Failed to load messages");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadMessages();
    
    return () => {
      isMounted = false;
    };
  }, [user, chatType, recipientId]);

  return { messages, setMessages, loading };
}
