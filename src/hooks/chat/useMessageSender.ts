
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Message } from "../useChatTypes";
import { v4 as uuidv4 } from 'uuid';
import { GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";

interface UseMessageSenderProps {
  chatType: 'general' | 'direct';
  recipientId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearTyping: () => void;
  isOffline?: boolean;
}

export function useMessageSender({
  chatType,
  recipientId,
  messages,
  setMessages,
  clearTyping,
  isOffline = false
}: UseMessageSenderProps) {
  const [messageInput, setMessageInput] = useState("");
  const { user } = useUser();

  const sendMessage = async () => {
    if (!messageInput.trim() || !user) return;
    
    const now = new Date().toISOString();
    const tempId = uuidv4();
    
    // Create local message object
    const newUiMessage: Message = {
      id: tempId,
      sender: user.name || user.email || "You",
      avatar: user.avatar || "/placeholder.svg",
      content: messageInput.trim(),
      timestamp: now,
      isCurrentUser: true,
      reactions: {}
    };
    
    // Add message to UI immediately for better UX
    setMessages(prev => [...prev, newUiMessage]);
    setMessageInput("");
    clearTyping();
    
    // Don't try to send to server if offline
    if (isOffline) {
      toast.info("You're in offline mode", {
        description: "Messages will not be sent to the server"
      });
      return;
    }
    
    try {
      // Send to server
      if (chatType === 'general') {
        await chatService.sendChannelMessage({
          channel_id: GENERAL_CHAT_CHANNEL_ID,
          user_id: user.id,
          content: messageInput.trim(),
          is_read: true
        });
      } else if (chatType === 'direct' && recipientId) {
        await chatService.sendDirectMessage({
          sender_id: user.id,
          recipient_id: recipientId,
          content: messageInput.trim(),
          is_read: false
        });
      }
      
      // No need to update UI again since we already added the local message
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Mark message as failed in the UI
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, content: `${msg.content} (Failed to send)`, failed: true } 
            : msg
        )
      );
      
      toast.error("Failed to send message", {
        description: "Please check your connection and try again"
      });
    }
  };

  return {
    messageInput,
    setMessageInput,
    sendMessage
  };
}
