import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/hooks/useChatTypes';
import MessageList from './MessageList';

interface MessageListContainerProps {
  messages: Message[];
  isLoading: boolean;
  typingUsers: string[];
  activeChat: string;
}

export const MessageListContainer: React.FC<MessageListContainerProps> = ({
  messages,
  isLoading,
  typingUsers,
  activeChat
}) => {
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No messages yet</p>
          <p className="text-sm mt-1">Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <MessageList
        messages={messages}
        emojis={[]}
        onAddReaction={() => {}}
        reactionMessageId={null}
        setReactionMessageId={() => {}}
        showEmojiPicker={false}
        setShowEmojiPicker={() => {}}
        typingStatus={typingUsers.join(', ')}
        activeChat={activeChat}
        isLoading={isLoading}
      />
      
      {typingUsers.length > 0 && (
        <div className="p-4 text-sm text-muted-foreground">
          {typingUsers.length === 1 ? (
            <span>{typingUsers[0]} is typing...</span>
          ) : (
            <span>{typingUsers.join(', ')} are typing...</span>
          )}
        </div>
      )}
    </ScrollArea>
  );
};