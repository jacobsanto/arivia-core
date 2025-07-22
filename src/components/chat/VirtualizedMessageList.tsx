
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Message } from '@/hooks/useChatTypes';
import MemoizedMessage from './message/MemoizedMessage';

interface VirtualizedMessageListProps {
  messages: Message[];
  height: number;
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;
  emojis: string[];
}

const ITEM_HEIGHT = 80; // Approximate height per message

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = React.memo(({
  messages,
  height,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
  addReaction,
  emojis
}) => {
  const listRef = useRef<List>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  // Memoize the message renderer to prevent unnecessary re-renders
  const renderMessage = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    
    if (!message) {
      return <div style={style} />;
    }
    
    return (
      <div style={style}>
        <div className="px-4 py-2">
          <MemoizedMessage
            message={message}
            emojis={emojis}
            reactionMessageId={reactionMessageId}
            setReactionMessageId={setReactionMessageId}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            onAddReaction={(emoji) => addReaction(message.id, emoji)}
          />
        </div>
      </div>
    );
  }, [messages, emojis, reactionMessageId, setReactionMessageId, showEmojiPicker, setShowEmojiPicker, addReaction]);

  const memoizedEmptyState = useMemo(() => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    </div>
  ), []);

  if (messages.length === 0) {
    return memoizedEmptyState;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <List
        ref={listRef}
        outerRef={outerRef}
        height={height}
        width="100%"
        itemCount={messages.length}
        itemSize={ITEM_HEIGHT}
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        overscanCount={5}
      >
        {renderMessage}
      </List>
    </div>
  );
});

VirtualizedMessageList.displayName = 'VirtualizedMessageList';
