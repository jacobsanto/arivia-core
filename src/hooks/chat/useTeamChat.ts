
import { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { useChannelAndUsers } from "@/hooks/chat/useChannelAndUsers";
import { useChat } from "@/hooks/useChat";
import { useChatError } from "@/hooks/chat/useChatError";
import { useChatEfficiency } from "@/hooks/chat/useChatEfficiency";
import { toast } from "@/hooks/use-toast";

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
  const efficiency = useChatEfficiency();
  
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
  
  // Handle connection errors with toast notifications
  if (loadError && errors.length === 0) {
    addError('connection', loadError);
    toast({
      title: "Connection Error",
      description: "Unable to connect to chat services. Please check your connection.",
      variant: "destructive",
    });
  }
  
  // Use our chat hook to manage messages with memoization to prevent excessive renders
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
    showMessageEmojiPicker,
    toggleMessageEmojiPicker,
    handleEmojiSelect
  } = useChat(chatType, activeChatId);

  // Once messages are loaded, mark initial load as complete
  if (messages.length > 0 && !efficiency.hasInitialLoad) {
    efficiency.markInitialLoadComplete();
  }

  // Handle chat errors with toast notifications
  if (error && errors.length === 0) {
    addError('general', error);
    toast({
      title: "Chat Error",
      description: "Failed to load chat messages. Please try refreshing.",
      variant: "destructive",
    });
  }

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Handle sending messages
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  }, [sendMessage]);

  const handleChangeMessage = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  }, [setMessageInput, handleTyping]);

  const handleEmojiClick = useCallback((emoji: string, messageId: string) => {
    addReaction(messageId, emoji);
    setReactionMessageId(null);
    setShowEmojiPicker(false);
  }, [addReaction]);

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
