
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { useChannelAndUsers } from "@/hooks/chat/useChannelAndUsers";
import { useChat } from "@/hooks/useChat";

export function useTeamChat() {
  // State
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hooks
  const isMobile = useIsMobile();
  const { user } = useUser();
  
  // Use our new hook for channel and users data
  const {
    channels,
    directMessages, 
    isConnected,
    loadError,
    activeChat,
    activeChatId,
    chatType,
    handleSelectChat
  } = useChannelAndUsers();
  
  // Use our chat hook to manage messages
  const {
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
  } = useChat(chatType, activeChatId);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  // Extract just the emoji symbols
  const emojiSymbols = ["👍", "❤️", "😊", "🎉", "😂", "🤔"];

  return {
    // State
    activeChat,
    activeTab,
    sidebarOpen,
    channels,
    directMessages,
    isConnected,
    loadError,
    messageInput,
    messages,
    loading,
    isOffline,
    typingStatus,
    reactionMessageId: null,
    showEmojiPicker: false,
    emojiSymbols,

    // Actions
    setActiveTab,
    toggleSidebar,
    handleSelectChat,
    handleSendMessage,
    handleChangeMessage,
    addReaction,
    setReactionMessageId: () => {},
    setShowEmojiPicker: () => {}
  };
}
