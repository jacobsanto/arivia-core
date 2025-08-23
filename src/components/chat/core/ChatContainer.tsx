import React from 'react';
import { ChatLayout } from './ChatLayout';
import { ChatSidebar } from '../sidebar/ChatSidebar';
import { MessageArea } from '../messages/MessageArea';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { useChatState } from '@/hooks/chat/core/useChatState';
import { useChatActions } from '@/hooks/chat/core/useChatActions';

export const ChatContainer: React.FC = () => {
  const {
    // State
    activeChat,
    activeTab,
    sidebarOpen,
    channels,
    directMessages,
    messages,
    messageInput,
    isConnected,
    isLoading,
    errors,
    typingUsers,
    // Status
    connectionStatus
  } = useChatState();

  const chatActions = useChatActions();
  
  const handleSelectChatWrapper = (chatId: string, chatName: string, type: 'channel' | 'direct') => {
    chatActions.handleSelectChat(chatId, chatName, type === 'channel' ? 'general' : 'direct');
  };
  
  const handleSendMessageWrapper = () => {
    chatActions.handleSendMessage();
  };
  
  const handleChangeMessageWrapper = (message: string) => {
    chatActions.handleChangeMessage({ target: { value: message } } as any);
  };

  const sidebar = (
    <ChatSidebar
      channels={channels}
      directMessages={directMessages}
      activeChat={activeChat}
      activeTab={activeTab}
      onTabChange={chatActions.setActiveTab}
      onSelectChat={handleSelectChatWrapper}
      onClose={() => sidebarOpen && chatActions.toggleSidebar()}
    />
  );

  return (
    <>
      {/* Connection Alerts */}
      <ConnectionStatus 
        isConnected={isConnected}
        status={connectionStatus}
        errors={errors}
        onDismissError={chatActions.dismissError}
      />
      
      <ChatLayout
        sidebar={sidebar}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={chatActions.toggleSidebar}
      >
        <MessageArea
          activeChat={activeChat}
          activeChatType={activeTab === 'channels' ? 'channel' : 'direct'}
          messages={messages}
          message={messageInput}
          isLoading={isLoading}
          typingUsers={typingUsers}
          onSendMessage={handleSendMessageWrapper}
          onChangeMessage={handleChangeMessageWrapper}
          channels={channels}
          directMessages={directMessages}
        />
      </ChatLayout>
    </>
  );
};