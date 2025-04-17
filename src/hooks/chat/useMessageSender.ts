
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Message } from "../useChatTypes";
import { v4 as uuidv4 } from "uuid";

interface UseMessageSenderProps {
  chatType: 'general' | 'direct';
  recipientId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearTyping: () => void;
  isOffline: boolean;
}

export function useMessageSender({
  chatType,
  recipientId,
  messages,
  setMessages,
  clearTyping,
  isOffline
}: UseMessageSenderProps) {
  const [messageInput, setMessageInput] = useState('');
  const { user } = useUser();

  const sendMessage = async () => {
    if (!messageInput.trim() || !user) return;
    
    const timestamp = new Date().toISOString();
    const messageId = uuidv4();
    
    // Create a UI message that will be displayed immediately 
    const uiMessage: Message = {
      id: messageId,
      sender: user.name || "You",
      avatar: user.avatar || "/placeholder.svg",
      content: messageInput,
      timestamp,
      isCurrentUser: true,
      reactions: {}
    };
    
    // Always update local state first for responsive UI
    setMessages(prev => [...prev, uiMessage]);
    
    // Clear input and typing indicator
    setMessageInput('');
    clearTyping();
    
    // If offline, don't try to send to server
    if (isOffline) {
      toast.info("Message saved locally", {
        description: "You're in offline mode. Messages will be sent when connection is restored."
      });
      return;
    }
    
    try {
      if (chatType === 'general') {
        await chatService.sendChannelMessage({
          channel_id: "general",
          content: messageInput,
          sender_id: user.id,
          is_read: true,
        });
      } else if (chatType === 'direct' && recipientId) {
        await chatService.sendDirectMessage({
          sender_id: user.id,
          recipient_id: recipientId,
          content: messageInput,
          is_read: false,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Show error toast without removing the local message
      toast.error("Failed to send message to server", {
        description: "Message is visible to you but may not be delivered."
      });
    }
  };

  return {
    messageInput,
    setMessageInput,
    sendMessage
  };
}
