
import { useState } from "react";
import { useUser } from "@/contexts/auth/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageStorage } from "./useMessageStorage";
import { useTypingIndicator } from "./useTypingIndicator";
import { useMessageReactions } from "./useMessageReactions";
import { Message, MessageReaction } from "./useChatTypes";

// Use "export type" for re-exporting types
export type { Message, MessageReaction };

export const useChatMessages = (activeChat: string) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [message, setMessage] = useState("");
  
  // Use our custom hooks
  const { messages, setMessages } = useMessageStorage(activeChat);
  const { typingStatus, handleTyping, clearTyping } = useTypingIndicator();
  const { 
    reactionMessageId, 
    setReactionMessageId, 
    showEmojiPicker, 
    setShowEmojiPicker, 
    addReaction: addReactionToMessage 
  } = useMessageReactions(messages, setMessages);

  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: user?.name || "Admin",
        avatar: user?.avatar || "/placeholder.svg",
        content: message.trim(),
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        reactions: {} // Initialize empty reactions object
      };
      
      setMessages([...messages, newMessage]);
      setMessage("");
      clearTyping();
      
      toast({
        title: "Message sent",
        description: `Your message was sent to ${activeChat}`,
      });
    }
  };
  
  const addReaction = (messageId: number, emoji: string) => {
    const username = user?.name || "Admin";
    addReactionToMessage(messageId, emoji, username);
  };

  return {
    messages,
    message,
    setMessage,
    typingStatus,
    handleChangeMessage,
    handleSendMessage,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker,
    setShowEmojiPicker,
    addReaction
  };
};
