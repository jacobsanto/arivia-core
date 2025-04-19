
import React, { memo } from 'react';
import ChatMessage from '../ChatMessage';
import { Message } from '@/hooks/useChatTypes';

interface MemoizedMessageProps {
  message: Message;
  emojis: string[];
  onAddReaction: (messageId: string, emoji: string) => void;
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const MemoizedMessage = memo(({
  message,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}: MemoizedMessageProps) => (
  <ChatMessage
    message={message}
    emojis={emojis}
    onAddReaction={onAddReaction}
    reactionMessageId={reactionMessageId}
    setReactionMessageId={setReactionMessageId}
    showEmojiPicker={showEmojiPicker}
    setShowEmojiPicker={setShowEmojiPicker}
  />
), (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.reactionMessageId === nextProps.reactionMessageId &&
    prevProps.showEmojiPicker === nextProps.showEmojiPicker &&
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions)
  );
});

MemoizedMessage.displayName = 'MemoizedMessage';

export default MemoizedMessage;
