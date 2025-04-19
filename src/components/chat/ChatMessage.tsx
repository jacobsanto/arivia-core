
import React, { memo } from "react";
import { Message } from "@/hooks/useChatTypes";
import MessageContent from "./message/MessageContent";
import MessageAvatar from "./message/MessageAvatar";
import MessageTimestamp from "./message/MessageTimestamp";
import { useMessageHover } from "@/hooks/chat/useMessageHover";
import { AnimatePresence, motion } from "framer-motion";

interface ChatMessageProps {
  message: Message;
  emojis: string[];
  onAddReaction: (messageId: string, emoji: string) => void;
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const ChatMessage = memo<ChatMessageProps>(({
  message,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  const {
    isHoveringMessage,
    setIsHoveringMessage,
    handleMessageMouseEnter: baseHandleMessageMouseEnter,
    handleMessageMouseLeave: baseHandleMessageMouseLeave,
    handlePickerMouseEnter,
    handlePickerMouseLeave
  } = useMessageHover();
  
  const handleMessageMouseEnter = () => {
    baseHandleMessageMouseEnter(
      message.id,
      message.isCurrentUser,
      setReactionMessageId,
      setShowEmojiPicker
    );
  };
  
  const handleMessageMouseLeave = () => {
    baseHandleMessageMouseLeave(setShowEmojiPicker);
  };
  
  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddReaction(message.id, emoji);
  };

  const messagePickerHandler = {
    handlePickerMouseEnter: () => handlePickerMouseEnter(),
    handlePickerMouseLeave: () => handlePickerMouseLeave(setShowEmojiPicker)
  };

  const userObj = {
    name: message.sender,
    avatar: message.avatar,
    id: message.id
  };

  return (
    <motion.div
      className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, type: "tween" }}
      layout="position"
      layoutId={message.id}
    >
      <div
        className={`flex max-w-[80%] ${
          message.isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <MessageAvatar 
          user={userObj} 
          isCurrentUser={message.isCurrentUser} 
        />
        
        <div>
          <MessageContent
            message={message}
            emojis={emojis}
            isHoveringMessage={isHoveringMessage}
            setIsHoveringMessage={setIsHoveringMessage}
            handleMessageMouseEnter={handleMessageMouseEnter}
            handleMessageMouseLeave={handleMessageMouseLeave}
            handleEmojiClick={handleEmojiClick}
            reactionMessageId={reactionMessageId}
            showEmojiPicker={showEmojiPicker}
            {...messagePickerHandler}
          />
          
          <MessageTimestamp 
            timestamp={message.timestamp}
            isCurrentUser={message.isCurrentUser}
          />
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.showEmojiPicker === nextProps.showEmojiPicker &&
    prevProps.reactionMessageId === nextProps.reactionMessageId &&
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions)
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
