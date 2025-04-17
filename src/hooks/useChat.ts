
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
  const { messages, setMessages, loading, isOffline } = useMessageLoader(chatType, recipientId);
  
  // Set up realtime message subscriptions - only if online
  if (!isOffline) {
    useRealtimeMessages({ chatType, recipientId, messages, setMessages });
  }
  
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
    clearTyping,
    isOffline 
  });
  
  // Use the extracted hook for message reactions
  const { addReaction } = useMessageReactions({ chatType, messages, setMessages, isOffline });

  return {
    messages,
    loading,
    isOffline,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction,
    typingStatus,
    handleTyping,
    clearTyping
  };
}
