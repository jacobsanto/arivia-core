
import { useState } from "react";

export const useMessageHover = () => {
  const [isHoveringMessage, setIsHoveringMessage] = useState<boolean>(false);
  const [hoverTimer, setHoverTimer] = useState<number | null>(null);
  
  const handleMessageMouseEnter = (
    messageId: string,
    isCurrentUserMessage: boolean,
    setReactionMessageId: (id: string | null) => void,
    setShowEmojiPicker: (show: boolean) => void
  ) => {
    if (isCurrentUserMessage) return;
    
    setIsHoveringMessage(true);
    
    // Clear any existing timer
    if (hoverTimer) {
      window.clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    
    // Set reaction message ID and show emoji picker after a brief delay
    const timer = window.setTimeout(() => {
      setReactionMessageId(messageId);
      setShowEmojiPicker(true);
    }, 500); // 500ms delay before showing emoji picker
    
    setHoverTimer(timer as unknown as number);
  };
  
  const handleMessageMouseLeave = (setShowEmojiPicker: (show: boolean) => void) => {
    setIsHoveringMessage(false);
    
    // Clear any existing timer
    if (hoverTimer) {
      window.clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    
    // Hide emoji picker after a delay to allow mouseover on it
    const timer = window.setTimeout(() => {
      setShowEmojiPicker(false);
    }, 300); // 300ms delay before hiding emoji picker
    
    setHoverTimer(timer as unknown as number);
  };
  
  const handlePickerMouseEnter = () => {
    // Clear any existing timer
    if (hoverTimer) {
      window.clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };
  
  const handlePickerMouseLeave = (setShowEmojiPicker: (show: boolean) => void) => {
    // Hide emoji picker immediately when mouse leaves it
    setShowEmojiPicker(false);
  };
  
  return {
    isHoveringMessage,
    setIsHoveringMessage,
    handleMessageMouseEnter,
    handleMessageMouseLeave,
    handlePickerMouseEnter,
    handlePickerMouseLeave
  };
};
