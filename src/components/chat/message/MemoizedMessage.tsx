
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

// Use a more effective memoization that considers all the important properties
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
    key={message.id}
    message={message}
    emojis={emojis}
    onAddReaction={onAddReaction}
    reactionMessageId={reactionMessageId}
    setReactionMessageId={setReactionMessageId}
    showEmojiPicker={showEmojiPicker}
    setShowEmojiPicker={setShowEmojiPicker}
  />
), (prevProps, nextProps) => {
  // Check if any of the required props are undefined
  if (!prevProps.message || !nextProps.message) return false;
  
  // Only re-render under these specific conditions:
  // 1. If the message ID changes
  if (prevProps.message.id !== nextProps.message.id) return false;
  
  // 2. If the message content changes
  if (prevProps.message.content !== nextProps.message.content) return false;
  
  // 3. If the message attachments change
  const prevAttachments = JSON.stringify(prevProps.message.attachments || []);
  const nextAttachments = JSON.stringify(nextProps.message.attachments || []);
  if (prevAttachments !== nextAttachments) return false;
  
  // 4. If this message's reaction state changes
  const prevReactions = JSON.stringify(prevProps.message.reactions || {});
  const nextReactions = JSON.stringify(nextProps.message.reactions || {});
  if (prevReactions !== nextReactions) return false;
  
  // 5. If this specific message is being reacted to
  if (
    (prevProps.reactionMessageId === prevProps.message.id || nextProps.reactionMessageId === nextProps.message.id) &&
    prevProps.reactionMessageId !== nextProps.reactionMessageId
  ) return false;
  
  // 6. If the emoji picker visibility changes for this message
  if (
    prevProps.reactionMessageId === prevProps.message.id &&
    prevProps.showEmojiPicker !== nextProps.showEmojiPicker
  ) return false;
  
  // Otherwise, don't re-render
  return true;
});

MemoizedMessage.displayName = 'MemoizedMessage';

export default MemoizedMessage;
