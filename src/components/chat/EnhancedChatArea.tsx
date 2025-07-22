import React, { useMemo } from 'react';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { ChatHeader } from './ChatHeader';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { TypingIndicator } from './TypingIndicator';
import { MessageSkeletonList } from './MessageSkeleton';
import { useMessageSearch } from '@/hooks/chat/useMessageSearch';
import { useResponsiveChat } from '@/hooks/chat/useResponsiveChat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Message } from '@/hooks/useChatTypes';

interface EnhancedChatAreaProps {
  activeChat: string;
  activeChatType: 'channel' | 'direct';
  messages: Message[];
  message: string;
  isLoading: boolean;
  typingUsers: string[];
  emojis: string[];
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEmojiClick: (messageId: string, emoji: string) => void;
  channels: any[];
  directMessages: any[];
  presenceUsers: any[];
  toggleSidebar: () => void;
}

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  activeChat,
  activeChatType,
  messages,
  message,
  isLoading,
  typingUsers,
  emojis,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
  onSendMessage,
  onChangeMessage,
  onEmojiClick,
  channels,
  directMessages,
  presenceUsers,
  toggleSidebar
}) => {
  const { isMobile } = useResponsiveChat();
  const { 
    searchQuery, 
    setSearchQuery, 
    filteredMessages, 
    isSearchActive, 
    toggleSearch, 
    clearSearch 
  } = useMessageSearch(messages);
  
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = React.useState(400);

  // Calculate chat height for virtualization
  React.useEffect(() => {
    const updateHeight = () => {
      if (chatContainerRef.current) {
        const container = chatContainerRef.current;
        const rect = container.getBoundingClientRect();
        const newHeight = window.innerHeight - rect.top - 100;
        setChatHeight(Math.max(newHeight, 300));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Get current chat info
  const currentChatInfo = useMemo(() => {
    if (!activeChat) return { title: 'Select a chat', subtitle: '' };
    
    if (activeChatType === 'channel') {
      const channel = channels.find(c => c.id === activeChat);
      return {
        title: channel?.name || 'Unknown Channel',
        subtitle: channel?.description || `${presenceUsers.length} members online`,
        memberCount: presenceUsers.length
      };
    } else {
      const dm = directMessages.find(d => d.id === activeChat);
      const otherUser = dm?.participants?.find(p => p.id !== 'current-user');
      return {
        title: otherUser?.name || 'Direct Message',
        subtitle: otherUser?.isOnline ? 'Online' : 'Offline',
        isOnline: otherUser?.isOnline
      };
    }
  }, [activeChat, activeChatType, channels, directMessages, presenceUsers]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium">Welcome to Team Chat</h3>
          <p className="text-sm">Select a channel or start a direct message to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Enhanced Chat Header */}
      <ChatHeader
        title={currentChatInfo.title}
        subtitle={currentChatInfo.subtitle}
        isOnline={currentChatInfo.isOnline}
        memberCount={currentChatInfo.memberCount}
        onSearchClick={toggleSearch}
        onToggleSidebar={isMobile ? toggleSidebar : undefined}
      />

      {/* Search Bar */}
      {isSearchActive && (
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
      
      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex-1 p-4">
            <MessageSkeletonList count={8} />
          </div>
        ) : (
          <VirtualizedMessageList
            messages={isSearchActive ? filteredMessages : messages}
            height={chatHeight}
            reactionMessageId={reactionMessageId}
            setReactionMessageId={setReactionMessageId}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            addReaction={onEmojiClick}
            emojis={emojis}
          />
        )}

        {/* Typing Indicator */}
        <TypingIndicator users={typingUsers} />
      </div>

      {/* Enhanced Message Input */}
      <EnhancedMessageInput
        message={message}
        onChange={onChangeMessage}
        onSubmit={onSendMessage}
        disabled={!activeChat}
        placeholder="Type a message..."
      />
    </div>
  );
};