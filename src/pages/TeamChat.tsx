import React from 'react';
import { useTeamChat } from '@/hooks/useTeamChat';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageFeed } from '@/components/chat/MessageFeed';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatDetailSidebar } from '@/components/chat/ChatDetailSidebar';
import { useUser } from '@/contexts/UserContext';

const TeamChat: React.FC = () => {
  const { user } = useUser();
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

  return (
    <div className="h-screen flex bg-background">
      {/* Conversation List Sidebar */}
      <ChatSidebar
        chatItems={chatListItems}
        activeItem={activeItem}
        onSelectItem={setActiveItem}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <ChatHeader
          activeItem={activeItem}
          activeDetails={activeDetails}
          showDetailSidebar={showDetailSidebar}
          onToggleDetailSidebar={() => setShowDetailSidebar(!showDetailSidebar)}
        />
        
        {activeItem ? (
          <>
            {/* Message Feed */}
            <MessageFeed
              messages={activeMessages}
              typingUsers={typingUsers}
              currentUserId={user?.id}
              onReply={setReplyingTo}
              onAddReaction={addReaction}
            />
            
            {/* Message Input */}
            <MessageInput
              onSendMessage={sendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onStartTyping={startTyping}
              onStopTyping={stopTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Welcome to Team Chat</h3>
              <p className="text-muted-foreground">
                Select a channel or start a direct message to begin chatting
              </p>
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