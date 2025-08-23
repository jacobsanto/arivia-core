import React, { useMemo } from 'react';
import { MessageHeader } from './MessageHeader';
import { MessageListContainer } from './MessageListContainer';
import { MessageInput } from './MessageInput';
import { EmptyState } from '../ui/EmptyState';
import { Message } from '@/hooks/useChatTypes';
import { Channel, DirectMessage } from '../sidebar/ChatSidebar';

interface MessageAreaProps {
  activeChat: string;
  activeChatType: 'channel' | 'direct';
  messages: Message[];
  message: string;
  isLoading: boolean;
  typingUsers: string[];
  onSendMessage: () => void;
  onChangeMessage: (message: string) => void;
  channels: Channel[];
  directMessages: DirectMessage[];
}

export const MessageArea: React.FC<MessageAreaProps> = ({
  activeChat,
  activeChatType,
  messages,
  message,
  isLoading,
  typingUsers,
  onSendMessage,
  onChangeMessage,
  channels,
  directMessages
}) => {
  // Get current chat info
  const currentChatInfo = useMemo(() => {
    if (!activeChat) return null;
    
    if (activeChatType === 'channel') {
      const channel = channels.find(c => c.name === activeChat);
      return channel ? {
        title: `#${channel.name}`,
        subtitle: channel.description || `${channel.memberCount} members`,
        memberCount: channel.memberCount,
        isPrivate: channel.isPrivate
      } : null;
    } else {
      const dm = directMessages.find(d => d.name === activeChat);
      return dm ? {
        title: dm.name,
        subtitle: dm.status === 'online' ? 'Active now' : `Last seen ${dm.lastSeen?.toLocaleDateString() || 'Unknown'}`,
        status: dm.status,
        avatar: dm.avatar
      } : null;
    }
  }, [activeChat, activeChatType, channels, directMessages]);

  if (!activeChat) {
    return (
      <EmptyState
        title="Welcome to Team Chat"
        description="Select a channel or start a direct message to begin chatting."
      />
    );
  }

  if (!currentChatInfo) {
    return (
      <EmptyState
        title="Chat not found"
        description="The selected chat could not be found."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message Header */}
      <MessageHeader
        title={currentChatInfo.title}
        subtitle={currentChatInfo.subtitle}
        memberCount={currentChatInfo.memberCount}
        status={currentChatInfo.status}
        avatar={currentChatInfo.avatar}
        isPrivate={currentChatInfo.isPrivate}
      />

      {/* Message List */}
      <div className="flex-1 min-h-0">
        <MessageListContainer
          messages={messages}
          isLoading={isLoading}
          typingUsers={typingUsers}
          activeChat={activeChat}
        />
      </div>

      {/* Message Input */}
      <MessageInput
        message={message}
        onChangeMessage={onChangeMessage}
        onSendMessage={onSendMessage}
        placeholder={`Message ${currentChatInfo.title}...`}
        disabled={!activeChat}
      />
    </div>
  );
};