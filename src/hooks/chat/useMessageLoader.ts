
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Message } from "../useChatTypes";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_MESSAGES } from "@/services/chat/chat.types";

export function useMessageLoader(chatType: 'general' | 'direct', recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
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
              try {
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
              } catch (error) {
                console.warn('Failed to load user profiles, using default values');
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
            setIsOffline(false);
          } else {
            // Fallback for offline mode or when channel creation fails
            setIsOffline(true);
            const fallbackMessages = FALLBACK_MESSAGES.map(msg => ({
              id: msg.id,
              sender: "System",
              avatar: "/placeholder.svg",
              content: msg.content,
              timestamp: msg.created_at || new Date().toISOString(),
              isCurrentUser: false,
              reactions: {}
            }));
            
            setMessages(fallbackMessages);
          }
        } else if (chatType === 'direct' && recipientId) {
          try {
            const directMessages = await chatService.getDirectMessages(user.id, recipientId);
            
            if (!isMounted) return;
            
            // Mark messages as read
            directMessages.forEach(msg => {
              if (msg.sender_id === recipientId && !msg.is_read) {
                chatService.markDirectMessageAsRead(msg.id);
              }
            });
            
            // Get sender and recipient profiles
            let userProfiles: Record<string, { name: string, avatar: string }> = {};
            
            try {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, avatar')
                .in('id', [user.id, recipientId]);
              
              if (profiles) {
                userProfiles = profiles.reduce((acc, profile) => {
                  acc[profile.id] = {
                    name: profile.name || 'Unknown User',
                    avatar: profile.avatar || '/placeholder.svg'
                  };
                  return acc;
                }, {} as Record<string, { name: string, avatar: string }>);
              }
            } catch (error) {
              console.warn('Failed to load user profiles, using default values');
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
            setIsOffline(false);
          } catch (error) {
            setIsOffline(true);
            setMessages([{
              id: 'offline-1',
              sender: 'System',
              avatar: '/placeholder.svg',
              content: 'Direct messaging is unavailable in offline mode.',
              timestamp: new Date().toISOString(),
              isCurrentUser: false,
              reactions: {}
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (isMounted) {
          setIsOffline(true);
          setMessages([{
            id: 'error-1',
            sender: 'System',
            avatar: '/placeholder.svg',
            content: 'Unable to load messages. Please check your connection and try again.',
            timestamp: new Date().toISOString(),
            isCurrentUser: false,
            reactions: {}
          }]);
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

  return { messages, setMessages, loading, isOffline };
}
