import React, { useState, useEffect } from 'react';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { EnhancedChatHeader } from '@/components/chat/EnhancedChatHeader';
import { MessageFeed } from '@/components/chat/MessageFeed';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatDetailSidebar } from '@/components/chat/ChatDetailSidebar';
import { ChatNotifications } from '@/components/chat/ChatNotifications';
import { TeamMemberList } from '@/components/chat/TeamMemberList';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Users, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const TeamChat: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamMembers, setShowTeamMembers] = useState(false);
  const [searchParams] = useSearchParams();

  const {
    chatListItems,
    activeMessages,
    activeDetails,
    typingUsers,
    teamMembers,
    activeItem,
    showDetailSidebar,
    replyingTo,
    isLoading,
    setActiveItem,
    setShowDetailSidebar,
    setReplyingTo,
    sendMessage,
    addReaction,
    createChannel,
    startDirectMessage,
    startTyping,
    stopTyping,
    loadInitialData
  } = useRealTimeChat();

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

  // Handle URL parameters for deep linking to conversations
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && chatListItems && setActiveItem) {
      // Find conversation by name parameter and select it
      const conversations = chatListItems.filter(item => item.type === 'direct');
      const targetConversation = conversations.find(conv => 
        conv.name.toLowerCase().replace(/\s+/g, '-') === conversationParam
      );
      
      if (targetConversation) {
        setActiveItem(targetConversation);
      }
    }
  }, [searchParams, chatListItems, setActiveItem]);

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

  const handleStartDirectMessage = async (userId: string) => {
    await startDirectMessage(userId);
    setShowTeamMembers(false); // Close team members panel
    toast({
      title: "Direct Message Started",
      description: "You can now chat directly with this team member.",
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Filter messages based on search query
  const filteredMessages = searchQuery 
    ? activeMessages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.author?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false)
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
      <div className="relative">
        <ChatSidebar
          chatItems={chatListItems}
          activeItem={activeItem}
          onSelectItem={(item) => {
            setActiveItem(item);
            setSearchQuery(''); // Clear search when switching conversations
          }}
          onChannelCreated={loadInitialData}
        />
        
        {/* Team Members Toggle */}
        <div className="absolute top-4 right-4">
          <Button
            variant={showTeamMembers ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowTeamMembers(!showTeamMembers)}
            className="h-8 w-8 p-0"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Team Members Panel */}
        {showTeamMembers && (
          <div className="absolute top-0 left-full w-80 h-full bg-background border-r shadow-lg z-10">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Team Members</h2>
            </div>
            <div className="p-4 overflow-y-auto">
              <TeamMemberList
                members={teamMembers}
                currentUserId={user?.id}
                onStartDirectMessage={handleStartDirectMessage}
                onStartCall={(userId) => {
                  toast({
                    title: "Voice Call",
                    description: "Voice call feature coming soon!",
                  });
                }}
                onStartVideoCall={(userId) => {
                  toast({
                    title: "Video Call", 
                    description: "Video call feature coming soon!",
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
      
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