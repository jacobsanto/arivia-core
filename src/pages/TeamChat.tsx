
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import ConnectionAlerts from "@/components/chat/status/ConnectionAlerts";
import { useTeamChat } from "@/hooks/chat/useTeamChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TeamChat = () => {
  const isMobile = useIsMobile();
  const {
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
    // New state from useMessageSender
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
    addReaction,
    setReactionMessageId,
    setShowEmojiPicker,
    removeError,
    // New actions from useMessageSender
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    toggleMessageEmojiPicker,
    handleEmojiSelect,
  } = useTeamChat();

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
        <p className="text-muted-foreground">
          Communicate in real-time with your team members.
        </p>
      </div>
      
      <ConnectionAlerts 
        isConnected={isConnected} 
        loadError={loadError} 
        errors={errors}
        onDismissError={removeError}
      />
      
      <div className="flex flex-1 gap-4 h-full">
        {/* Mobile Sidebar Toggle */}
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
        
        {/* Sidebar */}
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
        
        {/* Chat Area */}
        <ChatArea
          activeChat={activeChat}
          activeTab={activeTab}
          messages={messages}
          message={messageInput}
          typingStatus={typingStatus}
          handleChangeMessage={handleChangeMessage}
          handleSendMessage={handleSendMessage}
          toggleSidebar={toggleSidebar}
          emojis={emojiSymbols}
          onAddReaction={(emoji, messageId) => addReaction(emoji, messageId)}
          reactionMessageId={reactionMessageId}
          setReactionMessageId={setReactionMessageId}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          isLoading={loading}
          isOffline={isOffline}
          // New props
          attachments={attachments}
          fileInputRef={fileInputRef}
          imageInputRef={imageInputRef}
          handleFileSelect={handleFileSelect}
          handleImageSelect={handleImageSelect}
          handleFileClick={handleFileClick}
          handleImageClick={handleImageClick}
          removeAttachment={removeAttachment}
          showMessageEmojiPicker={showMessageEmojiPicker}
          toggleMessageEmojiPicker={toggleMessageEmojiPicker}
          handleEmojiSelect={handleEmojiSelect}
        />
      </div>
    </div>
  );
};

export default TeamChat;
