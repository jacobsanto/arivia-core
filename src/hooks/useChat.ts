import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";

export interface Message {
  id: string; // Using string to match database IDs
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: Record<string, string[]>;
}

export function useChat(chatType: 'general' | 'direct', recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageInput, setMessageInput] = useState<string>("");
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

  useEffect(() => {
    if (!user) return;
    
    let channel;
    
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
        .subscribe();
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
                chatService.markDirectMessageAsRead(newMsg.id);
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
        .subscribe();
    }
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, chatType, recipientId]);

  const sendMessage = async () => {
    if (!user || !messageInput.trim()) return;
    
    try {
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        sender: user.name,
        avatar: user.avatar || "/placeholder.svg",
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        reactions: {}
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setMessageInput("");
      
      if (chatType === 'general') {
        const result = await chatService.sendChannelMessage({
          channel_id: GENERAL_CHAT_CHANNEL_ID,
          user_id: user.id,
          content: messageInput.trim()
        });
        
        if (!result) {
          setMessages(prev => prev.filter(m => m.id !== tempId));
          toast.error("Failed to send message");
        }
      } else if (chatType === 'direct' && recipientId) {
        const result = await chatService.sendDirectMessage({
          sender_id: user.id,
          recipient_id: recipientId,
          content: messageInput.trim(),
          is_read: false
        });
        
        if (!result) {
          setMessages(prev => prev.filter(m => m.id !== tempId));
          toast.error("Failed to send message");
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== `temp-${Date.now()}`));
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      const updatedMessages = messages.map(msg => {
        if (msg.id === messageId) {
          const currentReactions = { ...msg.reactions } || {};
          
          const usersForEmoji = currentReactions[emoji] || [];
          const username = user.name || "Unknown";
          
          const userIndex = usersForEmoji.indexOf(username);
          
          if (userIndex >= 0) {
            currentReactions[emoji] = [
              ...usersForEmoji.slice(0, userIndex),
              ...usersForEmoji.slice(userIndex + 1)
            ];
            if (currentReactions[emoji].length === 0) {
              delete currentReactions[emoji];
            }
          } else {
            currentReactions[emoji] = [...usersForEmoji, username];
          }
          
          return {
            ...msg,
            reactions: currentReactions
          };
        }
        return msg;
      });
      
      setMessages(updatedMessages);
      
      if (chatType === 'general') {
        await chatService.addReaction(messageId, emoji, user.id);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  return {
    messages,
    loading,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction
  };
}
