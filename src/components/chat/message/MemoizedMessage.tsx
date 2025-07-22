
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
  // More precise comparison to prevent unnecessary re-renders
  
  // Always re-render if message ID changed (different message)
  if (prevProps.message.id !== nextProps.message.id) return false;
  
  // Check if message content changed
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (prevProps.message.timestamp !== nextProps.message.timestamp) return false;
  
  // Check reactions with better comparison
  const prevReactions = prevProps.message.reactions || {};
  const nextReactions = nextProps.message.reactions || {};
  const prevReactionKeys = Object.keys(prevReactions);
  const nextReactionKeys = Object.keys(nextReactions);
  
  if (prevReactionKeys.length !== nextReactionKeys.length) return false;
  
  for (const key of prevReactionKeys) {
    const prevUsers = prevReactions[key] || [];
    const nextUsers = nextReactions[key] || [];
    if (prevUsers.length !== nextUsers.length) return false;
    if (!prevUsers.every((user, i) => user === nextUsers[i])) return false;
  }
  
  // Only check emoji picker state if this message is the active one
  const isThisMessageActive = prevProps.message.id === prevProps.reactionMessageId || 
                             nextProps.message.id === nextProps.reactionMessageId;
  
  if (isThisMessageActive) {
    if (prevProps.reactionMessageId !== nextProps.reactionMessageId) return false;
    if (prevProps.showEmojiPicker !== nextProps.showEmojiPicker) return false;
  }
  
  // Don't re-render if only non-active emoji picker state changed
  return true;
});

MemoizedMessage.displayName = 'MemoizedMessage';

export default MemoizedMessage;
