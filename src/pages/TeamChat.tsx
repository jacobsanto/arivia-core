
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { EnhancedChatArea } from "@/components/chat/EnhancedChatArea";
import ConnectionAlerts from "@/components/chat/status/ConnectionAlerts";
import { useTeamChat } from "@/hooks/chat/useTeamChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamChatErrorBoundary } from "@/components/error-boundaries/TeamChatErrorBoundary";

const TeamChat = React.memo(() => {
  const isMobile = useIsMobile();
  const teamChatData = useTeamChat();

  // Destructure with stable references
  const {
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
    attachments,
    fileInputRef,
    imageInputRef,
    showMessageEmojiPicker,
    setActiveTab,
    toggleSidebar,
    handleSelectChat,
    handleSendMessage,
    handleChangeMessage,
    addReaction,
    setReactionMessageId,
    setShowEmojiPicker,
    removeError,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    toggleMessageEmojiPicker,
    handleEmojiSelect,
  } = teamChatData;

  // Stable memoized components
  const connectionAlerts = useMemo(() => (
    <ConnectionAlerts 
      isConnected={isConnected} 
      loadError={loadError} 
      errors={errors}
      onDismissError={removeError}
    />
  ), [isConnected, loadError, errors, removeError]);

  const sidebar = useMemo(() => (
    <ChatSidebar
      channels={channels}
      directMessages={directMessages}
      activeChat={activeChat}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleSelectChat={handleSelectChat}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
    />
  ), [channels, directMessages, activeChat, activeTab, setActiveTab, handleSelectChat, sidebarOpen, toggleSidebar]);

  const chatArea = useMemo(() => (
    <EnhancedChatArea
      activeChat={activeChat}
      activeChatType={activeTab === 'channels' ? 'channel' : 'direct'}
      messages={messages}
      message={messageInput}
      isLoading={loading}
      typingUsers={Array.isArray(typingStatus) ? typingStatus : []}
      emojis={emojiSymbols}
      reactionMessageId={reactionMessageId}
      setReactionMessageId={setReactionMessageId}
      showEmojiPicker={showEmojiPicker}
      setShowEmojiPicker={setShowEmojiPicker}
      onSendMessage={handleSendMessage}
      onChangeMessage={handleChangeMessage}
      onEmojiClick={(messageId, emoji) => addReaction(emoji, messageId)}
      channels={channels}
      directMessages={directMessages}
      presenceUsers={[]}
      toggleSidebar={toggleSidebar}
    />
  ), [
    activeChat, 
    activeTab,
    messages, 
    messageInput, 
    loading,
    typingStatus,
    emojiSymbols,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker,
    setShowEmojiPicker,
    handleSendMessage,
    handleChangeMessage,
    addReaction,
    channels,
    directMessages,
    toggleSidebar
  ]);

  return (
    <TeamChatErrorBoundary>
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
          <p className="text-muted-foreground">
            Communicate in real-time with your team members.
          </p>
        </div>
        
        {connectionAlerts}
        
        <div className="flex flex-1 gap-4 h-full">
          {isMobile && (
            <div className="md:hidden absolute top-4 right-4 z-20">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          {sidebar}
          {chatArea}
        </div>
      </div>
    </TeamChatErrorBoundary>
  );
});

TeamChat.displayName = 'TeamChat';

export default TeamChat;
