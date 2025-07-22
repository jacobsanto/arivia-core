
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
}: MemoizedMessageProps) => {
  return (
    <ChatMessage
      message={message}
      emojis={emojis}
      onAddReaction={onAddReaction}
      reactionMessageId={reactionMessageId}
      setReactionMessageId={setReactionMessageId}
      showEmojiPicker={showEmojiPicker}
      setShowEmojiPicker={setShowEmojiPicker}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if the message content or reactions actually changed
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.content !== nextProps.message.content) return false;
  
  // Check reactions
  const prevReactionsStr = JSON.stringify(prevProps.message.reactions || {});
  const nextReactionsStr = JSON.stringify(nextProps.message.reactions || {});
  if (prevReactionsStr !== nextReactionsStr) return false;
  
  // Check if this message is involved in emoji picker state
  const isThisMessageActive = prevProps.message.id === prevProps.reactionMessageId || 
                             nextProps.message.id === nextProps.reactionMessageId;
  if (isThisMessageActive && (
    prevProps.reactionMessageId !== nextProps.reactionMessageId ||
    prevProps.showEmojiPicker !== nextProps.showEmojiPicker
  )) return false;
  
  return true;
});

MemoizedMessage.displayName = 'MemoizedMessage';

export default MemoizedMessage;
