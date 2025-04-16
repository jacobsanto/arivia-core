
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/hooks/useChatTypes";
import MessageContent from "./message/MessageContent";

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
  // Track mouse events with local state for better reliability
  const [isHoveringMessage, setIsHoveringMessage] = useState(false);
  const [isHoveringPicker, setIsHoveringPicker] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimer, setLeaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [hoverTimer, leaveTimer]);
  
  // Handle showing reaction picker with delay to prevent flickering
  const handleMessageMouseEnter = () => {
    // Don't show reaction picker for own messages
    if (message.isCurrentUser) {
      return;
    }
    
    setIsHoveringMessage(true);
    
    // Clear any existing leave timer
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      setLeaveTimer(null);
    }
    
    // Set a short delay before showing picker to prevent flickering
    const timer = setTimeout(() => {
      setReactionMessageId(message.id);
      setShowEmojiPicker(true);
    }, 300);
    
    setHoverTimer(timer);
  };
  
  // Handle mouse leaving message bubble
  const handleMessageMouseLeave = () => {
    setIsHoveringMessage(false);
    
    // Clear any existing hover timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    
    // Only hide picker if not hovering over the picker itself after a short delay
    const timer = setTimeout(() => {
      if (!isHoveringPicker) {
        setShowEmojiPicker(false);
      }
    }, 300);
    
    setLeaveTimer(timer);
  };
  
  // Handle mouse entering reaction picker
  const handlePickerMouseEnter = () => {
    setIsHoveringPicker(true);
    
    // Clear any existing leave timer
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      setLeaveTimer(null);
    }
  };
  
  // Handle mouse leaving reaction picker
  const handlePickerMouseLeave = () => {
    setIsHoveringPicker(false);
    
    // Only hide if not hovering over the message after a short delay
    const timer = setTimeout(() => {
      if (!isHoveringMessage) {
        setShowEmojiPicker(false);
      }
    }, 300);
    
    setLeaveTimer(timer);
  };
  
  // Handle emoji selection
  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Add the reaction
    onAddReaction(message.id, emoji);
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
        <Avatar className={`h-8 w-8 ${message.isCurrentUser ? "ml-2" : "mr-2"}`}>
          <AvatarImage src={message.avatar} alt={message.sender} />
          <AvatarFallback>{message.sender[0]}</AvatarFallback>
        </Avatar>
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
            handlePickerMouseEnter={handlePickerMouseEnter}
            handlePickerMouseLeave={handlePickerMouseLeave}
          />
          <div
            className={`flex text-xs text-muted-foreground mt-1 ${
              message.isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            <span>
              {new Date(message.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
