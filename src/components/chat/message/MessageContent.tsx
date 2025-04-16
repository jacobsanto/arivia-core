
import React from "react";
import { Message } from "@/hooks/useChatTypes";
import EmojiPicker from "../emoji/EmojiPicker";
import MessageReactions from "../emoji/MessageReactions";

interface MessageContentProps {
  message: Message;
  emojis: string[];
  isHoveringMessage: boolean;
  setIsHoveringMessage: (hovering: boolean) => void;
  handleMessageMouseEnter: () => void;
  handleMessageMouseLeave: () => void;
  handleEmojiClick: (emoji: string, e: React.MouseEvent) => void;
  reactionMessageId: string | null;
  showEmojiPicker: boolean;
  handlePickerMouseEnter: () => void;
  handlePickerMouseLeave: () => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
  message,
  emojis,
  handleMessageMouseEnter,
  handleMessageMouseLeave,
  handleEmojiClick,
  reactionMessageId,
  showEmojiPicker,
  handlePickerMouseEnter,
  handlePickerMouseLeave,
}) => {
  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-md ${
          message.isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary"
        }`}
        onMouseEnter={handleMessageMouseEnter}
        onMouseLeave={handleMessageMouseLeave}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      
      {/* Emoji reactions display */}
      <MessageReactions 
        reactions={message.reactions || {}} 
        onEmojiClick={handleEmojiClick} 
      />
      
      {/* Only show emoji picker for messages that aren't from the current user */}
      {!message.isCurrentUser && reactionMessageId === message.id && showEmojiPicker && (
        <EmojiPicker
          emojis={emojis}
          onEmojiClick={handleEmojiClick}
          onMouseEnter={handlePickerMouseEnter}
          onMouseLeave={handlePickerMouseLeave}
        />
      )}
    </div>
  );
};

export default MessageContent;
