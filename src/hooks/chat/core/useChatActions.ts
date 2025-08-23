import { useTeamChat } from '../useTeamChat';

export const useChatActions = () => {
  // Use existing team chat hook for now to maintain compatibility
  const teamChatData = useTeamChat();

  return {
    // Navigation
    toggleSidebar: teamChatData.toggleSidebar,
    setActiveTab: teamChatData.setActiveTab,
    handleSelectChat: teamChatData.handleSelectChat,
    
    // Messaging  
    handleSendMessage: (e?: React.FormEvent) => teamChatData.handleSendMessage(e),
    handleChangeMessage: teamChatData.handleChangeMessage,
    
    // Reactions and interactions
    addReaction: teamChatData.addReaction,
    
    // Error handling
    dismissError: teamChatData.removeError,
    
    // File handling
    handleFileSelect: teamChatData.handleFileSelect,
    handleImageSelect: teamChatData.handleImageSelect,
    removeAttachment: teamChatData.removeAttachment,
  };
};