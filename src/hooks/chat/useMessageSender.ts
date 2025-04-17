
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { offlineManager } from "@/utils/offlineManager";

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
  const [messageInput, setMessageInput] = useState("");
  const [sendError, setSendError] = useState<Error | null>(null);
  const { user } = useUser();

  const sendMessage = async () => {
    if (!messageInput.trim() || !user) {
      return;
    }

    // Reset error state
    setSendError(null);

    // Create a temporary message to show immediately
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      sender: user.name || "You",
      avatar: user.avatar || "/placeholder.svg",
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
      reactions: {}
    };

    // Add the message to the list
    setMessages(prev => [...prev, tempMessage]);
    
    // Clear the input
    setMessageInput("");
    clearTyping();

    // If offline, store for later sync
    if (isOffline) {
      offlineManager.storeOfflineData('message', 'create', {
        chatType,
        recipientId,
        content: tempMessage.content,
        sender_id: user.id
      });
      toast.info("Message saved for later sending", {
        description: "Will be sent when you reconnect"
      });
      return;
    }

    try {
      if (chatType === 'general' && recipientId) {
        // Send to channel
        const sentMessage = await chatService.sendChannelMessage({
          channel_id: recipientId,
          user_id: user.id,
          content: tempMessage.content,
          is_read: false
        });
        
        // Replace the temp message with the real one if we got a response
        if (sentMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? {
                ...msg,
                id: sentMessage.id,
                timestamp: sentMessage.created_at || msg.timestamp
              } : msg
            )
          );
        }
      } else if (chatType === 'direct' && recipientId) {
        // Send direct message
        const directMessage = await chatService.sendDirectMessage({
          sender_id: user.id,
          recipient_id: recipientId,
          content: tempMessage.content,
          is_read: false
        });
        
        // Replace the temp message if we got a response
        if (directMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? {
                ...msg,
                id: directMessage.id,
                timestamp: directMessage.created_at || msg.timestamp
              } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError(error instanceof Error ? error : new Error("Failed to send message"));
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? {
            ...msg,
            error: true,
            errorMessage: error instanceof Error ? error.message : "Network error"
          } : msg
        )
      );
      
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Network error"
      });
    }
  };

  return {
    messageInput,
    setMessageInput,
    sendMessage,
    sendError
  };
}
