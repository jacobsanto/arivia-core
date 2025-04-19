import React, { memo, useMemo } from 'react';
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

/**
 * Memoized chat message component to prevent unnecessary re-renders
 * Only re-renders when the specific message or its reactions change
 */
const MemoizedMessage = memo(({
  message,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}: MemoizedMessageProps) => {
  // Use useMemo for complex props to ensure consistent reference
  const messageProps = useMemo(() => ({
    key: message.id,
    message,
    emojis,
    onAddReaction,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker,
    setShowEmojiPicker
  }), [
    message,
    emojis, 
    onAddReaction, 
    reactionMessageId, 
    setReactionMessageId, 
    showEmojiPicker, 
    setShowEmojiPicker
  ]);
  
  return <ChatMessage {...messageProps} />;
}, (prevProps, nextProps) => {
  // Check if any of the required props are undefined
  if (!prevProps.message || !nextProps.message) return false;
  
  // 1. If the message ID changes (should never happen for same component)
  if (prevProps.message.id !== nextProps.message.id) return false;
  
  // 2. If the message content changes
  if (prevProps.message.content !== nextProps.message.content) return false;
  
  // 3. If the message attachments change
  const prevAttachmentsLength = prevProps.message.attachments?.length || 0;
  const nextAttachmentsLength = nextProps.message.attachments?.length || 0;
  
  if (prevAttachmentsLength !== nextAttachmentsLength) return false;
  
  if (prevAttachmentsLength > 0) {
    const prevAttachments = JSON.stringify(prevProps.message.attachments);
    const nextAttachments = JSON.stringify(nextProps.message.attachments);
    if (prevAttachments !== nextAttachments) return false;
  }
  
  // 4. If this message's reaction state changes
  const prevReactions = prevProps.message.reactions || {};
  const nextReactions = nextProps.message.reactions || {};
  
  // Quick check: different number of reaction types
  const prevReactionTypes = Object.keys(prevReactions).length;
  const nextReactionTypes = Object.keys(nextReactions).length;
  
  if (prevReactionTypes !== nextReactionTypes) return false;
  
  // Deeper check for reactions if needed
  if (prevReactionTypes > 0) {
    // Get sorted keys for comparison
    const prevReactionKeys = Object.keys(prevReactions).sort();
    const nextReactionKeys = Object.keys(nextReactions).sort();
    
    // Check if reaction types match
    if (prevReactionKeys.join(',') !== nextReactionKeys.join(',')) return false;
    
    // Check each reaction's users
    for (const key of prevReactionKeys) {
      const prevUsers = (prevReactions[key] || []).sort();
      const nextUsers = (nextReactions[key] || []).sort();
      
      if (prevUsers.length !== nextUsers.length) return false;
      if (prevUsers.join(',') !== nextUsers.join(',')) return false;
    }
  }
  
  // 5. If this specific message is being reacted to
  const isReactionTargetChanged = (
    (prevProps.reactionMessageId === prevProps.message.id || nextProps.reactionMessageId === nextProps.message.id) &&
    prevProps.reactionMessageId !== nextProps.reactionMessageId
  );
  
  if (isReactionTargetChanged) return false;
  
  // 6. If the emoji picker visibility changes for this message
  const isEmojiPickerChanged = (
    prevProps.reactionMessageId === prevProps.message.id &&
    prevProps.showEmojiPicker !== nextProps.showEmojiPicker
  );
  
  if (isEmojiPickerChanged) return false;
  
  // Otherwise, don't re-render
  return true;
});

MemoizedMessage.displayName = 'MemoizedMessage';

export default MemoizedMessage;
