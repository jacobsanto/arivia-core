
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";
import { Message } from "../useChatTypes";

interface UseMessageSenderProps {
  chatType: 'general' | 'direct';
  recipientId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearTyping?: () => void;
}

export function useMessageSender({ 
  chatType, 
  recipientId, 
  messages, 
  setMessages,
  clearTyping
}: UseMessageSenderProps) {
  const [messageInput, setMessageInput] = useState<string>("");
  const [sendingInProgress, setSendingInProgress] = useState<boolean>(false);
  const { user } = useUser();

  const sendMessage = async () => {
    if (!user || !messageInput.trim() || sendingInProgress) return;
    
    try {
      setSendingInProgress(true);
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        sender: user.name || user.email.split('@')[0],
        avatar: user.avatar || "/placeholder.svg",
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        reactions: {}
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      const currentMessage = messageInput.trim();
      setMessageInput("");
      
      // Clear typing indicator if provided
      if (clearTyping) {
        clearTyping();
      }
      
      if (chatType === 'general') {
        const result = await chatService.sendChannelMessage({
          channel_id: GENERAL_CHAT_CHANNEL_ID,
          user_id: user.id,
          content: currentMessage
        });
        
        if (!result) {
          setMessages(prev => prev.filter(m => m.id !== tempId));
          toast.error("Failed to send message");
        }
      } else if (chatType === 'direct' && recipientId) {
        const result = await chatService.sendDirectMessage({
          sender_id: user.id,
          recipient_id: recipientId,
          content: currentMessage,
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
    } finally {
      setSendingInProgress(false);
    }
  };

  return { messageInput, setMessageInput, sendMessage, sendingInProgress };
}
