
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { 
  useMessageLoader, 
  useRealtimeMessages, 
  useMessageSender, 
  useMessageReactions 
} from "./chat";
import { Message } from "./useChatTypes";
import { useTypingIndicator } from "./chat/useTypingIndicator";

export type { Message };

export function useChat(chatType: 'general' | 'direct', recipientId?: string) {
  // Use the extracted hook for message loading
  const { messages, setMessages, loading } = useMessageLoader(chatType, recipientId);
  
  // Set up realtime message subscriptions
  useRealtimeMessages({ chatType, recipientId, messages, setMessages });
  
  // Use typing indicator
  const { typingStatus, handleTyping, clearTyping } = useTypingIndicator(
    chatType === 'general' ? 'general-chat' : recipientId
  );
  
  // Use the extracted hook for sending messages
  const { messageInput, setMessageInput, sendMessage } = useMessageSender({ 
    chatType, 
    recipientId, 
    messages, 
    setMessages,
    clearTyping 
  });
  
  // Use the extracted hook for message reactions
  const { addReaction } = useMessageReactions({ chatType, messages, setMessages });

  return {
    messages,
    loading,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction,
    typingStatus,
    handleTyping,
    clearTyping
  };
}
