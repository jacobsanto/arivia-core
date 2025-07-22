
import { useState, useCallback, useRef } from "react";

export function useTypingIndicator(channelId: string = 'general') {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers([]);
    }, 3000);
  }, []);

  const clearTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTypingUsers([]);
  }, []);

  const addTypingUser = useCallback((username: string) => {
    setTypingUsers(prev => {
      if (!prev.includes(username)) {
        return [...prev, username];
      }
      return prev;
    });
  }, []);

  const removeTypingUser = useCallback((username: string) => {
    setTypingUsers(prev => prev.filter(user => user !== username));
  }, []);

  return {
    typingStatus: typingUsers,
    handleTyping,
    clearTyping,
    addTypingUser,
    removeTypingUser
  };
}
