
import { useState } from "react";

export const useTypingIndicator = () => {
  const [typingStatus, setTypingStatus] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setTypingStatus("typing...");
    
    const timeout = setTimeout(() => {
      setTypingStatus("");
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  return {
    typingStatus,
    handleTyping,
    clearTyping: () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      setTypingStatus("");
    }
  };
};
