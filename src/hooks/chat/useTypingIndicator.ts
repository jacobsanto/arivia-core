
import { useState, useCallback, useEffect } from "react";

interface UseTypingIndicatorOptions {
  timeoutDuration?: number;
}

export const useTypingIndicator = (options: UseTypingIndicatorOptions = {}) => {
  const { timeoutDuration = 3000 } = options;
  const [typingStatus, setTypingStatus] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Handle typing event
  const handleTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setTypingStatus("typing...");
    
    const timeout = setTimeout(() => {
      setTypingStatus("");
    }, timeoutDuration);
    
    setTypingTimeout(timeout);
  }, [timeoutDuration, typingTimeout]);

  // Clear typing indicator
  const clearTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setTypingStatus("");
  }, [typingTimeout]);

  return {
    typingStatus,
    handleTyping,
    clearTyping
  };
};
