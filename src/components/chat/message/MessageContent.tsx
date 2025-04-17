
import React from "react";
import { Message } from "@/hooks/useChatTypes";
import EmojiPicker from "../emoji/EmojiPicker";
import MessageReactions from "../emoji/MessageReactions";
import { Paperclip } from "lucide-react";

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
        
        {/* Display attachments if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map(attachment => (
              <div key={attachment.id} className="flex flex-col">
                {attachment.type.startsWith('image/') ? (
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-block"
                  >
                    <img 
                      src={attachment.url} 
                      alt={attachment.name} 
                      className="max-h-48 max-w-full rounded-md object-cover" 
                    />
                  </a>
                ) : (
                  <a 
                    href={attachment.url} 
                    download={attachment.name}
                    className="flex items-center gap-2 py-1 px-2 bg-background/20 backdrop-blur-sm rounded text-xs hover:bg-background/30 transition-colors"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
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
