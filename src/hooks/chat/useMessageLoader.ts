
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Message } from "../useChatTypes";

export function useMessageLoader(chatType: 'general' | 'direct', recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    async function loadMessages() {
      setLoading(true);
      try {
        if (chatType === 'general') {
          const generalChannel = await chatService.getOrCreateGeneralChannel();
          if (generalChannel) {
            const channelMessages = await chatService.getChannelMessages(generalChannel.id);
            
            const uiMessages = channelMessages.map(msg => ({
              id: msg.id,
              sender: msg.user_id === user.id ? user.name : "Other User",
              avatar: msg.user_id === user.id ? (user.avatar || "/placeholder.svg") : "/placeholder.svg",
              content: msg.content,
              timestamp: msg.created_at || new Date().toISOString(),
              isCurrentUser: msg.user_id === user.id,
              reactions: msg.reactions || {}
            }));
            
            setMessages(uiMessages);
          }
        } else if (chatType === 'direct' && recipientId) {
          const directMessages = await chatService.getDirectMessages(user.id, recipientId);
          
          directMessages.forEach(msg => {
            if (msg.sender_id === recipientId && !msg.is_read) {
              chatService.markDirectMessageAsRead(msg.id);
            }
          });
          
          const uiMessages = directMessages.map(msg => ({
            id: msg.id,
            sender: msg.sender_id === user.id ? user.name : "Other User",
            avatar: msg.sender_id === user.id ? (user.avatar || "/placeholder.svg") : "/placeholder.svg",
            content: msg.content,
            timestamp: msg.created_at || new Date().toISOString(),
            isCurrentUser: msg.sender_id === user.id,
            reactions: {}
          }));
          
          setMessages(uiMessages);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    }
    
    loadMessages();
  }, [user, chatType, recipientId]);

  return { messages, setMessages, loading };
}
