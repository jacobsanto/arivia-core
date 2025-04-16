
import { useState, useEffect } from "react";

export const useMessageHover = () => {
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
  
  const handleMessageMouseEnter = (
    messageId: string,
    isCurrentUser: boolean,
    setReactionMessageId: (id: string | null) => void,
    setShowEmojiPicker: (show: boolean) => void
  ) => {
    // Don't show reaction picker for own messages
    if (isCurrentUser) {
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
      setReactionMessageId(messageId);
      setShowEmojiPicker(true);
    }, 300);
    
    setHoverTimer(timer);
  };
  
  const handleMessageMouseLeave = (setShowEmojiPicker: (show: boolean) => void) => {
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
  
  const handlePickerMouseEnter = () => {
    setIsHoveringPicker(true);
    
    // Clear any existing leave timer
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      setLeaveTimer(null);
    }
  };
  
  const handlePickerMouseLeave = (setShowEmojiPicker: (show: boolean) => void) => {
    setIsHoveringPicker(false);
    
    // Only hide if not hovering over the message after a short delay
    const timer = setTimeout(() => {
      if (!isHoveringMessage) {
        setShowEmojiPicker(false);
      }
    }, 300);
    
    setLeaveTimer(timer);
  };

  return {
    isHoveringMessage,
    setIsHoveringMessage,
    isHoveringPicker,
    handleMessageMouseEnter,
    handleMessageMouseLeave,
    handlePickerMouseEnter,
    handlePickerMouseLeave
  };
};
