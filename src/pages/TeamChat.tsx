import React, { useState, useEffect } from 'react';
import { useTeamChat } from '@/hooks/useTeamChat';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { EnhancedChatHeader } from '@/components/chat/EnhancedChatHeader';
import { MessageFeed } from '@/components/chat/MessageFeed';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatDetailSidebar } from '@/components/chat/ChatDetailSidebar';
import { ChatNotifications } from '@/components/chat/ChatNotifications';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const TeamChat: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    chatListItems,
    activeMessages,
    activeDetails,
    typingUsers,
    activeItem,
    showDetailSidebar,
    replyingTo,
    setActiveItem,
    setShowDetailSidebar,
    setReplyingTo,
    sendMessage,
    addReaction,
    startTyping,
    stopTyping
  } = useTeamChat();

  // Track window focus for notifications
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleSearchMessages = (query: string) => {
    setSearchQuery(query);
    toast({
      title: "Search Messages",
      description: `Searching for: "${query}"`,
    });
  };

  const handleStartCall = () => {
    toast({
      title: "Starting Call",
      description: "Voice call feature coming soon!",
    });
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: notificationsEnabled 
        ? "You won't receive chat notifications" 
        : "You'll receive chat notifications",
    });
  };

  // Filter messages based on search query
  const filteredMessages = searchQuery 
    ? activeMessages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.author.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeMessages;

  return (
    <div className="h-screen flex bg-background">
      {/* Chat Notifications */}
      <ChatNotifications
        messages={activeMessages}
        currentUserId={user?.id}
        isWindowFocused={isWindowFocused}
        enableNotifications={notificationsEnabled}
      />

      {/* Conversation List Sidebar */}
      <ChatSidebar
        chatItems={chatListItems}
        activeItem={activeItem}
        onSelectItem={(item) => {
          setActiveItem(item);
          setSearchQuery(''); // Clear search when switching conversations
        }}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-background to-muted/20">
        {/* Enhanced Chat Header */}
        <EnhancedChatHeader
          activeItem={activeItem}
          activeDetails={activeDetails}
          showDetailSidebar={showDetailSidebar}
          onToggleDetailSidebar={() => setShowDetailSidebar(!showDetailSidebar)}
          onSearchMessages={handleSearchMessages}
          onStartCall={handleStartCall}
          onToggleNotifications={handleToggleNotifications}
          isNotificationEnabled={notificationsEnabled}
        />
        
        {activeItem ? (
          <>
            {/* Search Results Indicator */}
            {searchQuery && (
              <div className="px-4 py-2 bg-primary/5 border-b text-sm text-muted-foreground">
                {filteredMessages.length > 0 
                  ? `Found ${filteredMessages.length} message${filteredMessages.length !== 1 ? 's' : ''} containing "${searchQuery}"`
                  : `No messages found for "${searchQuery}"`
                }
              </div>
            )}

            {/* Message Feed */}
            <MessageFeed
              messages={filteredMessages}
              typingUsers={typingUsers}
              currentUserId={user?.id}
              onReply={setReplyingTo}
              onAddReaction={addReaction}
            />
            
            {/* Message Input */}
            <div className="border-t bg-background/80 backdrop-blur-sm">
              <MessageInput
                onSendMessage={sendMessage}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                onStartTyping={startTyping}
                onStopTyping={stopTyping}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Arivia Team Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Stay connected with your team, share updates, and coordinate operations seamlessly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Select a channel or start a direct message to begin chatting
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Sidebar */}
      {showDetailSidebar && (
        <ChatDetailSidebar
          activeItem={activeItem}
          activeDetails={activeDetails}
        />
      )}
    </div>
  );
};

export default TeamChat;