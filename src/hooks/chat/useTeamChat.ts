
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { useChannelAndUsers } from "@/hooks/chat/useChannelAndUsers";
import { useChat } from "@/hooks/useChat";
import { useChatError } from "@/hooks/chat/useChatError";

export function useTeamChat() {
  // State
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Hooks
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { addError, removeError, errors } = useChatError();
  
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
  
  // Handle connection errors
  if (loadError && errors.length === 0) {
    addError('connection', loadError);
  }
  
  // Use our chat hook to manage messages
  const {
    messages,
    loading,
    isOffline,
    error,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction,
    typingStatus,
    handleTyping,
    clearTyping,
    // New functions from enhanced useChat
    attachments,
    fileInputRef,
    imageInputRef,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    showEmojiPicker: showMessageEmojiPicker,
    toggleEmojiPicker: toggleMessageEmojiPicker,
    handleEmojiSelect
  } = useChat(chatType, activeChatId);

  // Handle chat errors
  if (error && errors.length === 0) {
    addError('general', error);
  }

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

  const handleEmojiClick = (emoji: string, messageId: string) => {
    addReaction(messageId, emoji);
    setReactionMessageId(null);
    setShowEmojiPicker(false);
  };

  // Extract just the emoji symbols
  const emojiSymbols = ["👍", "❤️", "😊", "🎉", "😂", "🤔", "👏", "🙏", "🔥", "⭐", "😍", "😎", "🤩", "😢", "😡", "🤯", "🤝", "👋", "✅", "❌"];

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
    reactionMessageId,
    showEmojiPicker,
    emojiSymbols,
    errors,
    // New state
    attachments,
    fileInputRef,
    imageInputRef,
    showMessageEmojiPicker,

    // Actions
    setActiveTab,
    toggleSidebar,
    handleSelectChat,
    handleSendMessage,
    handleChangeMessage,
    addReaction: handleEmojiClick,
    setReactionMessageId,
    setShowEmojiPicker,
    removeError,
    // New actions
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    toggleMessageEmojiPicker,
    handleEmojiSelect
  };
}
