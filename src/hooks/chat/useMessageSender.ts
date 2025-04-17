
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";

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
  const { user } = useUser();

  const sendMessage = async () => {
    if (!messageInput.trim() || !user) {
      return;
    }

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

    // If offline, just show a toast and don't try to send to server
    if (isOffline) {
      toast.warning("Message saved locally. Will sync when online.");
      return;
    }

    try {
      if (chatType === 'general') {
        // Send to channel
        const sentMessage = await chatService.sendChannelMessage({
          channel_id: recipientId || '',
          user_id: user.id,
          content: tempMessage.content
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
      toast.error("Failed to send message");
    }
  };

  return {
    messageInput,
    setMessageInput,
    sendMessage
  };
}
