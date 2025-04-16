
import React from "react";
import { Message } from "@/hooks/useChatTypes";
import MessageContent from "./message/MessageContent";
import MessageAvatar from "./message/MessageAvatar";
import MessageTimestamp from "./message/MessageTimestamp";
import { useMessageHover } from "@/hooks/chat/useMessageHover";

interface ChatMessageProps {
  message: Message;
  emojis: string[];
  onAddReaction: (messageId: string, emoji: string) => void;
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  // Use our custom hook for hover management
  const {
    isHoveringMessage,
    setIsHoveringMessage,
    handleMessageMouseEnter: baseHandleMessageMouseEnter,
    handleMessageMouseLeave: baseHandleMessageMouseLeave,
    handlePickerMouseEnter,
    handlePickerMouseLeave
  } = useMessageHover();
  
  // Create specific handlers for this message
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

  return (
    <div
      className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[80%] ${
          message.isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <MessageAvatar 
          sender={message.sender} 
          avatar={message.avatar} 
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
    </div>
  );
};

export default ChatMessage;
